// script.js
 
// ⚠️ สำคัญมาก: นำ URL ที่ได้จากการ Deploy ในขั้นตอนที่ 2 มาวางที่นี่
// คำแนะนำ: Deploy Google Apps Script แบบ "Anyone can access" แล้วนำ URL มาใส่ตรงนี้
const ORIGINAL_URL = 'https://script.google.com/macros/s/AKfycbztuiHTZK96ZMZQ_n_4RdIJVjhdcN5DiaCRnFNg8scQsdFS4YgxhQd9ky7tuyHcP6ud/exec';
 
 
// ใช้ URL โดยตรงจาก Google Apps Script
const WEB_APP_URL = ORIGINAL_URL;
 
// --- DOM Elements: ประกาศตัวแปรตาม Parameter ใหม่ ---
const form = document.getElementById('data-form');
const recordIdInput = document.getElementById('record-id');

// เปลี่ยนชื่อตัวแปรให้ตรงกับ Calibration Parameters
const idNumberInput = document.getElementById('identificationnumber'); // เดิมคือ material_code
const equipmentNameInput = document.getElementById('equipmentname');    // เดิมคือ description
const manufacturerInput = document.getElementById('manufacturer');
const modelInput = document.getElementById('model');
const serialNumberInput = document.getElementById('serialnumber');
const intervalInput = document.getElementById('interval');
const lastCalDateInput = document.getElementById('dateoflastcalibration');
const expiredDateInput = document.getElementById('expireddate');
const specificationInput = document.getElementById('specification'); // เดิมคือ msds/link

const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tableBody = document.getElementById('table-body');
const loadingDiv = document.getElementById('loading');
const dataTable = document.getElementById('data-table');

// --- Pagination & Data ---
let currentPage = 1;
const itemsPerPage = 10;
let allData = [];
let filteredData = [];
let totalPages = 0;

const paginationDiv = document.getElementById('pagination');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');

// --- Utility Functions ---
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
  if (days < 0) return `<span class="badge badge-error badge-sm gap-1"><i class="fa-solid fa-circle-xmark text-[10px]"></i> Overdue</span>`;
  if (days <= 30) return `<span class="badge badge-warning badge-sm gap-1"><i class="fa-solid fa-triangle-exclamation text-[10px]"></i> อีก ${days} วัน</span>`;
  return `<span class="badge badge-success badge-sm gap-1"><i class="fa-solid fa-circle-check text-[10px]"></i> ${formatDate(dateStr)}</span>`;
}

// --- Stats & Filters ---
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


// Sync search inputs
document.getElementById('search-input')?.addEventListener('input', handleSearch);
document.getElementById('search-input-mobile')?.addEventListener('input', function () {
  const other = document.getElementById('search-input');
  if (other) other.value = this.value;
  handleSearch();
});

  totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  if (currentPage > totalPages) currentPage = totalPages;
  renderTable();
  updatePagination();
}
}
}

// --- Main Functions ---

// 1. Fetch Data
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
 
      // เรียงข้อมูลแบบ Descending (ใหม่สุดอยู่บน) โดยใช้ Timestamp
      // เพื่อให้รายการที่เพิ่งบันทึกล่าสุดแสดงเป็นรายการแรกเสมอ
      allData.sort((a, b) => {
        const dateA = new Date(a.Timestamp || 0);
        const dateB = new Date(b.Timestamp || 0);
        return dateB - dateA; // DESC: ใหม่สุดก่อน
      });
 
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

