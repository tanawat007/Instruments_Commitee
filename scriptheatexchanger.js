// script.js
 
// ⚠️ สำคัญมาก: นำ URL ที่ได้จากการ Deploy ในขั้นตอนที่ 2 มาวางที่นี่
// คำแนะนำ: Deploy Google Apps Script แบบ "Anyone can access" แล้วนำ URL มาใส่ตรงนี้
const ORIGINAL_URL = 'https://script.google.com/macros/s/AKfycbx9kIX5wokvSXXh573ro2k5WjMROssr6m9QOZ1Gj5EvqNk5chMSYPHI2bdUwq6oC09D/exec';
 
 
// ใช้ URL โดยตรงจาก Google Apps Script
const WEB_APP_URL = ORIGINAL_URL;
 
// --- DOM Elements: ประกาศตัวแปร ---
const form = document.getElementById('data-form');
const recordIdInput = document.getElementById('record-id');
const equipmentnumberInput = document.getElementById('equipmentnumber');
const plantInput = document.getElementById('plant') || document.getElementById('keepingArea');
const typedirectionInput = document.getElementById('typedirection');
const typefrontendInput = document.getElementById('typefrontend');
const typeshellInput = document.getElementById('typeshell');
const typerearendInput = document.getElementById('typerearend');
const weightallkgInput = document.getElementById('weightallkg');
const weightbundlekgInput = document.getElementById('weightbundlekg');
const insulationshellsideInput = document.getElementById('insulationshellside');
const insylationtubesideInput = document.getElementById('insylationtubeside');
const bundledescriptiondiameterInput = document.getElementById('bundledescriptiondiameter');
const bundledescriptionlengthInput = document.getElementById('bundledescriptionlength');
const tubedescriptionoutsidediameterInput = document.getElementById('tubedescriptionoutsidediameter');
const tubedescriptionthicknessInput = document.getElementById('tubedescriptionthickness');
const tubedescriptionlengthInput = document.getElementById('tubedescriptionlength');
const tubedescriptionquantityInput = document.getElementById('tubedescriptionquantity');
const nozzleshellsideinletsizeInput = document.getElementById('nozzleshellsideinletsize');
const nozzleshellsideinletpsiInput = document.getElementById('nozzleshellsideinletpsi');
const nozzleshellsideoutletsizeInput = document.getElementById('nozzleshellsideoutletsize');
const nozzleshellsideoutletpsiInput = document.getElementById('nozzleshellsideoutletpsi');
const nozzletubesideinletsizeInput = document.getElementById('nozzletubesideinletsize');
const nozzletubesideinletpsiInput = document.getElementById('nozzletubesideinletpsi');
const nozzletubesideoutletsizeInput = document.getElementById('nozzletubesideoutletsize');
const nozzletubesideoutletpsiInput = document.getElementById('nozzletubesideoutletpsi');
const cranetonInput = document.getElementById('craneton');
const cranedayInput = document.getElementById('craneday');
const neutralizeshellsideInput = document.getElementById('neutralizeshellside');
const neutralizetubesideInput = document.getElementById('neutralizetubeside');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tableBody = document.getElementById('table-body');
const loadingDiv = document.getElementById('loading');
const dataTable = document.getElementById('data-table');
 
// --- Pagination Variables : ประกาศตัวแปร ---
let currentPage = 1;
const itemsPerPage = 10;
let allData = [];
let filteredData = [];
let totalPages = 0;
 
const paginationDiv = document.getElementById('pagination');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const prevMobile = document.getElementById('prev-mobile');
const nextMobile = document.getElementById('next-mobile');
const pageNumbersDiv = document.getElementById('page-numbers');
const showingStart = document.getElementById('showing-start');
const showingEnd = document.getElementById('showing-end');
const totalItems = document.getElementById('total-items');
 
 
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}
 
// --- Utility: Date helpers ---
function parseDate(val) {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}
 
function daysUntil(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d - today) / (1000 * 60 * 60 * 24));
}
 
function formatDate(val) {
  const d = parseDate(val);
  if (!d) return '-';
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' });
}
 
