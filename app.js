/* =========================================
   ZenFlow App Logic
   ========================================= */

// --- Global State ---
let appState = {
  theme: 'light',
  streak: 0,
  lastVisit: null,
  moods: [],
  journal: [],
  focusSessions: 0
};

// --- Daily Quotes & Tips ---
const QUOTES = [
  "You are capable of amazing things.",
  "Breathe in peace, exhale tension.",
  "One step at a time is enough.",
  "Your best effort is always enough.",
  "Focus on progress, not perfection."
];

const TIPS = [
  { cat: 'mind', title: '5-Minute Brain Dump', desc: 'Write everything on your mind to clear it.', icon: 'ph-brain' },
  { cat: 'sleep', title: 'Digital Sunset', desc: 'Turn off screens 30 mins before bed.', icon: 'ph-moon-stars' },
  { cat: 'study', title: 'Pomodoro', desc: 'Study 25 mins, break 5 mins. Repeat.', icon: 'ph-timer' },
  { cat: 'body', title: 'Hydrate', desc: 'Drink a glass of water right now.', icon: 'ph-drop' },
  { cat: 'social', title: 'Reach Out', desc: 'Text a friend just to say hi.', icon: 'ph-chat-circle' },
  { cat: 'mind', title: 'Gratitude', desc: 'Name 3 things going well today.', icon: 'ph-heart' }
];

const DAILY_CHALLENGE = "Take a 10-minute walk without looking at your phone.";

const SOUNDS = [
  { id: 's1', label: 'Rain', icon: 'ph-cloud-rain', src: 'sounds/rain.mp3' },
  { id: 's2', label: 'Forest', icon: 'ph-tree', src: 'sounds/forest.mp3' },
  { id: 's3', label: 'Waves', icon: 'ph-waves', src: 'sounds/waves.mp3' },
  { id: 's4', label: 'Fire', icon: 'ph-fire', src: 'sounds/fire.mp3' },
];

// --- DOM Elements ---
const el = {
  splash: document.getElementById('splash'),
  app: document.getElementById('app'),
  themeToggle: document.getElementById('themeToggle'),
  soundToggle: document.getElementById('soundToggle'),
  timeOfDay: document.getElementById('timeOfDay'),
  userName: document.getElementById('userName'),
  dailyQuote: document.getElementById('dailyQuote'),
  streakCount: document.getElementById('streakCount'),
  toast: document.getElementById('toast'),
  toastMsg: document.getElementById('toastMsg'),

  // Navigation
  pages: document.querySelectorAll('.page'),
  navBtns: document.querySelectorAll('.nav-btn'),
  drawerBackdrop: document.getElementById('drawerBackdrop'),
  moreDrawer: document.getElementById('moreDrawer'),

  // Mood
  homeMoodRow: document.getElementById('homeMoodRow'),
  moodSelector: document.getElementById('moodSelector'),
  moodNote: document.getElementById('moodNote'),
  logMoodBtn: document.getElementById('logMoodBtn'),
  moodBars: document.getElementById('moodBars'),
  avgValue: document.getElementById('avgValue'),
  moodHistory: document.getElementById('moodHistory'),

  // Emergency
  emergencyBtn: document.getElementById('emergencyBtn'),
  emergencyModal: document.getElementById('emergencyModal'),
  closeEmergency: document.getElementById('closeEmergency'),
  closeEmergencyFinal: document.getElementById('closeEmergencyFinal'),

  // Tips
  tipsFilter: document.getElementById('tipsFilter'),
  tipsGrid: document.getElementById('tipsGrid'),
  dailyChallenge: document.getElementById('dailyChallenge'),
  completeChallengeBtn: document.getElementById('completeChallengeBtn')
};

// --- Initialization ---
function init() {
  loadState();
  updateGreeting();
  updateStreak();
  el.dailyQuote.textContent = `"${QUOTES[Math.floor(Math.random() * QUOTES.length)]}"`;

  // Setup Views
  setupNavigation();
  setupMoodTracker();
  setupBreathing();
  setupGrounding();
  setupJournal();
  setupTips();
  setupFocusTimer();
  setupSounds();
  setupEmergency();

  // Dismiss Splash
  setTimeout(() => {
    el.splash.style.opacity = '0';
    setTimeout(() => {
      el.splash.classList.add('hidden');
      el.app.classList.remove('hidden');
    }, 500);
  }, 2000);
}