// 2. Render Table
function renderTable() {
  if (!tableBody) return;
  tableBody.innerHTML = '';

  const startIndex = (currentPage - 1) * itemsPerPage;
  const pageData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  pageData.forEach((row) => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-slate-50 transition-colors';

    const specLink = (row.specification || '').trim();
    const specBtn = specLink && specLink !== 'NA' 
      ? `<a href="${escapeAttr(specLink)}" target="_blank" class="btn btn-xs btn-outline btn-info">View</a>` 
      : '<span class="text-slate-300">-</span>';

    tr.innerHTML = `
      <td class="font-mono font-semibold text-primary text-xs">${escapeHtml(row.identificationnumber)}</td>
      <td class="text-sm font-medium">${escapeHtml(row.equipmentname)}</td>
      <td class="text-sm">${escapeHtml(row.manufacturer)}</td>
      <td class="text-sm">${escapeHtml(row.model)}</td>
      <td class="text-sm font-mono">${escapeHtml(row.serialnumber)}</td>
      <td class="text-center">${escapeHtml(row.interval)}</td>
      <td class="text-sm">${formatDate(row.dateoflastcalibration)}</td>
      <td>${getExpiryBadge(row.expireddate)}</td>
      <td>${specBtn}</td>
      <td class="text-right">
        <div class="flex justify-end gap-1">
          <button class="edit-btn btn btn-xs btn-ghost text-primary" onclick='prepareEdit(${JSON.stringify(row)})'>
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="delete-btn btn btn-xs btn-ghost text-error" onclick="deleteRecord('${row.id}')">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// 3. Submit Form (Create/Update)
  if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const recordId = recordIdInput.value;
    const isUpdating = !!recordId;

    const params = {
      action: isUpdating ? 'update' : 'create',
      id: recordId || null,
      identificationnumber: idNumberInput?.value.trim() || '',
      equipmentname: equipmentNameInput?.value.trim() || '',
      manufacturer: manufacturerInput?.value.trim() || '',
      model: modelInput?.value.trim() || '',
      serialnumber: serialNumberInput?.value.trim() || '',
      interval: intervalInput?.value.trim() || '',
      dateoflastcalibration: lastCalDateInput?.value || '',
      expireddate: expiredDateInput?.value || '',
      specification: specificationInput?.value.trim() || ''
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> Saving...';

    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(params)
      });
      const result = await response.json();

      if (result.success) {
        Swal.fire({ icon: 'success', title: 'สำเร็จ!', timer: 1500, showConfirmButton: false });
        resetForm();
        if (!isUpdating) window.location.href = '071_toolinstrument.html';
        else fetchData();
      }
    } catch (error) {
      console.error('Submit Error:', error);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> บันทึกข้อมูล';
    }
  });
}

// 4. Edit Record
function prepareEdit(row) {
  if (!form) {
    sessionStorage.setItem('editRecord', JSON.stringify(row));
    window.location.href = 'createform_toolinstrument.html?edit=1';
    return;
  }

  recordIdInput.value = row.id;
  idNumberInput.value = row.identificationnumber || '';
  equipmentNameInput.value = row.equipmentname || '';
  manufacturerInput.value = row.manufacturer || '';
  modelInput.value = row.model || '';
  serialNumberInput.value = row.serialnumber || '';
  intervalInput.value = row.interval || '';
  lastCalDateInput.value = toInputDate(row.dateoflastcalibration);
  expiredDateInput.value = toInputDate(row.expireddate);
  specificationInput.value = row.specification || '';

  submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> อัปเดตข้อมูล';
  cancelBtn?.classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 5. Delete Record
async function deleteRecord(id) {
  const result = await Swal.fire({
    title: 'ยืนยันการลบ',
    text: "คุณต้องการลบข้อมูลเครื่องมือวัดนี้ใช่หรือไม่?",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    confirmButtonText: 'ลบข้อมูล'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${WEB_APP_URL}?action=delete&id=${id}`);
    const deleteResult = await response.json();
    if (deleteResult.success) {
      fetchData();
      Swal.fire('ลบแล้ว!', '', 'success');
    }
  } catch (error) {
    console.error('Delete Error:', error);
  }
}

// --- Helpers ---
function resetForm() {
  if (form) form.reset();
  recordIdInput.value = '';
  submitBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> บันทึกข้อมูล';
  cancelBtn?.classList.add('hidden');
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  if (!text) return '';
  return String(text).replace(/"/g, '&quot;');
}

function showLoading(isLoading) {
  if (loadingDiv) loadingDiv.classList.toggle('hidden', !isLoading);
  if (dataTable) dataTable.classList.toggle('hidden', isLoading);
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
  if (form) {
    const saved = sessionStorage.getItem('editRecord');
    if (saved && new URLSearchParams(window.location.search).get('edit')) {
      prepareEdit(JSON.parse(saved));
      sessionStorage.removeItem('editRecord');
    }
  }
  fetchData();
});
 
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
 