// แปลงวันที่ให้อยู่ในรูป YYYY-MM-DD สำหรับ <input type="date">
function toInputDate(val) {
  const d = parseDate(val);
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
 
function getExpiryBadge(dateStr) {
  const days = daysUntil(dateStr);
  if (days === null) return '<span class="badge badge-ghost badge-sm">ไม่ระบุ</span>';
  if (days < 0) return `<span class="badge badge-error badge-sm gap-1 badge-expired"><i class="fa-solid fa-circle-xmark text-[10px]"></i> หมดอายุแล้ว</span>`;
  if (days <= 30) return `<span class="badge badge-warning badge-sm gap-1"><i class="fa-solid fa-triangle-exclamation text-[10px]"></i> อีก ${days} วัน</span>`;
  return `<span class="badge badge-success badge-sm gap-1"><i class="fa-solid fa-circle-check text-[10px]"></i> ${formatDate(dateStr)}</span>`;
}
 
// --- Stats ---
function updateStats() {
  const total = allData.length;
  let expiring = 0;
  let expired = 0;
  const areasSet = new Set();
 
  allData.forEach(row => {
    if (row.ExpiredDate) {
      const days = daysUntil(row.ExpiredDate);
      if (days !== null) {
        if (days < 0) expired++;
        else if (days <= 30) expiring++;
      }
    }
    const area = (row.plant || row.KeepingArea || '').trim();
    if (area) areasSet.add(area);
  });
 
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  setEl('stat-total', total);
  setEl('stat-expiring', expiring);
  setEl('stat-expired', expired);
  setEl('stat-areas', areasSet.size);
  setEl('badge-count', total);
 
  // Populate area filter
  const filterArea = document.getElementById('filter-area');
  if (filterArea) {
    const current = filterArea.value;
    filterArea.innerHTML = '<option value="">ทุกพื้นที่</option>';
    [...areasSet].sort().forEach(area => {
      const opt = document.createElement('option');
      opt.value = area;
      opt.textContent = area;
      filterArea.appendChild(opt);
    });
    filterArea.value = current;
  }
}
 
// --- Search & Filter ---
function handleSearch() {
  currentPage = 1;
  applyFilters();
}
 
function handleFilter() {
  currentPage = 1;
  applyFilters();
}
 
function applyFilters() {
  const searchDesktop = document.getElementById('search-input');
  const searchMobile = document.getElementById('search-input-mobile');
  const query = (searchDesktop?.value || searchMobile?.value || '').trim().toLowerCase();
  const areaFilter = document.getElementById('filter-area')?.value || '';
  const statusFilter = document.getElementById('filter-status')?.value || '';
 
  filteredData = allData.filter(row => {
    // Search
    if (query) {
      const searchFields = [
        row.equipmentnumber,
        row.plant,
        row.typedirection,
        row.typefrontend,
        row.typeshell,
        row.typerearend,
        row.weightallkg,
        row.weightbundlekg,
        row.insulationshellside,
        row.insylationtubeside,
        row.bundledescriptiondiameter,
        row.bundledescriptionlength,
        row.tubedescriptionoutsidediameter,
        row.tubedescriptionthickness,
        row.tubedescriptionlength,
        row.tubedescriptionquantity,
        row.nozzleshellsideinletsize,
        row.nozzleshellsideinletpsi,
        row.nozzleshellsideoutletsize,
        row.nozzleshellsideoutletpsi,
        row.nozzletubesideinletsize,
        row.nozzletubesideinletpsi,
        row.nozzletubesideoutletsize,
        row.nozzletubesideoutletpsi,
        row.craneton,
        row.craneday,
        row.neutralizeshellside,
        row.neutralizetubeside
      ].map(v => String(v || '').toLowerCase());
      if (!searchFields.some(f => f.includes(query))) return false;
    }
    // Area filter
    if (areaFilter && ((row.plant || row.KeepingArea || '').trim() !== areaFilter)) return false;
    // Status filter
    if (statusFilter) {
      const days = daysUntil(row.ExpiredDate);
      if (statusFilter === 'expired' && (days === null || days >= 0)) return false;
      if (statusFilter === 'expiring' && (days === null || days < 0 || days > 30)) return false;
      if (statusFilter === 'active' && (days !== null && days < 0)) return false;
    }
    return true;
  });
 
  totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;
  renderTable();
  updatePagination();
}
 
// Sync search inputs
document.getElementById('search-input')?.addEventListener('input', handleSearch);
document.getElementById('search-input-mobile')?.addEventListener('input', function () {
  const other = document.getElementById('search-input');
  if (other) other.value = this.value;
  handleSearch();
});
 
// --- Functions ---
 
// 1. ดึงข้อมูลทั้งหมดจาก Google Sheet
async function fetchData() {
  showLoading(true);
  try {
    console.log('Fetching data from:', WEB_APP_URL);
    const response = await fetch(WEB_APP_URL + '?action=read&t=' + Date.now(), {
      method: 'GET',
      redirect: 'follow'
    });
    console.log('Fetch response status:', response.status);
    const result = await response.json();
    console.log('Fetch result:', result);
 
    if (result.success) {
      allData = result.data;
      filteredData = [...allData];
      totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
      currentPage = 1;
      updateStats();
      applyFilters();
    } else {
      console.error('Error fetching data:', result.message);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: result.message,
        confirmButtonColor: '#6366f1'
      });
    }
  } catch (error) {
    console.error('Fetch Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'ไม่สามารถเชื่อมต่อได้',
      text: error.message,
      confirmButtonColor: '#6366f1'
    });
  } finally {
    showLoading(false);
  }
}
 
