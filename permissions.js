// permissions.js - จัดการสิทธิ์ผู้ใช้

let currentUser = '';
let userRole = '';

// ตรวจสอบสิทธิ์ผู้ใช้
function checkUserPermissions() {
  currentUser = localStorage.getItem('currentUser') || '';
  userRole = localStorage.getItem('userRole') || '';

  if (!currentUser || !userRole) {
    window.location.href = 'index.html';
    return false;
  }
  return true;
}

// ตรวจสอบสิทธิ์การแก้ไข (Engineer และ Supervisor)
function canEdit() {
  return userRole === 'Engineer' || userRole === 'Supervisor';
}

// ตรวจสอบสิทธิ์การลบ (Engineer เท่านั้น)
function canDelete() {
  return userRole === 'Engineer';
}

// ตรวจสอบสิทธิ์การเพิ่มข้อมูล (Engineer และ Supervisor)
function canAdd() {
  return canEdit();
}

// ซ่อนปุ่มตามสิทธิ์
function hideButtonsBasedOnPermissions() {
  // ซ่อนปุ่มเพิ่มข้อมูลสำหรับ Technician
  const addButtons = document.querySelectorAll('a[href*="createform"]');
  addButtons.forEach(btn => {
    if (!canAdd()) {
      btn.style.display = 'none';
    }
  });
}

// แสดงข้อความแจ้งเตือนเมื่อไม่มีสิทธิ์
function showPermissionDenied(action) {
  Swal.fire({
    icon: 'warning',
    title: 'ไม่มีสิทธิ์',
    text: `คุณไม่มีสิทธิ์${action}`,
    confirmButtonColor: '#6366f1'
  });
}