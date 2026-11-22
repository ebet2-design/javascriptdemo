/* JS Core 10 Lab — 10개 핵심 라이브러리 인터랙티브 데모 및 제어 스크립트 */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// 안전 실행 래퍼 (CDN 지연이나 오류 시에도 전체 스크립트 중단 방지)
const safe = (fn) => {
  try {
    fn();
  } catch (error) {
    console.warn('라이브러리 초기화 중 알림:', error.message);
  }
};

let toastTimer;
function notify(message) {
  const toast = $('#statusToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ----------------------------------------------------
// UI 제어: 테마, 검색 필터, 키보드 단축키, 스크롤
// ----------------------------------------------------
const savedTheme = localStorage.getItem('js-core-theme');
if (savedTheme === 'light') document.body.classList.add('light');

$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  const isLight = document.body.classList.contains('light');
  localStorage.setItem('js-core-theme', isLight ? 'light' : 'dark');
  notify(isLight ? '라이트 테마로 전환되었습니다.' : '다크 테마로 전환되었습니다.');
});

$('#backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

let activeFilter = 'all';
function filterCards() {
  const query = $('#demoSearch').value.trim().toLowerCase();
  let visible = 0;

  $$('.demo-card').forEach((card) => {
    const categoryMatch = activeFilter === 'all' || card.dataset.category.includes(activeFilter);
    const queryMatch = !query ||
      card.dataset.search.toLowerCase().includes(query) ||
      card.textContent.toLowerCase().includes(query);

    const show = categoryMatch && queryMatch;
    card.classList.toggle('is-hidden', !show);
    if (show) visible += 1;
  });

  $('#resultCount').textContent = visible;
  $('#emptyState').hidden = visible !== 0;
}

$$('.filter-btn').forEach((button) => {
  button.addEventListener('click', () => {
    $$('.filter-btn').forEach((b) => b.classList.remove('active'));
    button.classList.add('active');
    activeFilter = button.dataset.filter;
    filterCards();
  });
});

$('#demoSearch').addEventListener('input', filterCards);

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $('#demoSearch').focus();
  }
});

$('#surpriseBtn').addEventListener('click', () => {
  const cards = $$('.demo-card:not(.is-hidden)');
  if (!cards.length) return;
  const target = cards[Math.floor(Math.random() * cards.length)];
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target.animate([
    { transform: 'translateY(0)' },
    { transform: 'translateY(-12px)', borderColor: '#7c5cff' },
    { transform: 'translateY(0)' }
  ], { duration: 700 });
});

// ----------------------------------------------------
// 01. Chart.js (데이터 시각화)
// ----------------------------------------------------
let mainChart = null;
let currentChartType = 'line';

function initChart() {
  if (!window.Chart) return;
  const ctx = $('#lineChart');
  if (!ctx) return;

  Chart.defaults.color = '#a6a9ba';
  Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

  mainChart = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: ['09:00', '11:00', '13:00', '15:00', '17:00'],
      datasets: [{
        label: '방문자 수 (명)',
        data: [150, 320, 280, 540, 480],
        borderColor: '#7c5cff',
        backgroundColor: currentChartType === 'line' ? 'rgba(124, 92, 255, 0.2)' : '#7c5cff',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#22d3a7',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: 'top' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
safe(initChart);

$('#addChartData').addEventListener('click', () => {
  if (!mainChart) return notify('Chart.js 로딩 대기 중입니다.');
  const nextHour = `${17 + (mainChart.data.labels.length - 4) * 2}:00`;
  const randomValue = Math.floor(200 + Math.random() * 450);

  mainChart.data.labels.push(nextHour);
  mainChart.data.datasets[0].data.push(randomValue);

  if (mainChart.data.labels.length > 8) {
    mainChart.data.labels.shift();
    mainChart.data.datasets[0].data.shift();
  }
  mainChart.update();
  notify(`새 데이터 추가: ${randomValue}명 (${nextHour})`);
});

$('#toggleChartType').addEventListener('click', () => {
  if (!mainChart) return;
  currentChartType = currentChartType === 'line' ? 'bar' : 'line';
  mainChart.destroy();
  initChart();
  notify(`차트 유형 변경: ${currentChartType.toUpperCase()}`);
});

// ----------------------------------------------------
// 02. SweetAlert2 (모달 및 팝업)
// ----------------------------------------------------
$('#swalSuccess').addEventListener('click', () => {
  if (window.Swal) {
    Swal.fire({
      title: '프로젝트 배포 성공!',
      text: 'GitHub에 모든 변경사항이 안전하게 반영되었습니다.',
      icon: 'success',
      confirmButtonText: '확인',
      confirmButtonColor: '#7c5cff'
    });
  } else {
    alert('프로젝트 배포 성공!');
  }
});

$('#swalConfirm').addEventListener('click', () => {
  if (window.Swal) {
    Swal.fire({
      title: '정말 삭제하시겠습니까?',
      text: '한 번 삭제한 데이터는 되돌릴 수 없습니다!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '네, 삭제합니다',
      cancelButtonText: '취소'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: '삭제 완료!',
          text: '항목이 안전하게 제거되었습니다.',
          icon: 'success',
          confirmButtonColor: '#7c5cff'
        });
      }
    });
  } else {
    if (confirm('정말 삭제하시겠습니까?')) alert('삭제되었습니다.');
  }
});