// 2. แสดงข้อมูลในตาราง (พร้อม pagination)
function renderTable() {
  if (!tableBody) return;
  tableBody.innerHTML = '';
 
  const emptyState = document.getElementById('empty-state');
 
  if (filteredData.length === 0) {
    if (emptyState) emptyState.classList.replace('hidden', 'flex');
    if (paginationDiv) paginationDiv.classList.add('hidden');
    return;
  }
 
  if (emptyState) emptyState.classList.replace('flex', 'hidden');
 
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredData.length);
  const pageData = filteredData.slice(startIndex, endIndex);
  const noImageUrl = 'images/noimage.svg';
 
  pageData.forEach((row) => {
    const tr = document.createElement('tr');
    tr.className = 'table-row-hover transition-colors';
 
    tr.innerHTML = `
      <td class="font-mono font-semibold text-primary text-sm">${escapeHtml(row.equipmentnumber || '-')}</td>
      <td>
        <span class="badge badge-outline badge-secondary badge-sm gap-1">
          <i class="fa-solid fa-location-dot text-[10px]"></i> ${escapeHtml(row.plant || row.KeepingArea || '-')}
        </span>
      </td>
      <td class="font-semibold text-sm">${escapeHtml(row.typedirection || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.typefrontend || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.typeshell || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.typerearend || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.bundledescriptiondiameter || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.bundledescriptionlength || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.tubedescriptionoutsidediameter || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.tubedescriptionthickness || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.tubedescriptionlength || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.tubedescriptionquantity || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.craneton || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.craneday || '-')}</td>
      <td class="text-right">
        <div class="flex justify-end gap-1">
          <button class="view-btn btn btn-xs btn-ghost text-info tooltip tooltip-left" data-tip="ดูรายละเอียด"
                  data-id="${escapeAttr(row.ID)}"
                  data-equipmentnumber="${escapeAttr(row.equipmentnumber || '')}"
                  data-plant="${escapeAttr(row.plant || row.KeepingArea || '')}"
                  data-typedirection="${escapeAttr(row.typedirection || '')}"
                  data-typefrontend="${escapeAttr(row.typefrontend || '')}"
                  data-typeshell="${escapeAttr(row.typeshell || '')}"
                  data-typerearend="${escapeAttr(row.typerearend || '')}"
                  data-weightallkg="${escapeAttr(row.weightallkg || '')}"
                  data-weightbundlekg="${escapeAttr(row.weightbundlekg || '')}"
                  data-insulationshellside="${escapeAttr(row.insulationshellside || '')}"
                  data-insylationtubeside="${escapeAttr(row.insylationtubeside || '')}"
                  data-bundledescriptiondiameter="${escapeAttr(row.bundledescriptiondiameter || '')}"
                  data-bundledescriptionlength="${escapeAttr(row.bundledescriptionlength || '')}"
                  data-tubedescriptionoutsidediameter="${escapeAttr(row.tubedescriptionoutsidediameter || '')}"
                  data-tubedescriptionthickness="${escapeAttr(row.tubedescriptionthickness || '')}"
                  data-tubedescriptionlength="${escapeAttr(row.tubedescriptionlength || '')}"
                  data-tubedescriptionquantity="${escapeAttr(row.tubedescriptionquantity || '')}"
                  data-nozzleshellsideinletsize="${escapeAttr(row.nozzleshellsideinletsize || '')}"
                  data-nozzleshellsideinletpsi="${escapeAttr(row.nozzleshellsideinletpsi || '')}"
                  data-nozzleshellsideoutletsize="${escapeAttr(row.nozzleshellsideoutletsize || '')}"
                  data-nozzleshellsideoutletpsi="${escapeAttr(row.nozzleshellsideoutletpsi || '')}"
                  data-nozzletubesideinletsize="${escapeAttr(row.nozzletubesideinletsize || '')}"
                  data-nozzletubesideinletpsi="${escapeAttr(row.nozzletubesideinletpsi || '')}"
                  data-nozzletubesideoutletsize="${escapeAttr(row.nozzletubesideoutletsize || '')}"
                  data-nozzletubesideoutletpsi="${escapeAttr(row.nozzletubesideoutletpsi || '')}"
                  data-craneton="${escapeAttr(row.craneton || '')}"
                  data-craneday="${escapeAttr(row.craneday || '')}"
                  data-neutralizeshellside="${escapeAttr(row.neutralizeshellside || '')}"
                  data-neutralizetubeside="${escapeAttr(row.neutralizetubeside || '')}">
            <i class="fa-solid fa-eye"></i>
          </button>
          ${canEdit() ? `
          <button class="edit-btn btn btn-xs btn-ghost text-primary tooltip tooltip-left" data-tip="แก้ไข"
                  data-equipmentnumber="${escapeAttr(row.equipmentnumber || '')}"
                  data-plant="${escapeAttr(row.plant || row.KeepingArea || '')}"
                  data-typedirection="${escapeAttr(row.typedirection || '')}"
                  data-typefrontend="${escapeAttr(row.typefrontend || '')}"
                  data-typeshell="${escapeAttr(row.typeshell || '')}"
                  data-typerearend="${escapeAttr(row.typerearend || '')}"
                  data-weightallkg="${escapeAttr(row.weightallkg || '')}"
                  data-weightbundlekg="${escapeAttr(row.weightbundlekg || '')}"
                  data-insulationshellside="${escapeAttr(row.insulationshellside || '')}"
                  data-insylationtubeside="${escapeAttr(row.insylationtubeside || '')}"
                  data-bundledescriptiondiameter="${escapeAttr(row.bundledescriptiondiameter || '')}"
                  data-bundledescriptionlength="${escapeAttr(row.bundledescriptionlength || '')}"
                  data-tubedescriptionoutsidediameter="${escapeAttr(row.tubedescriptionoutsidediameter || '')}"
                  data-tubedescriptionthickness="${escapeAttr(row.tubedescriptionthickness || '')}"
                  data-tubedescriptionlength="${escapeAttr(row.tubedescriptionlength || '')}"
                  data-tubedescriptionquantity="${escapeAttr(row.tubedescriptionquantity || '')}"
                  data-nozzleshellsideinletsize="${escapeAttr(row.nozzleshellsideinletsize || '')}"
                  data-nozzleshellsideinletpsi="${escapeAttr(row.nozzleshellsideinletpsi || '')}"
                  data-nozzleshellsideoutletsize="${escapeAttr(row.nozzleshellsideoutletsize || '')}"
                  data-nozzleshellsideoutletpsi="${escapeAttr(row.nozzleshellsideoutletpsi || '')}"
                  data-nozzletubesideinletsize="${escapeAttr(row.nozzletubesideinletsize || '')}"
                  data-nozzletubesideinletpsi="${escapeAttr(row.nozzletubesideinletpsi || '')}"
                  data-nozzletubesideoutletsize="${escapeAttr(row.nozzletubesideoutletsize || '')}"
                  data-nozzletubesideoutletpsi="${escapeAttr(row.nozzletubesideoutletpsi || '')}"
                  data-craneton="${escapeAttr(row.craneton || '')}"
                  data-craneday="${escapeAttr(row.craneday || '')}"
                  data-neutralizeshellside="${escapeAttr(row.neutralizeshellside || '')}"
                  data-neutralizetubeside="${escapeAttr(row.neutralizetubeside || '')}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          ` : ''}
          ${canDelete() ? `
          <button class="delete-btn btn btn-xs btn-ghost text-error tooltip tooltip-left" data-tip="ลบ"
            data-id="${escapeAttr(row.ID)}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
          ` : ''}
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
 
  // Event listeners
  document.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      if (!canEdit()) {
        showPermissionDenied('แก้ไขข้อมูล');
        return;
      }
      editRecord(this.dataset);
    });
  });
 
  document.querySelectorAll('.view-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      viewRecord(this.dataset);
    });
  });
 
  document.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      if (!canDelete()) {
        showPermissionDenied('ลบข้อมูล');
        return;
      }
      deleteRecord(this.dataset.id);
    });
  });
}
 
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
 
