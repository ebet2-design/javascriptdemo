/* JS Playground 30 — each section is isolated so one unavailable CDN never stops the lab. */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const safe = (fn) => { try { fn(); } catch (error) { console.warn('Demo skipped:', error.message); } };
let toastTimer;
function notify(message) {
  const toast = $('#statusToast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// Shell: theme, navigation, filtering, search, and keyboard shortcut.
const savedTheme = localStorage.getItem('js-lab-theme');
if (savedTheme === 'light') document.body.classList.add('light');
$('#themeToggle').addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('js-lab-theme', document.body.classList.contains('light') ? 'light' : 'dark');
  notify(document.body.classList.contains('light') ? '라이트 테마로 전환했어요.' : '다크 테마로 전환했어요.');
});
$('#backToTop').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

let activeFilter = 'all';
function filterCards() {
  const query = $('#demoSearch').value.trim().toLowerCase();
  let visible = 0;
  $$('.demo-card').forEach((card) => {
    const categoryMatch = activeFilter === 'all' || card.dataset.category.includes(activeFilter);
    const queryMatch = !query || card.dataset.search.toLowerCase().includes(query) || card.textContent.toLowerCase().includes(query);
    const show = categoryMatch && queryMatch;
    card.classList.toggle('is-hidden', !show);
    if (show) visible += 1;
  });
  $('#resultCount').textContent = visible;
  $('#emptyState').hidden = visible !== 0;
}
$$('.filter-btn').forEach((button) => button.addEventListener('click', () => {
  $$('.filter-btn').forEach((item) => item.classList.remove('active'));
  button.classList.add('active');
  activeFilter = button.dataset.filter;
  filterCards();
}));
$('#demoSearch').addEventListener('input', filterCards);
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault(); $('#demoSearch').focus();
  }
});
$('#surpriseBtn').addEventListener('click', () => {
  const cards = $$('.demo-card');
  const selected = cards[Math.floor(Math.random() * cards.length)];
  selected.scrollIntoView({ behavior: 'smooth', block: 'center' });
  selected.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-10px)', borderColor: '#7c5cff' }, { transform: 'translateY(0)' }], { duration: 800 });
});

// 01–02 Chart.js
let lineChart;
let donutChart;
safe(() => {
  if (!window.Chart) throw new Error('Chart.js not loaded');
  Chart.defaults.color = '#8f919f';
  Chart.defaults.borderColor = 'rgba(255,255,255,.08)';
  lineChart = new Chart($('#lineChart'), {
    type: 'line',
    data: { labels: ['10:00', '11:00', '12:00', '13:00', '14:00'], datasets: [{ label: 'Visitors', data: [12, 28, 21, 46, 39], borderColor: '#7c5cff', backgroundColor: 'rgba(124,92,255,.16)', fill: true, tension: .42, pointBackgroundColor: '#22d3a7', pointRadius: 3 }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { maxTicksLimit: 4 } } } }
  });
  donutChart = new Chart($('#donutChart'), {
    type: 'doughnut',
    data: { labels: ['Development', 'Design', 'Research'], datasets: [{ data: [42, 33, 25], backgroundColor: ['#7c5cff', '#22d3a7', '#f1df6d'], borderWidth: 0 }] },
    options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } }
  });
});
$('#addChartData').addEventListener('click', () => {
  if (!lineChart) return notify('Chart.js를 불러오지 못했어요.');
  const hour = `${10 + lineChart.data.labels.length}:00`;
  lineChart.data.labels.push(hour); lineChart.data.datasets[0].data.push(Math.floor(16 + Math.random() * 45));
  if (lineChart.data.labels.length > 8) { lineChart.data.labels.shift(); lineChart.data.datasets[0].data.shift(); }
  lineChart.update();
});
$('#budgetRange').addEventListener('input', (event) => {
  if (!donutChart) return;
  const first = Number(event.target.value); const rest = 100 - first;
  donutChart.data.datasets[0].data = [first, Math.round(rest * .57), Math.round(rest * .43)]; donutChart.update();
});

