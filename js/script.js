// === DOM Elements ===
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const canvasOverlay = document.getElementById('canvasOverlay');
const btnHighlight = document.getElementById('btnHighlight');
const btnClear = document.getElementById('btnClear');
const btnApprove = document.getElementById('btnApprove');
const btnReject = document.getElementById('btnReject');
const verdictBadge = document.getElementById('verdictBadge');
const logList = document.getElementById('logList');

// Bar elements
const barRipeness = document.getElementById('barRipeness');
const barColor = document.getElementById('barColor');
const barDefect = document.getElementById('barDefect');
const barSize = document.getElementById('barSize');
const valRipeness = document.getElementById('valRipeness');
const valColor = document.getElementById('valColor');
const valDefect = document.getElementById('valDefect');
const valSize = document.getElementById('valSize');

let currentImage = null;
let defectsHighlighted = false;

// === Drag & Drop ===
uploadZone.addEventListener('click', () => fileInput.click());

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    loadImage(file);
  }
});

fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) loadImage(file);
});

// === Load Image ===
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      currentImage = img;
      drawImage(img);
      canvasOverlay.classList.add('hidden');
      canvas.style.display = 'block';
      addLog(`Loaded: ${file.name}`);
      runInspection();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// === Draw Image on Canvas ===
function drawImage(img) {
  const wrapper = document.getElementById('canvasWrapper');
  const maxW = wrapper.clientWidth - 2;
  const maxH = 400;
  const scale = Math.min(maxW / img.width, maxH / img.height, 1);
  canvas.width = img.width * scale;
  canvas.height = img.height * scale;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  defectsHighlighted = false;
}

// === Highlight Defects (simulated) ===
btnHighlight.addEventListener('click', () => {
  if (!currentImage) return;
  if (defectsHighlighted) return;

  // Simulate defect regions
  const regions = generateDefectRegions();
  ctx.save();
  ctx.strokeStyle = 'rgba(239, 83, 80, 0.9)';
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 3]);

  regions.forEach((r) => {
    ctx.beginPath();
    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(239, 83, 80, 0.15)';
    ctx.fill();
  });

  ctx.restore();
  defectsHighlighted = true;
  addLog('Defect regions highlighted.');
});

// === Clear Canvas ===
btnClear.addEventListener('click', () => {
  if (!currentImage) return;
  drawImage(currentImage);
  addLog('Canvas cleared.');
});

// === Generate Random Defect Regions ===
function generateDefectRegions() {
  const count = Math.floor(Math.random() * 3) + 1;
  const regions = [];
  for (let i = 0; i < count; i++) {
    regions.push({
      x: Math.random() * canvas.width * 0.6 + canvas.width * 0.2,
      y: Math.random() * canvas.height * 0.6 + canvas.height * 0.2,
      radius: Math.random() * 25 + 15,
    });
  }
  return regions;
}

// === Run Inspection (simulated) ===
function runInspection() {
  const ripeness = Math.floor(Math.random() * 40) + 60;
  const color = Math.floor(Math.random() * 30) + 65;
  const defect = Math.floor(Math.random() * 35) + 5;
  const size = Math.floor(Math.random() * 25) + 70;

  animateBar(barRipeness, ripeness);
  animateBar(barColor, color);
  animateBar(barDefect, defect);
  animateBar(barSize, size);

  valRipeness.textContent = `${ripeness}%`;
  valColor.textContent = gradeFromScore(color);
  valDefect.textContent = defect < 20 ? 'Low' : defect < 40 ? 'Moderate' : 'High';
  valSize.textContent = `${size}%`;

  // Determine verdict
  const pass = ripeness >= 70 && defect < 30 && color >= 60;
  verdictBadge.textContent = pass ? 'PASS' : 'FAIL';
  verdictBadge.className = 'verdict-badge ' + (pass ? 'pass' : 'fail');

  btnApprove.disabled = false;
  btnReject.disabled = false;

  addLog(`Inspection complete — ${pass ? 'PASS' : 'FAIL'}`);
}

function animateBar(bar, value) {
  bar.style.width = '0%';
  requestAnimationFrame(() => {
    bar.style.width = value + '%';
  });
}

function gradeFromScore(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  return 'D';
}

// === Approve / Reject ===
btnApprove.addEventListener('click', () => {
  addLog('Batch APPROVED.', 'log-success');
  resetInspection();
});

btnReject.addEventListener('click', () => {
  addLog('Batch REJECTED.', 'log-danger');
  resetInspection();
});

function resetInspection() {
  btnApprove.disabled = true;
  btnReject.disabled = true;
  verdictBadge.textContent = 'Awaiting Image';
  verdictBadge.className = 'verdict-badge';
}

// === Activity Log ===
function addLog(message, className = '') {
  const li = document.createElement('li');
  li.className = 'log-item ' + className;
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  li.textContent = `[${time}] ${message}`;
  logList.prepend(li);

  // Keep log manageable
  while (logList.children.length > 20) {
    logList.removeChild(logList.lastChild);
  }
}