// --- State Management ---
function loadState() {
  const saved = localStorage.getItem('zenflow_state');
  if (saved) { appState = { ...appState, ...JSON.parse(saved) }; }

  if (appState.theme === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    el.themeToggle.innerHTML = '<i class="ph ph-sun"></i>';
  }
}

function saveState() {
  localStorage.setItem('zenflow_state', JSON.stringify(appState));
}

function showToast(msg) {
  el.toastMsg.textContent = msg;
  el.toast.classList.remove('hidden');
  setTimeout(() => el.toast.classList.add('hidden'), 3000);
}

// --- Header Logic ---
function updateGreeting() {
  const hr = new Date().getHours();
  let timeStr = 'evening';
  if (hr < 12) timeStr = 'morning';
  else if (hr < 18) timeStr = 'afternoon';
  el.timeOfDay.textContent = timeStr;
}

function updateStreak() {
  const today = new Date().toDateString();
  if (appState.lastVisit !== today) {
    if (appState.lastVisit === new Date(Date.now() - 86400000).toDateString()) {
      appState.streak++;
    } else if (!appState.lastVisit) {
      appState.streak = 1;
    } else {
      appState.streak = 1; // reset broken streak
    }
    appState.lastVisit = today;
    saveState();
  }
  el.streakCount.textContent = appState.streak;
}

el.themeToggle.addEventListener('click', () => {
  const isDark = document.body.hasAttribute('data-theme');
  if (isDark) {
    document.body.removeAttribute('data-theme');
    el.themeToggle.innerHTML = '<i class="ph ph-moon"></i>';
    appState.theme = 'light';
  } else {
    document.body.setAttribute('data-theme', 'dark');
    el.themeToggle.innerHTML = '<i class="ph ph-sun"></i>';
    appState.theme = 'dark';
  }
  saveState();
});

// Sound quick toggle sends to sound page
el.soundToggle.addEventListener('click', () => navigateTo('music'));

// --- Navigation ---
function navigateTo(pageId) {
  // Hide all
  el.pages.forEach(p => p.classList.remove('active'));
  el.navBtns.forEach(btn => btn.classList.remove('active'));
  el.moreDrawer.classList.add('hidden');

  // Show target
  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) targetPage.classList.add('active');

  const targetNav = document.getElementById(`nav${pageId.charAt(0).toUpperCase() + pageId.slice(1)}`);
  if (targetNav) targetNav.classList.add('active');

  window.scrollTo(0, 0);
}

function setupNavigation() {
  el.navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pageId = e.currentTarget.dataset.page;
      if (pageId === 'more') {
        el.moreDrawer.classList.remove('hidden');
      } else {
        navigateTo(pageId);
      }
    });
  });

  el.drawerBackdrop.addEventListener('click', () => el.moreDrawer.classList.add('hidden'));
}

// --- Mood Tracker ---
const moodEmoji = ["", "ph-smiley-x-eyes", "ph-smiley-sad", "ph-smiley-meh", "ph-smiley", "ph-smiley-wink"];

function setupMoodTracker() {
  // Home Pills
  const homePills = el.homeMoodRow.querySelectorAll('.mood-pill');
  homePills.forEach(pill => {
    pill.addEventListener('click', () => {
      homePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      const val = parseInt(pill.dataset.mood);
      logMood(val, "");
      setTimeout(() => navigateTo('mood'), 500);
    });
  });

  // Mood Page Picker
  let selectedMood = null;
  const moodBtns = el.moodSelector.querySelectorAll('.mood-btn');
  moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      moodBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedMood = parseInt(btn.dataset.val);
    });
  });

  el.logMoodBtn.addEventListener('click', () => {
    if (!selectedMood) return showToast("Please select a mood first.");
    logMood(selectedMood, el.moodNote.value);
    el.moodNote.value = '';
    moodBtns.forEach(b => b.classList.remove('active'));
    selectedMood = null;
  });

  renderMoodLog();
}

