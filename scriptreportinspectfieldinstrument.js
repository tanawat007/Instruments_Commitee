// script.js
 
// ⚠️ สำคัญมาก: นำ URL ที่ได้จากการ Deploy ในขั้นตอนที่ 2 มาวางที่นี่
// คำแนะนำ: Deploy Google Apps Script แบบ "Anyone can access" แล้วนำ URL มาใส่ตรงนี้
const ORIGINAL_URL = 'https://script.google.com/macros/s/AKfycbxgCqk55fZP6dmZvc3uB1RzuVp1YydqinlUr68BZ32LlRftz2WrdL4x-U6etVvgI7cW/exec';
 
 
// ใช้ URL โดยตรงจาก Google Apps Script
const WEB_APP_URL = ORIGINAL_URL;
 
// --- DOM Elements: ประกาศตัวแปร ---
const form = document.getElementById('data-form');
const recordIdInput = document.getElementById('record-id');
const materialCodeInput = document.getElementById('materialCode');
const descriptionInput = document.getElementById('description');
const instrumentTypeInput = document.getElementById('instrumenttype');
const manufacturerInput = document.getElementById('manufacturer');
const modelInput = document.getElementById('model');
const serialNumberInput = document.getElementById('serialnumber');
const plantInput = document.getElementById('plant');
const workorderInput = document.getElementById('workorder');
const winumberInput = document.getElementById('winumber');
const waterproofInput = document.getElementById('waterproof');
const bodycaseInput = document.getElementById('bodycase');
const boltnutInput = document.getElementById('boltnut');
const labelInput = document.getElementById('label');
const terminalInput = document.getElementById('terminal');
const cableglandInput = document.getElementById('cablegland');
const conduitsupportInput = document.getElementById('conduitsupport');
const leakedInput = document.getElementById('leaked');
const vibrationInput = document.getElementById('vibration');
const oilsealInput = document.getElementById('oilseal');
const indicatorpointerInput = document.getElementById('indicatorpointer');
const insulationtracingInput = document.getElementById('insulationtracing');
const impulselineInput = document.getElementById('impulseline');
const capillarytubeInput = document.getElementById('capillarytube');
const positionInput = document.getElementById('position');
const testingInput = document.getElementById('testing');
const inspectByInput = document.getElementById('inspectby');
const inspectDateInput = document.getElementById('inspectdate');
const approvedByInput = document.getElementById('approvedby');
const approvedDateInput = document.getElementById('approveddate');
const remarkInput = document.getElementById('remark');
const overallStatusInput = document.getElementById('overallstatus');
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
 
function getSelectedRadioValue(name) {
  const radio = document.querySelector(`input[name="${name}"]:checked`);
  return radio ? radio.value.trim() : '';
}
 
function getInputOrRadioValue(name, inputElement) {
  if (inputElement && inputElement.value.trim()) {
    return inputElement.value.trim();
  }
  return getSelectedRadioValue(name);
}
 
