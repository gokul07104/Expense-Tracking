const storageKeys = {
  user: 'et_user',
  session: 'et_session',
  expenses: 'et_expenses',
  theme: 'et_theme',
  layout: 'et_layout',
};

const dom = {
  authShell: document.getElementById('auth-shell'),
  appShell: document.getElementById('app-shell'),
  loginForm: document.getElementById('login-form'),
  registerForm: document.getElementById('register-form'),
  tabs: document.querySelectorAll('.tab-btn'),
  welcomeName: document.getElementById('welcome-name'),
  chipName: document.getElementById('chip-name'),
  chipEmail: document.getElementById('chip-email'),
  logoutBtn: document.getElementById('logout-btn'),
  quickAddBtn: document.getElementById('quick-add-btn'),
  uploadBtn: document.getElementById('upload-btn'),
  viewInsightsBtn: document.getElementById('view-insights-btn'),
  expenseForm: document.getElementById('expense-form'),
  expenseDate: document.getElementById('expense-date'),
  expenseCategory: document.getElementById('expense-category'),
  expenseAmount: document.getElementById('expense-amount'),
  expenseNote: document.getElementById('expense-note'),
  otherCategoryField: document.getElementById('other-category-field'),
  otherCategoryInput: document.getElementById('other-category-input'),
  expenseList: document.getElementById('expense-list'),
  expenseEmpty: document.getElementById('expense-empty'),
  clearExpensesBtn: document.getElementById('clear-expenses-btn'),
  statMonthTotal: document.getElementById('stat-month-total'),
  statMonthChange: document.getElementById('stat-month-change'),
  statDailyAvg: document.getElementById('stat-daily-avg'),
  statTopCategory: document.getElementById('stat-top-category'),
  statTopAmount: document.getElementById('stat-top-amount'),
  statCount: document.getElementById('stat-count'),
  barChart: document.getElementById('bar-chart'),
  pieChart: document.getElementById('pie-chart'),
  lineChart: document.getElementById('line-chart'),
  themeToggle: document.getElementById('theme-toggle'),
  layoutToggle: document.getElementById('layout-toggle'),
  quickModal: document.getElementById('quick-modal'),
  quickForm: document.getElementById('quick-form'),
  quickDate: document.getElementById('quick-date'),
  quickCategory: document.getElementById('quick-category'),
  quickOtherField: document.getElementById('quick-other-field'),
  quickOtherInput: document.getElementById('quick-other-input'),
  quickAmount: document.getElementById('quick-amount'),
  quickNote: document.getElementById('quick-note'),
  uploadModal: document.getElementById('upload-modal'),
  uploadZone: document.getElementById('upload-zone'),
  uploadInput: document.getElementById('upload-input'),
  userChip: document.getElementById('user-chip'),
  userDrawer: document.getElementById('user-drawer'),
  userForm: document.getElementById('user-form'),
  userName: document.getElementById('user-name'),
  userEmail: document.getElementById('user-email'),
  drawerName: document.getElementById('drawer-name'),
  drawerEmail: document.getElementById('drawer-email'),
  editDetailsBtn: document.getElementById('edit-details-btn'),
  changePasswordBtn: document.getElementById('change-password-btn'),
  passwordForm: document.getElementById('password-form'),
  oldPassword: document.getElementById('old-password'),
  newPassword: document.getElementById('new-password'),
  confirmPassword: document.getElementById('confirm-password'),
  backActions1: document.getElementById('back-to-actions-1'),
  backActions2: document.getElementById('back-to-actions-2'),
  drawerActions: document.getElementById('drawer-actions'),
  drawerLogoutBtn: document.getElementById('drawer-logout-btn'),
  drawerDarkToggle: document.getElementById('drawer-dark-toggle'),
  drawerLayoutToggle: document.getElementById('drawer-layout-toggle'),
};

let charts = {
  bar: null,
  pie: null,
  line: null,
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (err) {
    console.error('Storage read failed', err);
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage write failed', err);
  }
}

function setSession(email) {
  writeStorage(storageKeys.session, { email, at: Date.now() });
}

function clearSession() {
  localStorage.removeItem(storageKeys.session);
}