// ----------------------------------------------------
// 03. Day.js (날짜 연산 & 상대 시간)
// ----------------------------------------------------
safe(() => {
  if (window.dayjs && window.dayjs_plugin_relativeTime) {
    dayjs.extend(dayjs_plugin_relativeTime);
    if (window.dayjs_locale_ko) dayjs.locale('ko');
  }
});

const todayDate = new Date();
const targetInput = $('#targetDate');
// 기본값: 5일 뒤로 설정
const futureDate = new Date();
futureDate.setDate(todayDate.getDate() + 5);
if (targetInput) {
  targetInput.value = futureDate.toISOString().split('T')[0];
}

function updateRelativeTime() {
  const resultBox = $('#relativeOutput');
  if (!resultBox || !targetInput.value) return;

  if (window.dayjs) {
    const selected = dayjs(targetInput.value);
    const now = dayjs();
    const diffDays = selected.diff(now, 'day');
    const relativeText = selected.fromNow();

    let ddayText = '';
    if (diffDays === 0) ddayText = 'D-Day (오늘)';
    else if (diffDays > 0) ddayText = `D-${diffDays}`;
    else ddayText = `D+${Math.abs(diffDays)}`;

    resultBox.innerHTML = `<span>${relativeText}</span> <small style="display:block; font-size:14px; color:#a6a9ba; margin-top:4px;">(${ddayText})</small>`;
  } else {
    resultBox.textContent = targetInput.value;
  }
}
targetInput.addEventListener('change', updateRelativeTime);
safe(updateRelativeTime);

$('#setTodayBtn').addEventListener('click', () => {
  targetInput.value = new Date().toISOString().split('T')[0];
  updateRelativeTime();
  notify('오늘 날짜로 재설정했습니다.');
});

// ----------------------------------------------------
// 04. SortableJS (드래그 앤 드롭 정렬)
// ----------------------------------------------------
safe(() => {
  const listEl = $('#sortableList');
  if (window.Sortable && listEl) {
    new Sortable(listEl, {
      animation: 180,
      ghostClass: 'sortable-ghost',
      onEnd: () => {
        notify('항목 순서가 변경되었습니다.');
      }
    });
  }
});

// ----------------------------------------------------
// 05. Marked + DOMPurify (마크다운 파서 및 XSS 방어)
// ----------------------------------------------------
function renderMarkdown() {
  const raw = $('#markdownInput').value;
  let parsedHtml = '';
  if (window.marked) {
    parsedHtml = marked.parse(raw);
  } else {
    parsedHtml = raw.replace(/\n/g, '<br>');
  }

  const safeHtml = window.DOMPurify ? DOMPurify.sanitize(parsedHtml) : parsedHtml;
  $('#markdownPreview').innerHTML = safeHtml;
}
$('#markdownInput').addEventListener('input', renderMarkdown);
safe(renderMarkdown);