function setRadioValue(name, value) {
  if (!value) return;
  const radio = document.querySelector(`input[name="${name}"][value="${value}"]`);
  if (radio) radio.checked = true;
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
    const days = daysUntil(row.inspectdate);
    if (days !== null) {
      if (days < 0) expired++;
      else if (days <= 30) expiring++;
    }
    const area = (row.plant || '').trim();
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
        row.MaterialCode,
        row.description,
        row.instrumenttype,
        row.manufacturer,
        row.model,
        row.serialnumber,
        row.plant,
        row.workorder,
        row.winumber,
        row.waterproof,
        row.bodycase,
        row.boltnut,
        row.label,
        row.terminal,
        row.cablegland,
        row.conduitsupport,
        row.leaked,
        row.vibration,
        row.oilseal,
        row.indicatorpointer,
        row.insulationtracing,
        row.impulseline,
        row.capillarytube,
        row.position,
        row.testing,
        row.inspectby,
        row.inspectdate,
        row.approvedby,
        row.approveddate,
        row.remark,
        row.overallstatus
      ].map(v => String(v || '').toLowerCase());
      if (!searchFields.some(f => f.includes(query))) return false;
    }
    // Area filter
    if (areaFilter && (row.plant || '').trim() !== areaFilter) return false;
    // Status filter
    if (statusFilter) {
      const days = daysUntil(row.inspectdate);
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
 
      // เรียงข้อมูลแบบ Descending (ใหม่สุดอยู่บน) โดยใช้ inspectdate
      // เพื่อให้รายการที่เพิ่งบันทึลล่าสุดแสดงเป็นรายการแรกเสมอ
      allData.sort((a, b) => {
        const dateA = parseDate(a.inspectdate)?.getTime() || 0;
        const dateB = parseDate(b.inspectdate)?.getTime() || 0;
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
      <td class="font-mono font-semibold text-primary text-sm">${escapeHtml(row.MaterialCode || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.description || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.instrumenttype || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.plant || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.workorder || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.remark || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.overallstatus || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.inspectby || '-')}</td>
      <td class="font-semibold text-sm">${escapeHtml(row.approvedby || '-')}</td>
      <td class="font-semibold text-sm">${formatDate(row.approveddate)}</td>
      <td class="text-right">
        <div class="flex justify-end gap-1">
          <button class="view-btn btn btn-xs btn-ghost text-info tooltip tooltip-left" data-tip="ดูรายละเอียด"
                  data-id="${escapeAttr(row.ID)}"
                  data-material-code="${escapeAttr(row.MaterialCode || '')}"
                  data-description="${escapeAttr(row.description || '')}"
                  data-instrumenttype="${escapeAttr(row.instrumenttype || '')}"
                  data-plant="${escapeAttr(row.plant || '')}"
                  data-workorder="${escapeAttr(row.workorder || '')}"
                  data-remark="${escapeAttr(row.remark || '')}"
                  data-overallstatus="${escapeAttr(row.overallstatus || '')}"
                  data-inspectby="${escapeAttr(row.inspectby || '')}"
                  data-approvedby="${escapeAttr(row.approvedby || '')}"
                  data-approveddate="${escapeAttr(toInputDate(row.approveddate))}">
            <i class="fa-solid fa-eye"></i>
          </button>
          ${canEdit() ? `
          <button class="edit-btn btn btn-xs btn-ghost text-primary tooltip tooltip-left" data-tip="แก้ไข"
                  data-id="${escapeAttr(row.ID)}"
                  data-material-code="${escapeAttr(row.MaterialCode || '')}"
                  data-description="${escapeAttr(row.description || '')}"
                  data-instrumenttype="${escapeAttr(row.instrumenttype || '')}"
                  data-manufacturer="${escapeAttr(row.manufacturer || '')}"
                  data-model="${escapeAttr(row.model || '')}"
                  data-serialnumber="${escapeAttr(row.serialnumber || '')}"
                  data-plant="${escapeAttr(row.plant || '')}"
                  data-workorder="${escapeAttr(row.workorder || '')}"
                  data-winumber="${escapeAttr(row.winumber || '')}"
                  data-waterproof="${escapeAttr(row.waterproof || '')}"
                  data-bodycase="${escapeAttr(row.bodycase || '')}"
                  data-boltnut="${escapeAttr(row.boltnut || '')}"
                  data-label="${escapeAttr(row.label || '')}"
                  data-terminal="${escapeAttr(row.terminal || '')}"
                  data-cablegland="${escapeAttr(row.cablegland || '')}"
                  data-conduitsupport="${escapeAttr(row.conduitsupport || '')}"
                  data-leaked="${escapeAttr(row.leaked || '')}"
                  data-vibration="${escapeAttr(row.vibration || '')}"
                  data-oilseal="${escapeAttr(row.oilseal || '')}"
                  data-indicatorpointer="${escapeAttr(row.indicatorpointer || '')}"
                  data-insulationtracing="${escapeAttr(row.insulationtracing || '')}"
                  data-impulseline="${escapeAttr(row.impulseline || '')}"
                  data-capillarytube="${escapeAttr(row.capillarytube || '')}"
                  data-position="${escapeAttr(row.position || '')}"
                  data-testing="${escapeAttr(row.testing || '')}"
                  data-inspectby="${escapeAttr(row.inspectby || '')}"
                  data-inspectdate="${escapeAttr(toInputDate(row.inspectdate))}"
                  data-approvedby="${escapeAttr(row.approvedby || '')}"
                  data-approveddate="${escapeAttr(toInputDate(row.approveddate))}"
                  data-remark="${escapeAttr(row.remark || '')}"
                  data-overallstatus="${escapeAttr(row.overallstatus || '')}">
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
      editRecord(
        this.dataset.id,
        this.dataset.materialCode,
        this.dataset.description,
        this.dataset.instrumenttype,
        this.dataset.manufacturer,
        this.dataset.model,
        this.dataset.serialnumber,
        this.dataset.plant,
        this.dataset.workorder,
        this.dataset.winumber,
        this.dataset.waterproof,
        this.dataset.bodycase,
        this.dataset.boltnut,
        this.dataset.label,
        this.dataset.terminal,
        this.dataset.cablegland,
        this.dataset.conduitsupport,
        this.dataset.leaked,
        this.dataset.vibration,
        this.dataset.oilseal,
        this.dataset.indicatorpointer,
        this.dataset.insulationtracing,
        this.dataset.impulseline,
        this.dataset.capillarytube,
        this.dataset.position,
        this.dataset.testing,
        this.dataset.inspectby,
        this.dataset.inspectdate,
        this.dataset.approvedby,
        this.dataset.approveddate,
        this.dataset.remark,
        this.dataset.overallstatus
      );
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
      materialCode: materialCodeInput?.value.trim() || '',
      description: descriptionInput?.value.trim() || '',
      instrumenttype: instrumentTypeInput?.value.trim() || '',
      manufacturer: manufacturerInput?.value.trim() || '',
      model: modelInput?.value.trim() || '',
      serialnumber: serialNumberInput?.value.trim() || '',
      plant: plantInput?.value.trim() || '',
      workorder: workorderInput?.value.trim() || '',
      winumber: winumberInput?.value.trim() || '',
      waterproof: getInputOrRadioValue('waterproof', waterproofInput),
      bodycase: getInputOrRadioValue('bodycase', bodycaseInput),
      boltnut: getInputOrRadioValue('boltnut', boltnutInput),
      label: getInputOrRadioValue('label', labelInput),
      terminal: getInputOrRadioValue('terminal', terminalInput),
      cablegland: getInputOrRadioValue('cablegland', cableglandInput),
      conduitsupport: getInputOrRadioValue('conduitsupport', conduitsupportInput),
      leaked: getInputOrRadioValue('leaked', leakedInput),
      vibration: getInputOrRadioValue('vibration', vibrationInput),
      oilseal: getInputOrRadioValue('oilseal', oilsealInput),
      indicatorpointer: getInputOrRadioValue('indicatorpointer', indicatorpointerInput),
      insulationtracing: getInputOrRadioValue('insulationtracing', insulationtracingInput),
      impulseline: getInputOrRadioValue('impulseline', impulselineInput),
      capillarytube: getInputOrRadioValue('capillarytube', capillarytubeInput),
      position: getInputOrRadioValue('position', positionInput),
      testing: getInputOrRadioValue('testing', testingInput),
      inspectby: inspectByInput?.value.trim() || '',
      inspectdate: inspectDateInput?.value || '',
      approvedby: approvedByInput?.value.trim() || '',
      approveddate: approvedDateInput?.value || '',
      remark: remarkInput?.value.trim() || '',
      overallstatus: overallStatusInput?.value.trim() || ''
    };

    if (isUpdating) {
      params.id = recordId;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading loading-spinner loading-sm"></span> กำลังบันทึก...';

    try {
      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(params),
        redirect: 'follow'
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();

      if (result && result.success === true) {
        console.log('บันทึกสำเร็จ');

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
        window.location.href = '061_reportinspectfieldinstrument.html';
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
function editRecord(id, materialCode, description, instrumenttype, manufacturer, model, serialnumber, plant, workorder, winumber, waterproof, bodycase, boltnut, label, terminal, cablegland, conduitsupport, leaked, vibration, oilseal, indicatorpointer, insulationtracing, impulseline, capillarytube, position, testing, inspectby, inspectdate, approvedby, approveddate, remark, overallstatus) {
  // ถ้าอยู่หน้า index ให้ redirect ไปหน้า createForm โดยเก็บข้อมูลใน sessionStorage
  // (ไม่ใช้ query params เพราะข้อมูลเช่น base64 image ทำให้ URL ยาวเกินไป → 431 error)
  if (!form) {
    sessionStorage.setItem('editRecord', JSON.stringify({
      id, materialCode, description, instrumenttype, manufacturer, model, serialnumber, plant, workorder, winumber, waterproof, bodycase, boltnut, label, terminal, cablegland, conduitsupport, leaked, vibration, oilseal, indicatorpointer, insulationtracing, impulseline, capillarytube, position, testing, inspectby, inspectdate, approvedby, approveddate, remark, overallstatus
    }));
    window.location.href = 'createreport_fieldinstrument.html?edit=1';
    return;
  }
 
  recordIdInput.value = id;
  if (materialCodeInput) materialCodeInput.value = materialCode || '';
  if (descriptionInput) descriptionInput.value = description || '';
  if (instrumentTypeInput) instrumentTypeInput.value = instrumenttype || '';
  if (manufacturerInput) manufacturerInput.value = manufacturer || '';
  if (modelInput) modelInput.value = model || '';
  if (serialNumberInput) serialNumberInput.value = serialnumber || '';
  if (plantInput) plantInput.value = plant || '';
  if (workorderInput) workorderInput.value = workorder || '';
  if (winumberInput) winumberInput.value = winumber || '';
  if (waterproofInput) waterproofInput.value = waterproof || '';
  setRadioValue('waterproof', waterproof);
  if (bodycaseInput) bodycaseInput.value = bodycase || '';
  setRadioValue('bodycase', bodycase);
  if (boltnutInput) boltnutInput.value = boltnut || '';
  setRadioValue('boltnut', boltnut);
  if (labelInput) labelInput.value = label || '';
  setRadioValue('label', label);
  if (terminalInput) terminalInput.value = terminal || '';
  setRadioValue('terminal', terminal);
  if (cableglandInput) cableglandInput.value = cablegland || '';
  setRadioValue('cablegland', cablegland);
  if (conduitsupportInput) conduitsupportInput.value = conduitsupport || '';
  setRadioValue('conduitsupport', conduitsupport);
  if (leakedInput) leakedInput.value = leaked || '';
  setRadioValue('leaked', leaked);
  if (vibrationInput) vibrationInput.value = vibration || '';
  setRadioValue('vibration', vibration);
  if (oilsealInput) oilsealInput.value = oilseal || '';
  setRadioValue('oilseal', oilseal);
  if (indicatorpointerInput) indicatorpointerInput.value = indicatorpointer || '';
  setRadioValue('indicatorpointer', indicatorpointer);
  if (insulationtracingInput) insulationtracingInput.value = insulationtracing || '';
  setRadioValue('insulationtracing', insulationtracing);
  if (impulselineInput) impulselineInput.value = impulseline || '';
  setRadioValue('impulseline', impulseline);
  if (capillarytubeInput) capillarytubeInput.value = capillarytube || '';
  setRadioValue('capillarytube', capillarytube);
  if (positionInput) positionInput.value = position || '';
  setRadioValue('position', position);
  if (testingInput) testingInput.value = testing || '';
  setRadioValue('testing', testing);
  if (inspectByInput) inspectByInput.value = inspectby || '';
  if (inspectDateInput) inspectDateInput.value = toInputDate(inspectdate) || inspectdate || '';
  if (approvedByInput) approvedByInput.value = approvedby || '';
  if (approvedDateInput) approvedDateInput.value = toInputDate(approveddate) || approveddate || '';
  if (remarkInput) remarkInput.value = remark || '';
  if (overallStatusInput) overallStatusInput.value = overallstatus || '';
 
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
        editRecord(
          data.id,
          data.materialCode,
          data.description,
          data.instrumenttype,
          data.manufacturer,
          data.model,
          data.serialnumber,
          data.plant,
          data.workorder,
          data.winumber,
          data.waterproof,
          data.bodycase,
          data.boltnut,
          data.label,
          data.terminal,
          data.cablegland,
          data.conduitsupport,
          data.leaked,
          data.vibration,
          data.oilseal,
          data.indicatorpointer,
          data.insulationtracing,
          data.impulseline,
          data.capillarytube,
          data.position,
          data.testing,
          data.inspectby,
          data.inspectdate,
          data.approvedby,
          data.approveddate,
          data.remark,
          data.overallstatus
        );
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
    html: '<p class="text-slate-500">คุณต้องการลบข้อมูล Field Instrumentนี้ใช่หรือไม่?</p><p class="text-xs text-red-400 mt-2">การดำเนินการนี้ไม่สามารถย้อนกลับได้</p>',
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
 
// ฟังก์ชันแสดงรายละเอียด Field Instrument
function viewRecord(data) {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
 
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '-'; };
 
  setEl('detail-code', data.materialCode || '-');
  setEl('detail-description', data.description || '-');
  setEl('detail-instrumenttype', data.instrumenttype || '-');
  setEl('detail-manufacturer', data.manufacturer || '-');
  setEl('detail-model', data.model || '-');
  setEl('detail-serialnumber', data.serialnumber || '-');
  setEl('detail-plant', data.plant || '-');
  setEl('detail-workorder', data.workorder || '-');
  setEl('detail-winumber', data.winumber || '-');
  setEl('detail-waterproof', data.waterproof || '-');
  setEl('detail-bodycase', data.bodycase || '-');
  setEl('detail-boltnut', data.boltnut || '-');
  setEl('detail-label', data.label || '-');
  setEl('detail-terminal', data.terminal || '-');
  setEl('detail-cablegland', data.cablegland || '-');
  setEl('detail-conduitsupport', data.conduitsupport || '-');
  setEl('detail-leaked', data.leaked || '-');
  setEl('detail-vibration', data.vibration || '-');
  setEl('detail-oilseal', data.oilseal || '-');
  setEl('detail-indicatorpointer', data.indicatorpointer || '-');
  setEl('detail-insulationtracing', data.insulationtracing || '-');
  setEl('detail-impulseline', data.impulseline || '-');
  setEl('detail-capillarytube', data.capillarytube || '-');
  setEl('detail-position', data.position || '-');
  setEl('detail-testing', data.testing || '-');
  setEl('detail-inspectby', data.inspectby || '-');
  setEl('detail-inspectdate', formatDate(data.inspectdate));
  setEl('detail-approvedby', data.approvedby || '-');
  setEl('detail-approveddate', formatDate(data.approveddate));
  setEl('detail-remark', data.remark || '-');
  setEl('detail-overallstatus', data.overallstatus || '-');
 
  modal.showModal();
}
 
 