function escapeAttr(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
 
// 3. จัดการการ submit ฟอร์ม (ทั้งสร้างและแก้ไข)
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const recordId = recordIdInput.value;
    const isUpdating = !!recordId;
 
    // เตรียมข้อมูล
    const params = {
      action: isUpdating ? 'update' : 'create',
      equipmentnumber: equipmentnumberInput?.value.trim() || '',
      plant: plantInput?.value.trim() || '',
      typedirection: typedirectionInput?.value.trim() || '',
      typefrontend: typefrontendInput?.value.trim() || '',
      typeshell: typeshellInput?.value.trim() || '',
      typerearend: typerearendInput?.value.trim() || '',
      weightallkg: weightallkgInput?.value.trim() || '',
      weightbundlekg: weightbundlekgInput?.value.trim() || '',
      insulationshellside: insulationshellsideInput?.value.trim() || '',
      insylationtubeside: insylationtubesideInput?.value.trim() || '',
      bundledescriptiondiameter: bundledescriptiondiameterInput?.value.trim() || '',
      bundledescriptionlength: bundledescriptionlengthInput?.value.trim() || '',
      tubedescriptionoutsidediameter: tubedescriptionoutsidediameterInput?.value.trim() || '',
      tubedescriptionthickness: tubedescriptionthicknessInput?.value.trim() || '',
      tubedescriptionlength: tubedescriptionlengthInput?.value.trim() || '',
      tubedescriptionquantity: tubedescriptionquantityInput?.value.trim() || '',
      nozzleshellsideinletsize: nozzleshellsideinletsizeInput?.value.trim() || '',
      nozzleshellsideinletpsi: nozzleshellsideinletpsiInput?.value.trim() || '',
      nozzleshellsideoutletsize: nozzleshellsideoutletsizeInput?.value.trim() || '',
      nozzleshellsideoutletpsi: nozzleshellsideoutletpsiInput?.value.trim() || '',
      nozzletubesideinletsize: nozzletubesideinletsizeInput?.value.trim() || '',
      nozzletubesideinletpsi: nozzletubesideinletpsiInput?.value.trim() || '',
      nozzletubesideoutletsize: nozzletubesideoutletsizeInput?.value.trim() || '',
      nozzletubesideoutletpsi: nozzletubesideoutletpsiInput?.value.trim() || '',
      craneton: cranetonInput?.value.trim() || '',
      craneday: cranedayInput?.value.trim() || '',
      neutralizeshellside: neutralizeshellsideInput?.value.trim() || '',
      neutralizetubeside: neutralizetubesideInput?.value.trim() || ''
    };
 
    if (isUpdating) {
      params.id = recordId;
    }
 
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> กำลังบันทึก...';
 
    try {
      console.log('Sending data:', params);
 
      // ใช้ POST เพื่อรองรับ payload ขนาดใหญ่ (เช่น base64 image)
      // ใช้ Content-Type: text/plain เพื่อหลีกเลี่ยง CORS preflight
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(params),
        redirect: 'follow'
      });
 
      console.log('Response status:', response.status);
 
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }
 
      const result = await response.json();
      console.log('Response data:', result);
 
      if (result && result.success === true) {
        console.log('บันทึกสำเร็จ');
 
        // Toast success
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 2000,
          timerProgressBar: true,
          iconColor: '#22c55e',
          customClass: {
            popup: 'colored-toast'
          },
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
 
        await Toast.fire({
          icon: 'success',
          title: isUpdating ? 'แก้ไขข้อมูลสำเร็จ!' : 'เพิ่มข้อมูลสำเร็จ!',
          text: 'กำลังกลับไปหน้าหลัก...'
        });
 
        resetForm();
 
        // Redirect กลับไปหน้าหลัก Heat Exchanger
        window.location.href = '102_heatexchanger.html';
 
      } else {
        const errorMsg = result.message || 'ไม่สามารถบันทึกข้อมูลได้';
        const ToastError = Swal.mixin({
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          iconColor: '#ef4444',
          customClass: {
            popup: 'colored-toast'
          }
        });
        await ToastError.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: errorMsg
        });
        console.error('Error from server:', errorMsg);
      }
    } catch (error) {
      console.error('Submit Error:', error);
      const ToastError = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        iconColor: '#ef4444',
        customClass: {
          popup: 'colored-toast'
        }
      });
      await ToastError.fire({
        icon: 'error',
        title: 'ไม่สามารถเชื่อมต่อได้',
        text: error.message
      });
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> บันทึกข้อมูล';
    }
  });
}
 