function logMood(val, note) {
  appState.moods.unshift({
    date: Date.now(),
    val: val,
    note: note
  });
  if (appState.moods.length > 50) appState.moods.pop();
  saveState();
  renderMoodLog();
  showToast("Mood logged");
}

function renderMoodLog() {
  el.moodHistory.innerHTML = '';
  appState.moods.slice(0, 10).forEach(m => {
    const d = new Date(m.date);
    const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    el.moodHistory.innerHTML += `
      <div class="history-item glass-card">
        <span class="h-date">${dateStr}</span>
        <i class="ph-fill ${moodEmoji[m.val]} h-icon"></i>
        <span class="h-note">${m.note || 'No note'}</span>
      </div>
    `;
  });

  // Chart
  el.moodBars.innerHTML = '';
  let sum = 0;
  const last7 = appState.moods.slice(0, 7);
  if (last7.length > 0) {
    last7.forEach(m => sum += m.val);
    el.avgValue.textContent = (sum / last7.length).toFixed(1);

    // Reverse for chronological chart
    [...last7].reverse().forEach(m => {
      const h = (m.val / 5) * 100;
      const d = new Date(m.date).toLocaleDateString('en-US', { weekday: 'narrow' });
      el.moodBars.innerHTML += `
        <div class="m-bar-col">
          <div class="m-bar-wrap"><div class="m-bar" style="height: ${h}%"></div></div>
          <span class="m-day">${d}</span>
        </div>
      `;
    });
  }
}

// --- Breathing ---
let breathInterval, breathTimeout;
let isBreathing = false;
const breathSettings = {
  '478': { in: 4, hold: 7, out: 8, label: "4-7-8 Breathing", desc: "Inhale 4s · Hold 7s · Exhale 8s. Good for anxiety." },
  'box': { in: 4, hold: 4, out: 4, hold2: 4, label: "Box Breathing", desc: "Inhale 4s · Hold 4s · Exhale 4s · Hold 4s." },
  'calm': { in: 5, out: 5, label: "Calm Breathing", desc: "Even 5s inhale, 5s exhale. Balances nervous system." }
};
let curBType = '478';
const bel = {
  tabs: document.querySelectorAll('#breathTabs .tab-btn'),
  name: document.getElementById('breathTechName'),
  desc: document.getElementById('breathTechDesc'),
  circle: document.getElementById('breathCircle'),
  outer: document.getElementById('breathOuter'),
  label: document.getElementById('breathLabel'),
  count: document.getElementById('breathCount'),
  ring: document.getElementById('ringFill'),
  cycles: document.getElementById('cycleCount'),
  start: document.getElementById('breathStart'),
  reset: document.getElementById('breathReset')
};

function setupBreathing() {
  bel.tabs.forEach(t => t.addEventListener('click', (e) => {
    if (isBreathing) resetBreathing();
    bel.tabs.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    curBType = e.target.dataset.tech;
    bel.name.textContent = breathSettings[curBType].label;
    bel.desc.textContent = breathSettings[curBType].desc;
  }));

  bel.start.addEventListener('click', () => {
    isBreathing ? resetBreathing() : startBreathing();
  });
  bel.reset.addEventListener('click', resetBreathing);
}

function startBreathing() {
  isBreathing = true;
  bel.start.innerHTML = '<i class="ph-fill ph-stop"></i> Stop';
  bel.start.style.background = 'var(--accent)';
  bel.cycles.textContent = '0';
  runBreathCycle(1);
}

function resetBreathing() {
  isBreathing = false;
  bel.start.innerHTML = '<i class="ph-fill ph-play"></i> Start';
  bel.start.style.background = 'var(--primary)';
  clearTimeout(breathTimeout);
  clearInterval(breathInterval);
  bel.label.textContent = 'Ready';
  bel.count.textContent = '';
  bel.outer.style.transform = 'scale(1)';
  bel.ring.style.strokeDashoffset = '678';
  bel.ring.style.transition = 'none';
}