function currentUser() {
  const session = readStorage(storageKeys.session, null);
  const user = readStorage(storageKeys.user, null);
  if (!session || !user || session.email !== user.email) return null;
  return user;
}

function switchView(isAuthed) {
  if (isAuthed) {
    dom.authShell.classList.add('hidden');
    dom.appShell.classList.remove('hidden');
  } else {
    dom.authShell.classList.remove('hidden');
    dom.appShell.classList.add('hidden');
  }
}

function initTabs() {
  dom.tabs.forEach((btn) => {
    btn.addEventListener('click', () => {
      dom.tabs.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      document.querySelectorAll('.auth-form').forEach((form) => {
        form.classList.toggle('hidden', form.dataset.form !== tab);
      });
    });
  });
}

function registerUser(event) {
  event.preventDefault();
  const name = dom.registerForm.querySelector('#register-name').value.trim();
  const email = dom.registerForm.querySelector('#register-email').value.trim().toLowerCase();
  const password = dom.registerForm.querySelector('#register-password').value;

  if (!name || !email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  writeStorage(storageKeys.user, { name, email, password });
  alert('Account created. Please login with your credentials.');
  // switch to login tab without logging in
  dom.tabs.forEach((b) => b.classList.remove('active'));
  dom.tabs[0].classList.add('active');
  document.querySelectorAll('.auth-form').forEach((form) => {
    form.classList.toggle('hidden', form.dataset.form !== 'login');
  });
}

function loginUser(event) {
  event.preventDefault();
  const email = dom.loginForm.querySelector('#login-email').value.trim().toLowerCase();
  const password = dom.loginForm.querySelector('#login-password').value;
  const user = readStorage(storageKeys.user, null);

  if (!user || user.email !== email || user.password !== password) {
    alert('Invalid credentials. Please register first or check your password.');
    return;
  }

  setSession(email);
  hydrateUser();
  switchView(true);
}

function logout() {
  clearSession();
  switchView(false);
}

function hydrateUser() {
  const user = currentUser();
  if (!user) return;
  dom.welcomeName.textContent = `Welcome, ${user.name || 'User'}`;
  dom.chipName.textContent = user.name || 'User';
  dom.chipEmail.textContent = user.email;
  dom.drawerName.textContent = user.name || 'User';
  dom.drawerEmail.textContent = user.email;
  document.querySelectorAll('.avatar').forEach((a) => {
    a.textContent = '👤';
  });
  dom.userName.value = user.name || '';
  dom.userEmail.value = user.email || '';
}

function getExpenses() {
  return readStorage(storageKeys.expenses, []);
}

function saveExpenses(list) {
  writeStorage(storageKeys.expenses, list);
}

function addExpense(event) {
  event.preventDefault();
  const date = dom.expenseDate.value;
  const selectedCategory = dom.expenseCategory.value;
  const category =
    selectedCategory === 'Other' && dom.otherCategoryInput.value.trim()
      ? dom.otherCategoryInput.value.trim()
      : selectedCategory;
  const amount = parseFloat(dom.expenseAmount.value || '0');
  const note = dom.expenseNote.value.trim();

  if (!date || !category || !amount) {
    alert('Please complete all required fields.');
    return;
  }

  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    date,
    category,
    amount,
    note,
  };

  const list = getExpenses();
  list.push(entry);
  saveExpenses(list);
  dom.expenseForm.reset();
  dom.expenseDate.value = new Date().toISOString().slice(0, 10);
  renderExpenses();
  renderStats();
  renderCharts();
}

function addQuickExpense(event) {
  event.preventDefault();
  const date = dom.quickDate.value;
  const selectedCategory = dom.quickCategory.value;
  const category =
    selectedCategory === 'Other' && dom.quickOtherInput.value.trim()
      ? dom.quickOtherInput.value.trim()
      : selectedCategory;
  const amount = parseFloat(dom.quickAmount.value || '0');
  const note = dom.quickNote.value.trim();
  if (!date || !category || !amount) {
    alert('Please complete all required fields.');
    return;
  }
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    date,
    category,
    amount,
    note,
  };
  const list = getExpenses();
  list.push(entry);
  saveExpenses(list);
  closeModal('quick-modal');
  renderExpenses();
  renderStats();
  renderCharts();
}