// 4. เตรียมฟอร์มสำหรับแก้ไข
function editRecord(record) {
  // ถ้าอยู่หน้า index ให้ redirect ไปหน้า createForm โดยเก็บข้อมูลใน sessionStorage
  // (ไม่ใช้ query params เพราะข้อมูลเช่น base64 image ทำให้ URL ยาวเกินไป → 431 error)
  if (!form) {
    sessionStorage.setItem('editRecord', JSON.stringify(record));
    window.location.href = 'createform_heatexchanger.html?edit=1';
    return;
  }
 
  recordIdInput.value = record.id || record.ID || '';
  if (equipmentnumberInput) equipmentnumberInput.value = record.equipmentnumber || '';
  if (plantInput) plantInput.value = record.plant || record.Plant || record.KeepingArea || '';
  if (typedirectionInput) typedirectionInput.value = record.typedirection || '';
  if (typefrontendInput) typefrontendInput.value = record.typefrontend || '';
  if (typeshellInput) typeshellInput.value = record.typeshell || '';
  if (typerearendInput) typerearendInput.value = record.typerearend || '';
  if (weightallkgInput) weightallkgInput.value = record.weightallkg || '';
  if (weightbundlekgInput) weightbundlekgInput.value = record.weightbundlekg || '';
  if (insulationshellsideInput) insulationshellsideInput.value = record.insulationshellside || '';
  if (insylationtubesideInput) insylationtubesideInput.value = record.insylationtubeside || '';
  if (bundledescriptiondiameterInput) bundledescriptiondiameterInput.value = record.bundledescriptiondiameter || '';
  if (bundledescriptionlengthInput) bundledescriptionlengthInput.value = record.bundledescriptionlength || '';
  if (tubedescriptionoutsidediameterInput) tubedescriptionoutsidediameterInput.value = record.tubedescriptionoutsidediameter || '';
  if (tubedescriptionthicknessInput) tubedescriptionthicknessInput.value = record.tubedescriptionthickness || '';
  if (tubedescriptionlengthInput) tubedescriptionlengthInput.value = record.tubedescriptionlength || '';
  if (tubedescriptionquantityInput) tubedescriptionquantityInput.value = record.tubedescriptionquantity || '';
  if (nozzleshellsideinletsizeInput) nozzleshellsideinletsizeInput.value = record.nozzleshellsideinletsize || '';
  if (nozzleshellsideinletpsiInput) nozzleshellsideinletpsiInput.value = record.nozzleshellsideinletpsi || '';
  if (nozzleshellsideoutletsizeInput) nozzleshellsideoutletsizeInput.value = record.nozzleshellsideoutletsize || '';
  if (nozzleshellsideoutletpsiInput) nozzleshellsideoutletpsiInput.value = record.nozzleshellsideoutletpsi || '';
  if (nozzletubesideinletsizeInput) nozzletubesideinletsizeInput.value = record.nozzletubesideinletsize || '';
  if (nozzletubesideinletpsiInput) nozzletubesideinletpsiInput.value = record.nozzletubesideinletpsi || '';
  if (nozzletubesideoutletsizeInput) nozzletubesideoutletsizeInput.value = record.nozzletubesideoutletsize || '';
  if (nozzletubesideoutletpsiInput) nozzletubesideoutletpsiInput.value = record.nozzletubesideoutletpsi || '';
  if (cranetonInput) cranetonInput.value = record.craneton || ''; 
  if (cranedayInput) cranedayInput.value = record.craneday || '';
  if (neutralizeshellsideInput) neutralizeshellsideInput.value = record.neutralizeshellside || '';
  if (neutralizetubesideInput) neutralizetubesideInput.value = record.neutralizetubeside || '';
 
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> อัปเดตข้อมูล';
  if (cancelBtn) cancelBtn.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
 
// Auto-fill form from sessionStorage (when redirected from index for editing)
if (form) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('edit')) {
    const saved = sessionStorage.getItem('editRecord');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        editRecord(data);
        sessionStorage.removeItem('editRecord');
      } catch (e) {
        console.error('Error parsing edit data:', e);
      }
    }
  }
}
 