function sTime(sec) { return sec * 1000; }

function runBreathCycle(cycleNum) {
  if (!isBreathing) return;
  bel.cycles.textContent = cycleNum;
  const cfg = breathSettings[curBType];

  // Inhale
  bel.label.textContent = 'Breathe In';
  bel.outer.style.transform = 'scale(1.4)';
  bel.ring.style.transition = `stroke-dashoffset ${cfg.in}s linear`;
  bel.ring.style.strokeDashoffset = '0';
  countdown(cfg.in);

  breathTimeout = setTimeout(() => {
    if (!isBreathing) return;

    if (cfg.hold) { // Hold 1
      bel.label.textContent = 'Hold';
      bel.outer.style.transform = 'scale(1.4)';
      countdown(cfg.hold);

      breathTimeout = setTimeout(() => {
        if (!isBreathing) return;
        exhalePh(cfg, cycleNum);
      }, sTime(cfg.hold));

    } else {
      exhalePh(cfg, cycleNum);
    }
  }, sTime(cfg.in));
}

function exhalePh(cfg, cycleNum) {
  bel.label.textContent = 'Breathe Out';
  bel.outer.style.transform = 'scale(1)';
  bel.ring.style.transition = `stroke-dashoffset ${cfg.out}s linear`;
  bel.ring.style.strokeDashoffset = '678';
  countdown(cfg.out);

  breathTimeout = setTimeout(() => {
    if (!isBreathing) return;

    if (cfg.hold2) { // Hold 2 (Box)
      bel.label.textContent = 'Hold';
      countdown(cfg.hold2);
      breathTimeout = setTimeout(() => runBreathCycle(cycleNum + 1), sTime(cfg.hold2));
    } else {
      runBreathCycle(cycleNum + 1);
    }
  }, sTime(cfg.out));
}

function countdown(sec) {
  let left = sec;
  bel.count.textContent = left;
  clearInterval(breathInterval);
  breathInterval = setInterval(() => {
    left--;
    bel.count.textContent = left > 0 ? left : '';
    if (left <= 0) clearInterval(breathInterval);
  }, 1000);
}

// --- Grounding ---
const groundCfg = [
  { s: 1, n: 5, title: "SEE", icon: "ph-eye", desc: "Name 5 things you can see right now." },
  { s: 2, n: 4, title: "FEEL", icon: "ph-hand", desc: "Name 4 things you can physically feel." },
  { s: 3, n: 3, title: "HEAR", icon: "ph-ear", desc: "Name 3 things you can hear." },
  { s: 4, n: 2, title: "SMELL", icon: "ph-nose", desc: "Name 2 things you can smell." },
  { s: 5, n: 1, title: "TASTE", icon: "ph-smiley-blank", desc: "Name 1 good thing about yourself, or 1 thing you can taste." }
];
let curGStep = 0;
const gel = {
  dots: document.querySelectorAll('.ground-step-dot'),
  card: document.getElementById('groundCard'),
  icon: document.getElementById('groundIcon'),
  title: document.getElementById('groundTitle'),
  desc: document.getElementById('groundDesc'),
  inputs: document.getElementById('groundInputs'),
  prev: document.getElementById('groundPrev'),
  next: document.getElementById('groundNext'),
  comp: document.getElementById('groundComplete'),
  rest: document.getElementById('groundRestart')
};

function setupGrounding() {
  renderGroundStep();
  gel.next.addEventListener('click', () => { curGStep++; renderGroundStep(); });
  gel.prev.addEventListener('click', () => { curGStep--; renderGroundStep(); });
  gel.rest.addEventListener('click', () => { curGStep = 0; renderGroundStep(); });
}