// ----------------------------------------------------
// 06. Canvas-Confetti (폭죽 효과)
// ----------------------------------------------------
$('#fireCannon').addEventListener('click', () => {
  if (window.confetti) {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.7 }
    });
    notify('🎉 축하 폭죽을 발사했습니다!');
  } else {
    notify('Canvas-Confetti 로딩 중...');
  }
});

$('#fireFireworks').addEventListener('click', () => {
  if (!window.confetti) return;
  const duration = 2000;
  const end = Date.now() + duration;

  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
  notify('🎆 연속 축포가 시작되었습니다!');
});

// ----------------------------------------------------
// 07. QRCode.js (QR 코드 생성기)
// ----------------------------------------------------
let qrInstance = null;
function generateQR() {
  const container = $('#qrOutput');
  const val = $('#qrInput').value.trim() || 'https://github.com';
  container.innerHTML = '';

  if (window.QRCode) {
    qrInstance = new QRCode(container, {
      text: val,
      width: 130,
      height: 130,
      colorDark: '#11121a',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    });
  } else {
    container.textContent = 'QRCode.js 로딩 대기 중...';
  }
}
$('#makeQrBtn').addEventListener('click', () => {
  generateQR();
  notify('QR 코드가 성공적으로 생성되었습니다.');
});
safe(generateQR);

// ----------------------------------------------------
// 08. CountUp.js (숫자 카운팅 애니메이션)
// ----------------------------------------------------
let countUpInstance = null;
function runCountUp() {
  const target = $('#countDisplay');
  if (!target) return;

  if (window.countUp && window.countUp.CountUp) {
    if (countUpInstance) countUpInstance.reset();
    countUpInstance = new countUp.CountUp('countDisplay', 1284500, {
      duration: 2.2,
      separator: ','
    });
    if (!countUpInstance.error) {
      countUpInstance.start();
    } else {
      console.error(countUpInstance.error);
    }
  } else {
    target.textContent = '1,284,500';
  }
}

$('#startCountBtn').addEventListener('click', () => {
  runCountUp();
  notify('숫자 카운팅을 시작합니다.');
});
$('#resetCountBtn').addEventListener('click', () => {
  if (countUpInstance) countUpInstance.reset();
  $('#countDisplay').textContent = '0';
  notify('카운터를 초기화했습니다.');
});
safe(runCountUp);

// ----------------------------------------------------
// 09. Typed.js (타자기 효과)
// ----------------------------------------------------
let typedInstance = null;
function initTyped() {
  const target = $('#typedTarget');
  if (!target) return;

  if (window.Typed) {
    if (typedInstance) typedInstance.destroy();
    typedInstance = new Typed('#typedTarget', {
      strings: ['최고의 사용자 경험을', '직관적인 웹 서비스를', '안정적인 실무 코드를', '아름다운 인터랙션을'],
      typeSpeed: 60,
      backSpeed: 35,
      backDelay: 1500,
      loop: true
    });
  }
}
$('#restartTypedBtn').addEventListener('click', () => {
  initTyped();
  notify('타이핑 효과를 다시 시작했습니다.');
});
safe(initTyped);

// ----------------------------------------------------
// 10. Leaflet.js (인터랙티브 오픈소스 지도)
// ----------------------------------------------------
let leafletMap = null;
let currentMarker = null;

function initMap() {
  const mapContainer = $('#leafletMap');
  if (!mapContainer || !window.L) return;

  // 서울 좌표 기본값
  const seoul = [37.5665, 126.9780];
  leafletMap = L.map('leafletMap').setView(seoul, 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(leafletMap);

  currentMarker = L.marker(seoul).addTo(leafletMap)
    .bindPopup('<b>서울 시청</b><br>수도 서울의 중심지')
    .openPopup();
}
safe(initMap);

$$('.map-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    $$('.map-pill').forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');

    const lat = parseFloat(pill.dataset.lat);
    const lng = parseFloat(pill.dataset.lng);
    const name = pill.dataset.name;

    if (leafletMap && currentMarker) {
      leafletMap.flyTo([lat, lng], 13, { duration: 1.5 });
      currentMarker.setLatLng([lat, lng])
        .bindPopup(`<b>${name}</b><br>선택된 위치로 이동했습니다.`)
        .openPopup();
      notify(`${name}(으)로 지도를 이동했습니다.`);
    }
  });
});