// 5. ลบข้อมูล
async function deleteRecord(id) {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ',
    html: '<p class="text-slate-500">คุณต้องการลบข้อมูล Heat Exchanger นี้ใช่หรือไม่?</p><p class="text-xs text-red-400 mt-2">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: '<i class="fa-solid fa-trash-can mr-1"></i> ลบข้อมูล',
    cancelButtonText: 'ยกเลิก'
  });
 
  if (!result.isConfirmed) return;
 
  try {
    console.log('Deleting record:', id);
    const params = new URLSearchParams({ action: 'delete', id });
    const url = `${WEB_APP_URL}?${params.toString()}`;
 
    const response = await fetch(url, { method: 'GET', redirect: 'follow' });
    const deleteResult = await response.json();
    console.log('Delete Response:', deleteResult);
 
    if (deleteResult.success) {
      await fetchData();
      Swal.fire({
        icon: 'success',
        title: 'ลบสำเร็จ!',
        text: 'ลบข้อมูลเรียบร้อยแล้ว',
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'ไม่สามารถลบได้',
        text: deleteResult.message || 'เกิดข้อผิดพลาด',
        confirmButtonColor: '#6366f1'
      });
    }
  } catch (error) {
    console.error('Delete Error:', error);
    Swal.fire({
      icon: 'error',
      title: 'เกิดข้อผิดพลาด',
      text: error.message,
      confirmButtonColor: '#6366f1'
    });
  }
}
 