function clearExpenses() {
  if (!confirm('Clear all expenses?')) return;
  saveExpenses([]);
  renderExpenses();
  renderStats();
  renderCharts();
}

function renderExpenses() {
  const list = getExpenses().sort((a, b) => new Date(b.date) - new Date(a.date));
  dom.expenseList.innerHTML = '';
  if (!list.length) {
    dom.expenseEmpty.classList.remove('hidden');
    return;
  }
  dom.expenseEmpty.classList.add('hidden');

  list.slice(0, 20).forEach((item) => {
    const div = document.createElement('div');
    div.className = 'expense-item';
    const note = item.note ? ` · ${item.note}` : '';
    div.innerHTML = `
      <div>
        <div class="expense-meta">
          <span class="badge">${item.category}</span>
          <span class="muted">${item.date}</span>
        </div>
        <div>${item.category}${note}</div>
      </div>
      <div class="amount">$${item.amount.toFixed(2)}</div>
    `;
    dom.expenseList.appendChild(div);
  });
}

function sum(values) {
  return values.reduce((acc, n) => acc + n, 0);
}

function renderStats() {
  const expenses = getExpenses();
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const lastMonthExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const lastMonth = (currentMonth + 11) % 12;
    const year = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === lastMonth && d.getFullYear() === year;
  });

  const monthTotal = sum(monthExpenses.map((e) => e.amount));
  const lastMonthTotal = sum(lastMonthExpenses.map((e) => e.amount));
  const change = lastMonthTotal ? ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  dom.statMonthTotal.textContent = `$${monthTotal.toFixed(2)}`;
  dom.statMonthChange.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs last month`;
  dom.statMonthChange.classList.toggle('positive', change >= 0);
  dom.statMonthChange.classList.toggle('negative', change < 0);

  // 7-day average
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 6);
  const last7 = expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);
  const dailyAvg = last7.length ? sum(last7.map((e) => e.amount)) / Math.min(7, last7.length) : 0;
  dom.statDailyAvg.textContent = `$${dailyAvg.toFixed(2)}`;

  // Top category
  const categoryTotals = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {});
  const topEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  dom.statTopCategory.textContent = topEntry ? topEntry[0] : '—';
  dom.statTopAmount.textContent = topEntry ? `$${topEntry[1].toFixed(2)} total` : '$0 total';

  dom.statCount.textContent = expenses.length.toString();
}

function renderCharts() {
  const expenses = getExpenses();
  const today = new Date();

  // Bar: last 7 days
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d);
  }
  const barLabels = days.map((d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const barData = days.map((day) => {
    const dayStr = day.toISOString().slice(0, 10);
    return sum(expenses.filter((e) => e.date === dayStr).map((e) => e.amount));
  });

  // Pie: category split
  const categories = [...new Set(expenses.map((e) => e.category))];
  const pieData = categories.map((c) => sum(expenses.filter((e) => e.category === c).map((e) => e.amount)));

  // Line: monthly trend this year
  const months = Array.from({ length: 12 }, (_, i) => i);
  const lineLabels = months.map((m) => new Date(2000, m, 1).toLocaleString('default', { month: 'short' }));
  const lineData = months.map((m) => {
    return sum(
      expenses
        .filter((e) => {
          const d = new Date(e.date);
          return d.getMonth() === m && d.getFullYear() === today.getFullYear();
        })
        .map((e) => e.amount)
    );
  });

  const palette = ['#7b61ff', '#ff9f59', '#06b6d4', '#f472b6', '#34d399', '#a855f7'];

  if (charts.bar) charts.bar.destroy();
  charts.bar = new Chart(dom.barChart, {
    type: 'bar',
    data: {
      labels: barLabels,
      datasets: [
        {
          label: 'Spend',
          data: barData,
          backgroundColor: palette[0],
          borderRadius: 8,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#6b7280' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        x: { ticks: { color: '#6b7280' }, grid: { display: false } },
      },
    },
  });

  if (charts.pie) charts.pie.destroy();
  charts.pie = new Chart(dom.pieChart, {
    type: 'doughnut',
    data: {
      labels: categories,
      datasets: [
        {
          data: pieData,
          backgroundColor: categories.map((_, i) => palette[i % palette.length]),
          borderWidth: 0,
        },
      ],
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      cutout: '55%',
    },
  });

  if (charts.line) charts.line.destroy();
  charts.line = new Chart(dom.lineChart, {
    type: 'line',
    data: {
      labels: lineLabels,
      datasets: [
        {
          label: 'This year',
          data: lineData,
          borderColor: palette[1],
          backgroundColor: 'rgba(255, 159, 89, 0.25)',
          tension: 0.35,
          fill: true,
          pointRadius: 4,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#6b7280' },
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        x: { ticks: { color: '#6b7280' }, grid: { display: false } },
      },
    },
  });
}

function seedDefaultDate() {
  dom.expenseDate.value = new Date().toISOString().slice(0, 10);
  dom.quickDate.value = dom.expenseDate.value;
}

function toggleTheme() {
  const root = document.documentElement;
  const body = document.body;
  const toDark = !root.classList.contains('dark');
  root.classList.toggle('dark', toDark);
  body.classList.toggle('dark', toDark);
  writeStorage(storageKeys.theme, toDark ? 'dark' : 'light');
  updateToggleLabels();
}

function toggleLayout() {
  const body = document.body;
  const toMobile = !body.classList.contains('mobile-mode');
  body.classList.toggle('mobile-mode', toMobile);
  writeStorage(storageKeys.layout, toMobile ? 'mobile' : 'desktop');
  updateToggleLabels();
}

function applyPreferences() {
  const theme = readStorage(storageKeys.theme, 'light');
  const layout = readStorage(storageKeys.layout, 'desktop');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark');
    dom.themeToggle.textContent = '☀️';
  }
  if (layout === 'mobile') {
    document.body.classList.add('mobile-mode');
  }
  updateToggleLabels();
}

function updateToggleLabels() {
  const isDark = document.documentElement.classList.contains('dark');
  const isMobile = document.body.classList.contains('mobile-mode');
  if (dom.themeToggle) dom.themeToggle.textContent = isDark ? '☀️' : '🌙';
  if (dom.drawerDarkToggle) dom.drawerDarkToggle.textContent = isDark ? 'Switch to light' : 'Switch to dark';
  if (dom.layoutToggle) dom.layoutToggle.textContent = isMobile ? '🖥️' : '📱';
  if (dom.drawerLayoutToggle) dom.drawerLayoutToggle.textContent = isMobile ? 'Use desktop layout' : 'Use mobile layout';
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('hidden');
}

function openDrawer(id) {
  const drawer = document.getElementById(id);
  if (drawer) drawer.classList.remove('hidden');
}

function closeDrawer(id) {
  const drawer = document.getElementById(id);
  if (drawer) drawer.classList.add('hidden');
}

function showDrawerPanel(panel) {
  const panels = ['actions', 'edit', 'password'];
  panels.forEach((p) => {
    if (p === 'actions') dom.drawerActions.classList.toggle('hidden', panel !== 'actions');
    if (p === 'edit') dom.userForm.classList.toggle('hidden', panel !== 'edit');
    if (p === 'password') dom.passwordForm.classList.toggle('hidden', panel !== 'password');
  });
}

function handleUpload() {
  dom.uploadInput.click();
}

function handleUploadChange() {
  if (dom.uploadInput.files.length) {
    alert(`Mock upload: ${dom.uploadInput.files[0].name} selected`);
    closeModal('upload-modal');
  }
}

function onCategoryChange(selectEl, fieldEl, inputEl) {
  const isOther = selectEl.value === 'Other';
  fieldEl.classList.toggle('hidden', !isOther);
  if (isOther) {
    inputEl.focus();
  } else {
    inputEl.value = '';
  }
}

function saveUserProfile(event) {
  event.preventDefault();
  const name = dom.userName.value.trim();
  const email = dom.userEmail.value.trim().toLowerCase();
  if (!name || !email) {
    alert('Name and email are required.');
    return;
  }
  const existing = readStorage(storageKeys.user, null) || {};
  const updated = {
    ...existing,
    name,
    email,
  };
  writeStorage(storageKeys.user, updated);
  if (readStorage(storageKeys.session, null)) {
    setSession(email);
  }
  hydrateUser();
  alert('Profile updated.');
  showDrawerPanel('actions');
}

function changePassword(event) {
  event.preventDefault();
  const oldPw = dom.oldPassword.value;
  const newPw = dom.newPassword.value;
  const confirmPw = dom.confirmPassword.value;
  const user = readStorage(storageKeys.user, null);
  if (!user) {
    alert('No user found.');
    return;
  }
  if (user.password !== oldPw) {
    alert('Old password does not match.');
    return;
  }
  if (!newPw || newPw !== confirmPw) {
    alert('New passwords must match and not be empty.');
    return;
  }
  writeStorage(storageKeys.user, { ...user, password: newPw });
  alert('Password updated.');
  dom.oldPassword.value = '';
  dom.newPassword.value = '';
  dom.confirmPassword.value = '';
  showDrawerPanel('actions');
}

function bindActions() {
  dom.registerForm.addEventListener('submit', registerUser);
  dom.loginForm.addEventListener('submit', loginUser);
  dom.logoutBtn.addEventListener('click', logout);
  dom.expenseForm.addEventListener('submit', addExpense);
  dom.clearExpensesBtn.addEventListener('click', clearExpenses);
  dom.viewInsightsBtn.addEventListener('click', () => {
    dom.lineChart.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  dom.themeToggle.addEventListener('click', toggleTheme);
  dom.layoutToggle.addEventListener('click', toggleLayout);
  dom.quickAddBtn.addEventListener('click', () => {
    dom.quickDate.value = new Date().toISOString().slice(0, 10);
    openModal('quick-modal');
  });
  dom.uploadBtn.addEventListener('click', () => openModal('upload-modal'));
  dom.quickForm.addEventListener('submit', addQuickExpense);
  dom.uploadZone.addEventListener('click', handleUpload);
  dom.uploadInput.addEventListener('change', handleUploadChange);
  dom.userChip.addEventListener('click', () => {
    showDrawerPanel('actions');
    openDrawer('user-drawer');
  });
  dom.userForm.addEventListener('submit', saveUserProfile);
  dom.passwordForm.addEventListener('submit', changePassword);
  dom.editDetailsBtn.addEventListener('click', () => showDrawerPanel('edit'));
  dom.changePasswordBtn.addEventListener('click', () => showDrawerPanel('password'));
  dom.backActions1.addEventListener('click', () => showDrawerPanel('actions'));
  dom.backActions2.addEventListener('click', () => showDrawerPanel('actions'));
  dom.drawerLogoutBtn.addEventListener('click', logout);
  dom.drawerDarkToggle.addEventListener('click', toggleTheme);
  dom.drawerLayoutToggle.addEventListener('click', toggleLayout);

  dom.expenseCategory.addEventListener('change', () =>
    onCategoryChange(dom.expenseCategory, dom.otherCategoryField, dom.otherCategoryInput)
  );
  dom.quickCategory.addEventListener('change', () =>
    onCategoryChange(dom.quickCategory, dom.quickOtherField, dom.quickOtherInput)
  );

  document.querySelectorAll('[data-close-modal]').forEach((btn) => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll('[data-close-drawer]').forEach((btn) => {
    btn.addEventListener('click', () => closeDrawer(btn.dataset.closeDrawer));
  });

  ['quick-modal', 'upload-modal'].forEach((id) => {
    const el = document.getElementById(id);
    el?.addEventListener('click', (e) => {
      if (e.target === el) closeModal(id);
    });
  });
  dom.userDrawer?.addEventListener('click', (e) => {
    if (e.target === dom.userDrawer) closeDrawer('user-drawer');
  });
}

function bootstrap() {
  initTabs();
  bindActions();
  seedDefaultDate();
  applyPreferences();
  const user = currentUser();
  if (user && readStorage(storageKeys.session, null)) {
    hydrateUser();
    switchView(true);
  } else {
    switchView(false);
  }
  onCategoryChange(dom.expenseCategory, dom.otherCategoryField, dom.otherCategoryInput);
  onCategoryChange(dom.quickCategory, dom.quickOtherField, dom.quickOtherInput);
  renderExpenses();
  renderStats();
  renderCharts();
}

document.addEventListener('DOMContentLoaded', bootstrap);