function renderGroundStep() {
  if (curGStep >= 5) {
    gel.card.classList.add('hidden');
    gel.prev.parentElement.classList.add('hidden');
    gel.comp.classList.remove('hidden');
    return;
  }

  gel.card.classList.remove('hidden');
  gel.prev.parentElement.classList.remove('hidden');
  gel.comp.classList.add('hidden');

  gel.prev.disabled = curGStep === 0;
  gel.next.innerHTML = curGStep === 4 ? '<i class="ph-bold ph-check"></i> Finish' : 'Next <i class="ph-bold ph-arrow-right"></i>';

  const step = groundCfg[curGStep];
  gel.icon.innerHTML = `<i class="ph-fill ${step.icon}"></i>`;
  gel.title.textContent = `${step.n} Things You Can ${step.title}`;
  gel.desc.textContent = step.desc;

  gel.inputs.innerHTML = '';
  for (let i = 1; i <= step.n; i++) {
    gel.inputs.innerHTML += `
      <div class="g-input-wrap">
        <span class="g-input-num">${i}.</span>
        <input type="text" class="g-input" placeholder="Type here (optional)..." />
      </div>
    `;
  }

  gel.dots.forEach((d, idx) => {
    d.className = 'ground-step-dot';
    if (idx < curGStep) d.classList.add('done');
    if (idx === curGStep) d.classList.add('active');
  });
}

// --- Journal ---
function setupJournal() {
  document.getElementById('journalDate').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  const prompts = ["What is causing stress today?", "What am I grateful for?", "A letter to my future self", "What do I need right now?"];
  const pRow = document.getElementById('journalPrompts');
  prompts.forEach(p => {
    const b = document.createElement('button');
    b.className = 'prompt-chip';
    b.textContent = p;
    b.onclick = () => document.getElementById('journalEditor').value = p + "\n\n";
    pRow.appendChild(b);
  });

  const ed = document.getElementById('journalEditor');
  const wc = document.getElementById('wordCount');
  ed.addEventListener('input', () => {
    const w = ed.value.trim().split(/\s+/).filter(x => x.length > 0).length;
    wc.textContent = `${w} word${w !== 1 ? 's' : ''}`;
  });

  document.getElementById('saveJournal').addEventListener('click', () => {
    if (!ed.value.trim()) return;
    appState.journal.unshift({ date: Date.now(), text: ed.value.trim() });
    saveState();
    ed.value = '';
    wc.textContent = '0 words';
    showToast("Journal saved");
    renderJournalHistory();
  });

  document.getElementById('clearJournal').addEventListener('click', () => { ed.value = ''; wc.textContent = '0 words'; });

  renderJournalHistory();
}

function renderJournalHistory() {
  const list = document.getElementById('entriesList');
  list.innerHTML = '';
  if (appState.journal.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted)">No entries yet.</p>';
    return;
  }
  appState.journal.forEach(j => {
    const d = new Date(j.date).toLocaleDateString();
    list.innerHTML += `
      <div class="history-item glass-card" style="margin-bottom:0.5rem">
        <span class="h-date" style="font-weight:bold;color:var(--primary)">${d}</span>
        <span class="h-note">${j.text.substring(0, 100)}${j.text.length > 100 ? '...' : ''}</span>
      </div>
    `;
  });
}

// --- Tips ---
function setupTips() {
  el.dailyChallenge.textContent = DAILY_CHALLENGE;
  el.completeChallengeBtn.addEventListener('click', () => {
    el.completeChallengeBtn.innerHTML = '<i class="ph-bold ph-check"></i> Completed';
    el.completeChallengeBtn.style.background = 'var(--success)';
    el.completeChallengeBtn.disabled = true;
    showToast("Great job completing the challenge!");
  });

  el.tipsFilter.addEventListener('click', (e) => {
    if (!e.target.classList.contains('filter-chip')) return;
    document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
    e.target.classList.add('active');
    renderTips(e.target.dataset.cat);
  });
  renderTips('all');
}

function renderTips(cat) {
  el.tipsGrid.innerHTML = '';
  const fTips = cat === 'all' ? TIPS : TIPS.filter(t => t.cat === cat);
  fTips.forEach(t => {
    el.tipsGrid.innerHTML += `
      <div class="tip-card">
        <div class="tip-icon"><i class="ph-fill ${t.icon}"></i></div>
        <div class="tip-content">
          <h4>${t.title}</h4>
          <p>${t.desc}</p>
        </div>
      </div>
    `;
  });
}