// 6. ยกเลิกการแก้ไข
cancelBtn?.addEventListener('click', resetForm);
 
function resetForm() {
  if (form) form.reset();
  if (recordIdInput) recordIdInput.value = '';
  if (submitBtn) submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> บันทึกข้อมูล';
  if (cancelBtn) cancelBtn.classList.add('hidden');
  document.getElementById('preview-before')?.classList.add('hidden');
  // Clear URL params
  if (window.location.search) {
    window.history.replaceState({}, '', window.location.pathname);
  }
}
 
// 7. จัดการสถานะ Loading
function showLoading(isLoading) {
  const emptyState = document.getElementById('empty-state');
  if (isLoading) {
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (dataTable) dataTable.classList.add('hidden');
    if (paginationDiv) paginationDiv.classList.add('hidden');
    if (emptyState) emptyState.classList.replace('flex', 'hidden');
  } else {
    if (loadingDiv) loadingDiv.classList.add('hidden');
    if (dataTable) dataTable.classList.remove('hidden');
    if (filteredData.length > 0 && paginationDiv) {
      paginationDiv.classList.remove('hidden');
    }
  }
}
 
// --- Pagination Functions ---
function updatePagination() {
  if (!showingStart || !showingEnd || !totalItems) return;
 
  const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);
 
  showingStart.textContent = startItem;
  showingEnd.textContent = endItem;
  totalItems.textContent = filteredData.length;
 
  // Mobile indicator
  const mobileIndicator = document.getElementById('page-indicator-mobile');
  if (mobileIndicator) mobileIndicator.textContent = `${currentPage} / ${totalPages}`;
 
  // Disable/enable buttons
  [prevBtn, prevMobile].forEach(btn => {
    if (!btn) return;
    btn.disabled = currentPage === 1;
    btn.classList.toggle('btn-disabled', currentPage === 1);
  });
  [nextBtn, nextMobile].forEach(btn => {
    if (!btn) return;
    btn.disabled = currentPage === totalPages;
    btn.classList.toggle('btn-disabled', currentPage === totalPages);
  });
 
  renderPageNumbers();
}
 
function renderPageNumbers() {
  if (!pageNumbersDiv) return;
  pageNumbersDiv.innerHTML = '';
 
  const maxButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
 
  if (endPage - startPage < maxButtons - 1) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }
 
  if (startPage > 1) {
    addPageButton(1);
    if (startPage > 2) addEllipsis();
  }
 
  for (let i = startPage; i <= endPage; i++) {
    addPageButton(i);
  }
 
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) addEllipsis();
    addPageButton(totalPages);
  }
}
 
function addPageButton(pageNum) {
  const button = document.createElement('button');
  button.textContent = pageNum;
 
  if (pageNum === currentPage) {
    button.className = 'join-item btn btn-sm btn-primary';
  } else {
    button.className = 'join-item btn btn-sm';
    button.onclick = () => goToPage(pageNum);
  }
 
  pageNumbersDiv.appendChild(button);
}
 
function addEllipsis() {
  const span = document.createElement('span');
  span.className = 'join-item btn btn-sm btn-disabled';
  span.textContent = '...';
  pageNumbersDiv.appendChild(span);
}
 
