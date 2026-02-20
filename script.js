const form = document.getElementById('calcForm');
const resultCard = document.getElementById('resultCard');
const totalVolumeEl = document.getElementById('totalVolume');
const tankLoadsEl = document.getElementById('tankLoads');
const areaPerTankEl = document.getElementById('areaPerTank');
const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');
const clearHistoryBtn = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');

const HISTORY_KEY = 'calda-history-v1';
const THEME_KEY = 'calda-theme-v1';

const numberFmt = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 });

const readHistory = () => JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');

const saveHistory = (items) => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
};

const formatDate = (iso) =>
  new Date(iso).toLocaleString('pt-PT', {
    dateStyle: 'short',
    timeStyle: 'short'
  });

const renderHistory = () => {
  const entries = readHistory();
  historyList.innerHTML = '';

  if (!entries.length) {
    emptyHistory.hidden = false;
    return;
  }

  emptyHistory.hidden = true;

  entries.forEach((entry) => {
    const item = document.createElement('li');
    item.innerHTML = `
      <div>
        <strong>${numberFmt.format(entry.totalVolume)} L</strong>
        <p class="history-meta">${entry.area} ha • ${entry.volumeHa} L/ha • Depósito ${entry.tank} L</p>
      </div>
      <span class="history-meta">${formatDate(entry.date)}</span>
    `;
    historyList.appendChild(item);
  });
};

const appendToHistory = (payload) => {
  const entries = readHistory();
  entries.unshift(payload);
  saveHistory(entries.slice(0, 10));
  renderHistory();
};

const calculate = ({ area, volumeHa, tank }) => {
  const totalVolume = area * volumeHa;
  const tankLoads = totalVolume / tank;
  const areaPerTank = tank / volumeHa;

  return { totalVolume, tankLoads, areaPerTank };
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const area = Number(document.getElementById('area').value);
  const volumeHa = Number(document.getElementById('volumeHa').value);
  const tank = Number(document.getElementById('tank').value);

  if (!area || !volumeHa || !tank) {
    return;
  }

  const result = calculate({ area, volumeHa, tank });

  totalVolumeEl.textContent = `${numberFmt.format(result.totalVolume)} L`;
  tankLoadsEl.textContent = numberFmt.format(result.tankLoads);
  areaPerTankEl.textContent = `${numberFmt.format(result.areaPerTank)} ha`;

  resultCard.hidden = false;

  appendToHistory({
    area,
    volumeHa,
    tank,
    ...result,
    date: new Date().toISOString()
  });
});

clearHistoryBtn.addEventListener('click', () => {
  saveHistory([]);
  renderHistory();
});

const setTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  localStorage.setItem(THEME_KEY, theme);
};

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(nextTheme);
});

const init = () => {
  const savedTheme = localStorage.getItem(THEME_KEY) ?? 'dark';
  setTheme(savedTheme);
  renderHistory();
};

init();