// 03 QRCode.js
function makeQr() {
  const target = $('#qrOutput'); target.innerHTML = '';
  if (window.QRCode) new QRCode(target, { text: $('#qrInput').value || 'JS Playground', width: 122, height: 122, colorDark: '#11121a', colorLight: '#ffffff' });
  else target.textContent = 'QRCode.js를 불러오지 못했어요.';
}
$('#makeQr').addEventListener('click', makeQr); safe(makeQr);

// 04 Marked + DOMPurify
function renderMarkdown() {
  const raw = $('#markdownInput').value;
  const html = window.marked ? marked.parse(raw) : raw.replace(/\n/g, '<br>');
  $('#markdownPreview').innerHTML = window.DOMPurify ? DOMPurify.sanitize(html) : html;
}
$('#markdownInput').addEventListener('input', renderMarkdown); safe(renderMarkdown);

// 05 Papa Parse
function parseCsv() {
  const result = window.Papa ? Papa.parse($('#csvInput').value.trim(), { header: true, skipEmptyLines: true }) : { data: [] };
  if (!result.data.length) return $('#csvOutput').textContent = '파싱할 데이터가 없어요.';
  const headers = Object.keys(result.data[0]);
  $('#csvOutput').innerHTML = `<table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${result.data.map((row) => `<tr>${headers.map((h) => `<td>${row[h] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
$('#parseCsv').addEventListener('click', parseCsv); safe(parseCsv);

// 06 CryptoJS
$('#makeHash').addEventListener('click', () => {
  const value = $('#hashInput').value;
  $('#hashOutput').textContent = window.CryptoJS ? CryptoJS.SHA256(value).toString() : 'CryptoJS를 불러오지 못했어요.';
});

// 07 zxcvbn
$('#passwordInput').addEventListener('input', (event) => {
  const value = event.target.value; const result = value && window.zxcvbn ? zxcvbn(value) : { score: 0 };
  $$('#strengthBars i').forEach((bar, index) => bar.classList.toggle('on', !!value && index <= result.score));
  const labels = ['매우 약함', '약함', '보통', '강함', '매우 강함'];
  $('#strengthText').textContent = value ? `강도: ${labels[result.score]}` : '아직 입력되지 않았어요.';
});

// 08 Day.js
safe(() => { dayjs.extend(dayjs_plugin_relativeTime); dayjs.locale('ko'); });
const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 7); $('#relativeDate').valueAsDate = tomorrow;
function updateRelative() { $('#relativeOutput').textContent = window.dayjs ? dayjs($('#relativeDate').value).fromNow() : $('#relativeDate').value; }
$('#relativeDate').addEventListener('change', updateRelative); safe(updateRelative);

// 09 Luxon
const clockZones = [['SEOUL', 'Asia/Seoul'], ['NEW YORK', 'America/New_York'], ['LONDON', 'Europe/London'], ['TOKYO', 'Asia/Tokyo']];
function updateClocks() {
  $('#worldClocks').innerHTML = clockZones.map(([name, zone]) => {
    if (!window.luxon) return `<div class="clock"><span>${name}</span><b>--:--</b><small>${zone}</small></div>`;
    const now = luxon.DateTime.now().setZone(zone);
    return `<div class="clock"><span>${name}</span><b>${now.toFormat('HH:mm:ss')}</b><small>${now.toFormat('ccc, dd LLL')}</small></div>`;
  }).join('');
}
updateClocks(); setInterval(updateClocks, 1000);

// 10 Chroma.js
function makePalette() {
  const a = $('#colorA').value; const b = $('#colorB').value;
  const colors = window.chroma ? chroma.scale([a, b]).mode('lch').colors(5) : [a, b];
  $('#palette').innerHTML = colors.map((color) => `<button style="background:${color}" data-color="${color}" aria-label="${color} 복사"><span>${color}</span></button>`).join('');
  $$('#palette button').forEach((button) => button.addEventListener('click', () => copyText(button.dataset.color, `${button.dataset.color} 복사 완료`)));
}
$('#makePalette').addEventListener('click', makePalette); safe(makePalette);

// 11 Anime.js
$('#playAnime').addEventListener('click', () => {
  if (!window.anime) return notify('Anime.js를 불러오지 못했어요.');
  anime({ targets: '.anime-dot', translateY: [0, -42, 0], scale: [1, 1.5, 1], rotate: '1turn', delay: anime.stagger(120), easing: 'easeInOutQuad', duration: 1050 });
});

// 12 GSAP
$('#playGsap').addEventListener('click', () => {
  if (!window.gsap) return notify('GSAP을 불러오지 못했어요.');
  gsap.timeline().set('.gsap-stage i', { opacity: 0, y: 30, rotate: -20 }).to('.gsap-stage i', { opacity: 1, y: 0, rotate: 0, stagger: .18, duration: .45, ease: 'back.out(1.7)' }).to('.gsap-stage i', { scale: 1.16, yoyo: true, repeat: 1, stagger: .08, duration: .2 });
});

// 13 Typed.js
let typedInstance;
function startTyped() {
  if (!window.Typed) return $('#typedTarget').textContent = 'bold ideas.';
  typedInstance?.destroy(); typedInstance = new Typed('#typedTarget', { strings: ['bold ideas.', 'tiny experiments.', 'better experiences.'], typeSpeed: 45, backSpeed: 25, loop: true, backDelay: 1000 });
}
$('#restartTyped').addEventListener('click', startTyped); safe(startTyped);

// 14 CountUp.js
$('#startCount').addEventListener('click', () => {
  if (window.countUp?.CountUp) new countUp.CountUp('countTarget', 30000, { duration: 2, separator: ',' }).start();
  else $('#countTarget').textContent = '30,000';
});

// 15 Canvas Confetti
$('#fireConfetti').addEventListener('click', () => {
  if (!window.confetti) return notify('Confetti를 불러오지 못했어요.');
  confetti({ particleCount: 130, spread: 85, origin: { y: .72 }, colors: ['#7c5cff', '#22d3a7', '#f1df6d', '#ffffff'] });
});

// 16 SortableJS
safe(() => { if (window.Sortable) Sortable.create($('#sortableList'), { animation: 180, ghostClass: 'sortable-ghost', onEnd: () => notify('우선순위를 바꿨어요.') }); });

// 17 Tippy.js
safe(() => { if (window.tippy) tippy('[data-tippy-content]', { animation: 'shift-away', theme: 'dark', arrow: true }); });

// 18–19 SweetAlert2
$('#showToast').addEventListener('click', () => {
  if (!window.Swal) return notify('저장 완료!');
  Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: '변경사항을 저장했어요.', showConfirmButton: false, timer: 2200, timerProgressBar: true });
});
$('#showDialog').addEventListener('click', async () => {
  if (!window.Swal) return notify('계속 진행합니다.');
  const result = await Swal.fire({ title: '계속 진행할까요?', text: '언제든 다시 돌아올 수 있어요.', icon: 'question', showCancelButton: true, confirmButtonText: '진행하기', cancelButtonText: '취소', confirmButtonColor: '#7c5cff' });
  if (result.isConfirmed) notify('좋아요, 계속 진행합니다!');
});

// 20 p5.js
let p5Seed = Math.random() * 1000;
safe(() => {
  if (!window.p5) throw new Error('p5.js not loaded');
  new p5((p) => {
    p.setup = () => { const host = $('#p5Canvas'); const canvas = p.createCanvas(host.clientWidth, host.clientHeight); canvas.parent(host); p.noStroke(); };
    p.draw = () => {
      p.background(9, 10, 16, 32);
      for (let x = 0; x < p.width; x += 16) for (let y = 0; y < p.height; y += 16) {
        const n = p.noise(x * .008, y * .008, p.frameCount * .006 + p5Seed);
        const size = 2 + n * 6; p.fill(90 + n * 80, 70 + n * 120, 220, 155); p.circle(x + Math.sin(n * 8) * 8, y + Math.cos(n * 7) * 8, size);
      }
    };
    p.windowResized = () => { const host = $('#p5Canvas'); p.resizeCanvas(host.clientWidth, host.clientHeight); };
  });
});
$('#reseedP5').addEventListener('click', () => { p5Seed = Math.random() * 1000; notify('새로운 패턴을 만들었어요.'); });

// 21 Matter.js
let physicsReset = () => {};
safe(() => {
  if (!window.Matter) throw new Error('Matter.js not loaded');
  const host = $('#physicsStage'); const { Engine, Render, Runner, Bodies, Composite } = Matter;
  const engine = Engine.create();
  const render = Render.create({ element: host, engine, options: { width: host.clientWidth, height: host.clientHeight, wireframes: false, background: 'transparent' } });
  const floor = Bodies.rectangle(host.clientWidth / 2, host.clientHeight + 15, host.clientWidth, 30, { isStatic: true, render: { fillStyle: '#22242e' } });
  Composite.add(engine.world, floor); Render.run(render); const runner = Runner.create(); Runner.run(runner, engine);
  const addBall = (x, y) => Composite.add(engine.world, Bodies.circle(x, y, 12 + Math.random() * 12, { restitution: .82, render: { fillStyle: ['#7c5cff', '#22d3a7', '#f1df6d'][Math.floor(Math.random() * 3)] } }));
  [60, 120, 180].forEach((x, index) => addBall(x, 20 + index * 20));
  host.addEventListener('pointerdown', (event) => { const rect = host.getBoundingClientRect(); addBall(event.clientX - rect.left, event.clientY - rect.top); });
  physicsReset = () => { Composite.allBodies(engine.world).filter((body) => !body.isStatic).forEach((body) => Composite.remove(engine.world, body)); };
});
$('#resetPhysics').addEventListener('click', physicsReset);

// 22 Tone.js
let synth;
$$('#piano button').forEach((button) => button.addEventListener('pointerdown', async () => {
  if (!window.Tone) return notify('Tone.js를 불러오지 못했어요.');
  await Tone.start(); synth ||= new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: .02, decay: .2, sustain: .2, release: .6 } }).toDestination();
  synth.triggerAttackRelease(button.dataset.note, '8n'); button.classList.add('playing'); setTimeout(() => button.classList.remove('playing'), 150);
}));

// 23 Three.js
safe(() => {
  if (!window.THREE) throw new Error('Three.js not loaded');
  const host = $('#threeStage'); const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, .1, 100); camera.position.z = 3.2;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(host.clientWidth, host.clientHeight); host.appendChild(renderer.domElement);
  const geometry = new THREE.IcosahedronGeometry(1, 1); const material = new THREE.MeshPhysicalMaterial({ color: 0x7c5cff, roughness: .18, metalness: .25, transmission: .25, thickness: 1, flatShading: true }); const crystal = new THREE.Mesh(geometry, material); scene.add(crystal);
  const lightA = new THREE.PointLight(0x22d3a7, 18, 8); lightA.position.set(2, 2, 3); scene.add(lightA); const lightB = new THREE.PointLight(0x8a63ff, 12, 8); lightB.position.set(-2, -1, 2); scene.add(lightB);
  let drag = false; host.addEventListener('pointerdown', () => drag = true); addEventListener('pointerup', () => drag = false); host.addEventListener('pointermove', (event) => { const rect = host.getBoundingClientRect(); lightA.position.x = ((event.clientX - rect.left) / rect.width - .5) * 5; if (drag) crystal.rotation.y += event.movementX * .01; });
  function render() { crystal.rotation.x += .003; crystal.rotation.y += .005; renderer.render(scene, camera); requestAnimationFrame(render); } render();
  addEventListener('resize', () => { const width = host.clientWidth; const height = host.clientHeight; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); });
});

// 24 Leaflet
safe(() => {
  if (!window.L) throw new Error('Leaflet not loaded');
  const map = L.map('mapStage', { scrollWheelZoom: false }).setView([37.5665, 126.978], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; OpenStreetMap' }).addTo(map);
  [['성수 크리에이티브 스트리트', 37.5445, 127.056], ['DDP 디자인 허브', 37.5663, 127.009], ['서촌 아트워크', 37.579, 126.969]].forEach(([name, lat, lng]) => L.marker([lat, lng]).addTo(map).bindPopup(`<b>${name}</b><br>Creative spot`));
});

// 25 math.js
function calculateMath() {
  try { $('#mathOutput').textContent = window.math ? math.evaluate($('#mathInput').value) : Function(`"use strict";return (${ $('#mathInput').value })`)(); }
  catch { $('#mathOutput').textContent = '수식을 확인해주세요'; }
}
$('#calculateMath').addEventListener('click', calculateMath);
$('#mathInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') calculateMath(); });

// 26 Lodash
const ideaSets = [['AI', '음악', '산책'], ['데이터', '요리', '커뮤니티'], ['AR', '교육', '게임'], ['지도', '사진', '기억'], ['음성', '여행', '친구']];
$('#shuffleIdea').addEventListener('click', () => {
  const set = window._ ? _.sample(ideaSets) : ideaSets[Math.floor(Math.random() * ideaSets.length)];
  $('#ideaOutput').textContent = set.join(' × ');
});

// 27 Fuse.js
const team = [{ name: 'Mina', role: 'Designer' }, { name: 'Joon', role: 'Developer' }, { name: 'Ara', role: 'Researcher' }, { name: 'Sol', role: 'Motion Artist' }];
const teamFuse = window.Fuse ? new Fuse(team, { keys: ['name', 'role'], threshold: .45 }) : null;
$('#fuzzyInput').addEventListener('input', (event) => {
  const query = event.target.value.trim(); const results = query && teamFuse ? teamFuse.search(query).map((result) => result.item) : team;
  $('#fuzzyResults').innerHTML = results.length ? results.map((member) => `<span>${member.name} · ${member.role}</span>`).join('') : '<span>가까운 결과가 없어요.</span>';
});

// 28 Validator.js
$('#emailInput').addEventListener('input', (event) => {
  const value = event.target.value.trim(); const valid = value && window.validator ? validator.isEmail(value) : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const state = $('#emailState'); state.className = `validation-state ${value ? (valid ? 'valid' : 'invalid') : ''}`; state.textContent = !value ? '이메일을 입력해주세요.' : valid ? '✓ 올바른 이메일 형식입니다.' : '형식을 다시 확인해주세요.';
});

// 29 Clipboard API
async function copyText(text, message = '클립보드에 복사했어요.') {
  try { await navigator.clipboard.writeText(text); notify(message); }
  catch { const area = document.createElement('textarea'); area.value = text; document.body.append(area); area.select(); document.execCommand('copy'); area.remove(); notify(message); }
}
$('#copySnippet').addEventListener('click', () => copyText("const joy = () => '✨';"));

// 30 jsPDF
$('#exportPdf').addEventListener('click', () => {
  if (!window.jspdf?.jsPDF) return notify('jsPDF를 불러오지 못했어요.');
  const doc = new jspdf.jsPDF(); doc.setFillColor(12, 13, 20); doc.rect(0, 0, 210, 297, 'F'); doc.setTextColor(124, 92, 255); doc.setFontSize(12); doc.text('JS PLAYGROUND / LAB REPORT', 20, 28); doc.setTextColor(250, 250, 252); doc.setFontSize(28); doc.text('30 experiments,', 20, 55); doc.text('one playful browser.', 20, 69); doc.setTextColor(155, 157, 170); doc.setFontSize(11); doc.text('Charts / Data / Motion / Creative Coding / Utilities', 20, 90); doc.text(`Exported: ${new Date().toLocaleString()}`, 20, 105); doc.setDrawColor(124, 92, 255); doc.line(20, 118, 190, 118); doc.save('js-playground-report.pdf');
});

// Initial entrance motion.
safe(() => {
  if (window.gsap) {
    gsap.from('.hero-copy > *', { opacity: 0, y: 24, stagger: .1, duration: .65, ease: 'power2.out' });
    gsap.from('.code-window', { opacity: 0, scale: .92, rotate: -4, duration: .9, ease: 'back.out(1.4)' });
  }
});