function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  currentPage = page;
  renderTable();
  updatePagination();
  window.scrollTo({ top: 200, behavior: 'smooth' });
}
 
function nextPage() { if (currentPage < totalPages) goToPage(currentPage + 1); }
function prevPage() { if (currentPage > 1) goToPage(currentPage - 1); }
 
// Page event listeners
prevBtn?.addEventListener('click', prevPage);
nextBtn?.addEventListener('click', nextPage);
prevMobile?.addEventListener('click', prevPage);
nextMobile?.addEventListener('click', nextPage);
 
// --- Initial Load ---
document.addEventListener('DOMContentLoaded', function() {
  if (!checkUserPermissions()) return;

  hideButtonsBasedOnPermissions();
  fetchData();
});
 
// ฟังก์ชันแสดงรายละเอียด Pump REDV
function viewRecord(data) {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
 
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '-'; };
  const setHtml = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };
 
  // Basic info
  setEl('detail-code', data.equipmentnumber || '-');
  setEl('detail-description', data.typeshell || '-');

  // Basic Information
  setEl('detail-id', data.ID || data.id || '-');
  setEl('detail-equipmentnumber', data.equipmentnumber || '-');
  setEl('detail-plant', data.plant || '-');
  setEl('detail-typedirection', data.typedirection || '-');

  // Heat Exchanger Details
  setEl('detail-typefrontend', data.typefrontend || '-');
  setEl('detail-typeshell', data.typeshell || '-');
  setEl('detail-typerearend', data.typerearend || '-');
  setEl('detail-weightallkg', data.weightallkg || '-');
  setEl('detail-weightbundlekg', data.weightbundlekg || '-');
  setEl('detail-insulationshellside', data.insulationshellside || '-');
  setEl('detail-insylationtubeside', data.insylationtubeside || '-');
  setEl('detail-bundledescriptiondiameter', data.bundledescriptiondiameter || '-');
  setEl('detail-bundledescriptionlength', data.bundledescriptionlength || '-');
  setEl('detail-tubedescriptionoutsidediameter', data.tubedescriptionoutsidediameter || '-');
  setEl('detail-tubedescriptionthickness', data.tubedescriptionthickness || '-');
  setEl('detail-tubedescriptionlength', data.tubedescriptionlength || '-');
  setEl('detail-tubedescriptionquantity', data.tubedescriptionquantity || '-');
  setEl('detail-nozzleshellsideinletsize', data.nozzleshellsideinletsize || '-');
  setEl('detail-nozzleshellsideinletpsi', data.nozzleshellsideinletpsi || '-');
  setEl('detail-nozzleshellsideoutletsize', data.nozzleshellsideoutletsize || '-');
  setEl('detail-nozzleshellsideoutletpsi', data.nozzleshellsideoutletpsi || '-');
  setEl('detail-nozzletubesideinletsize', data.nozzletubesideinletsize || '-');
  setEl('detail-nozzletubesideinletpsi', data.nozzletubesideinletpsi || '-');
  setEl('detail-nozzletubesideoutletsize', data.nozzletubesideoutletsize || '-');
  setEl('detail-nozzletubesideoutletpsi', data.nozzletubesideoutletpsi || '-');
  setEl('detail-craneton', data.craneton || '-');
  setEl('detail-craneday', data.craneday || '-');
  setEl('detail-neutralizeshellside', data.neutralizeshellside || '-');
  setEl('detail-neutralizetubeside', data.neutralizetubeside || '-');
  // Expiry badge
  setHtml('detail-expiry-badge', getExpiryBadge(data.expiredDate));
 
  modal.showModal();
}
 
// ฟังก์ชันแสดงรูปภาพขยาย (ใช้ DaisyUI modal ถ้ามี มิฉะนั้นใช้ SweetAlert)
function showImageModal(imageUrl) {
  const modal = document.getElementById('image-modal');
  const modalImg = document.getElementById('modal-image');
 
  if (modal && modalImg) {
    modalImg.src = imageUrl;
    modalImg.onerror = function () { this.src = 'images/noimage.svg'; };
    modal.showModal();
  } else {
    Swal.fire({
      imageUrl: imageUrl,
      imageAlt: 'Chemical Image',
      showConfirmButton: false,
      showCloseButton: true,
      width: '80%',
      background: '#f8fafc',
      customClass: { image: 'rounded-xl' }
    });
  }
}
 