// --- Focus Timer ---
let tInt, tTime = 1500, tMode = 'pomodoro', isTRunning = false;
const tmEl = {
  d: document.getElementById('timerDisplay'),
  r: document.getElementById('timerRing'),
  btn: document.getElementById('timerStart'),
  txt: document.getElementById('timerStartText'),
  ico: document.getElementById('timerStartIcon')
};

function setupFocusTimer() {
  document.getElementById('timerReset').onclick = () => resetTimer();
  document.getElementById('timerSkip').onclick = () => skipTimer();
  tmEl.btn.onclick = () => { isTRunning ? pauseTimer() : tStart(); };

  // Tasks
  const iBtn = document.getElementById('addTaskBtn');
  const inp = document.getElementById('taskInput');
  iBtn.onclick = () => {
    if (!inp.value) return;
    document.getElementById('taskList').innerHTML += `
      <li class="ftask">
        <span onclick="this.parentElement.classList.toggle('done')">• ${inp.value}</span>
        <button class="ftask-del" onclick="this.parentElement.remove()"><i class="ph ph-trash"></i></button>
      </li>
    `;
    inp.value = '';
  };
}

window.setTimerMode = function (m) {
  document.querySelectorAll('.timer-mode-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(m === 'pomodoro' ? 'pomodoroTab' : m === 'short' ? 'shortBreakTab' : 'longBreakTab').classList.add('active');
  tMode = m;
  document.getElementById('timerModeLabel').textContent = m === 'pomodoro' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break';
  resetTimer();
}

function rTime() {
  const m = Math.floor(tTime / 60).toString().padStart(2, '0');
  const s = (tTime % 60).toString().padStart(2, '0');
  tmEl.d.textContent = `${m}:${s}`;
  const max = tMode === 'pomodoro' ? 1500 : tMode === 'short' ? 300 : 900;
  const pct = tTime / max;
  tmEl.r.style.strokeDasharray = `${pct * 603} 603`; // r=96
}

function tStart() {
  isTRunning = true;
  tmEl.txt.textContent = 'Pause';
  tmEl.ico.className = 'ph-fill ph-pause';
  tInt = setInterval(() => {
    tTime--; rTime();
    if (tTime <= 0) {
      clearInterval(tInt);
      isTRunning = false;
      showToast("Time's up!");
      appState.focusSessions++;
      document.getElementById('sessionsDone').textContent = appState.focusSessions;
      saveState();
    }
  }, 1000);
}

function pauseTimer() {
  isTRunning = false;
  tmEl.txt.textContent = 'Start';
  tmEl.ico.className = 'ph-fill ph-play';
  clearInterval(tInt);
}

function resetTimer() {
  isTRunning = false;
  tmEl.txt.textContent = 'Start';
  tmEl.ico.className = 'ph-fill ph-play';
  clearInterval(tInt);
  tTime = tMode === 'pomodoro' ? 1500 : tMode === 'short' ? 300 : 900;
  rTime();
}

function skipTimer() {
  tTime = 0; rTime(); pauseTimer();
}

// --- Sounds ---
let activeSoundMap = {};
const volumeControl = document.getElementById('masterVolume');

function setupSounds() {
  const grid = document.getElementById('soundsGrid');
  grid.innerHTML = '';

  SOUNDS.forEach(s => {
    const card = document.createElement('div');
    card.className = 'sound-card';
    card.id = `snd_card_${s.id}`;
    card.dataset.id = s.id;
    card.dataset.src = s.src;
    card.innerHTML = `
      <i class="ph-fill ${s.icon}"></i>
      <span class="s-label">${s.label}</span>
      <audio id="snd_audio_${s.id}" src="${s.src}" loop></audio>
    `;

    card.addEventListener('click', () => toggleSound(s.id));
    grid.appendChild(card);
  });

  volumeControl.addEventListener('input', (e) => {
    const vol = e.target.value / 100;
    Object.keys(activeSoundMap).forEach(id => {
      const audio = document.getElementById(`snd_audio_${id}`);
      if (audio) audio.volume = vol;
    });
  });

  document.getElementById('stopAllSoundsBtn').addEventListener('click', () => {
    Object.keys(activeSoundMap).forEach(id => toggleSound(id, true));
    showToast("All sounds stopped");
  });
}

function toggleSound(id, forceStop = false) {
  const audio = document.getElementById(`snd_audio_${id}`);
  const card = document.getElementById(`snd_card_${id}`);
  if (!audio || !card) return;

  if (activeSoundMap[id] || forceStop) {
    audio.pause();
    card.classList.remove('playing');
    delete activeSoundMap[id];
  } else {
    audio.volume = volumeControl.value / 100;
    audio.play().catch(() => showToast("Audio play blocked."));
    card.classList.add('playing');
    activeSoundMap[id] = true;
  }
}

// --- Emergency Modal ---
function setupEmergency() {
  el.emergencyBtn.addEventListener('click', () => { el.emergencyModal.classList.remove('hidden'); showEmergencyStep(1); });
  el.closeEmergency.addEventListener('click', () => el.emergencyModal.classList.add('hidden'));
  el.closeEmergencyFinal.addEventListener('click', () => el.emergencyModal.classList.add('hidden'));

  // Step 4 hold logic
  const pBtn = document.getElementById('pressBtn');
  const pProg = document.getElementById('pressProgress');
  const pDone = document.getElementById('pressDone');
  let pTim, pw = 0;

  pBtn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pBtn.textContent = 'Holding...';
    pTim = setInterval(() => {
      pw += 2; // 50 increments = 5 seconds
      pProg.style.opacity = '1';
      pProg.style.transform = `rotate(${pw * 3.6 - 45}deg)`;
      if (pw >= 100) {
        clearInterval(pTim);
        pBtn.textContent = 'Done!';
        pBtn.style.background = 'var(--success)';
        pProg.style.borderTopColor = 'var(--success)';
        pDone.classList.remove('hidden');
      }
    }, 100);
  });

  const endHold = () => {
    clearInterval(pTim);
    if (pw < 100) { pBtn.textContent = 'Hold Me'; pw = 0; pProg.style.opacity = '0'; }
  };
  pBtn.addEventListener('pointerup', endHold);
  pBtn.addEventListener('pointerleave', endHold);
}

window.nextEmergencyStep = function (n) {
  if (n === 5) {
    const aff = ["I am safe right now.", "This feeling will pass.", "I am capable of handling this.", "My breath anchors me."];
    document.getElementById('affirmationBox').textContent = `"${aff[Math.floor(Math.random() * aff.length)]}"`;
  }
  showEmergencyStep(n);
};

function showEmergencyStep(n) {
  document.querySelectorAll('.estep').forEach(e => e.classList.add('hidden'));
  document.getElementById(`estep${n}`).classList.remove('hidden');
}

// --- PWA Install Prompt ---
let deferredInstallPrompt = null;
const installPopup = document.getElementById('installPopup');
const installConfirm = document.getElementById('installConfirm');
const installCancel = document.getElementById('installCancel');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  // Only show if user hasn't dismissed before
  if (localStorage.getItem('zenflow_install_dismissed')) return;
  setTimeout(() => {
    installPopup.classList.remove('hidden');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => installPopup.classList.add('show'));
    });
  }, 3000);
});

installConfirm.addEventListener('click', async () => {
  if (!deferredInstallPrompt) return;
  deferredInstallPrompt.prompt();
  const { outcome } = await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  installPopup.classList.remove('show');
  setTimeout(() => installPopup.classList.add('hidden'), 400);
  if (outcome === 'accepted') showToast('ZenFlow installed! 🎉');
});

installCancel.addEventListener('click', () => {
  localStorage.setItem('zenflow_install_dismissed', '1');
  installPopup.classList.remove('show');
  setTimeout(() => installPopup.classList.add('hidden'), 400);
});

// Hide popup if already installed
window.addEventListener('appinstalled', () => {
  installPopup.classList.remove('show');
  setTimeout(() => installPopup.classList.add('hidden'), 400);
});

// Start
init();
