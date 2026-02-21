const form = document.getElementById('calcForm');
const areaInput = document.getElementById('area');
const resultCard = document.getElementById('resultCard');
const totalVolumeEl = document.getElementById('totalVolume');
const tankLoadsEl = document.getElementById('tankLoads');
const areaPerTankEl = document.getElementById('areaPerTank');
const totalProductEl = document.getElementById('totalProduct');
const productPerTankEl = document.getElementById('productPerTank');
const historyList = document.getElementById('historyList');
const emptyHistory = document.getElementById('emptyHistory');
const clearHistoryBtn = document.getElementById('clearHistory');
const themeToggle = document.getElementById('themeToggle');
const mapAreaEl = document.getElementById('mapArea');
const useMapAreaBtn = document.getElementById('useMapArea');

const HISTORY_KEY = 'calda-history-v1';
const THEME_KEY = 'calda-theme-v1';

const numberFmt = new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 2 });

let latestMapAreaHa = 0;

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
        <strong>${numberFmt.format(entry.totalVolume)} L de calda</strong>
        <p class="history-meta">${entry.area} ha • ${entry.volumeHa} L/ha • Dose ${entry.productDose} L/ha • Produto ${numberFmt.format(entry.totalProduct)} L</p>
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

const calculate = ({ area, volumeHa, productDose, tank }) => {
  const totalVolume = area * volumeHa;
  const tankLoads = totalVolume / tank;
  const areaPerTank = tank / volumeHa;
  const totalProduct = area * productDose;
  const productPerTank = areaPerTank * productDose;

  return { totalVolume, tankLoads, areaPerTank, totalProduct, productPerTank };
};

const updateMapArea = (valueHa) => {
  latestMapAreaHa = valueHa;
  mapAreaEl.textContent = `Área desenhada: ${numberFmt.format(valueHa)} ha`;
  useMapAreaBtn.disabled = valueHa <= 0;
};

const initMap = () => {
  if (!window.L || !window.turf) {
    mapAreaEl.textContent = 'Não foi possível carregar o mapa (sem internet ou bloqueio de CDN).';
    return;
  }

  const map = L.map('map').setView([39.5, -8], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  const drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);

  const drawControl = new L.Control.Draw({
    edit: { featureGroup: drawnItems },
    draw: {
      polygon: {
        allowIntersection: false,
        showArea: true
      },
      polyline: false,
      rectangle: true,
      circle: false,
      marker: false,
      circlemarker: false
    }
  });
  map.addControl(drawControl);

  const recalculateArea = () => {
    const all = drawnItems.toGeoJSON();

    if (!all.features.length) {
      updateMapArea(0);
      return;
    }

    const totalSquareMeters = all.features.reduce((sum, feature) => sum + turf.area(feature), 0);
    const hectares = totalSquareMeters / 10000;
    updateMapArea(hectares);
  };

  map.on(L.Draw.Event.CREATED, (event) => {
    drawnItems.addLayer(event.layer);
    recalculateArea();
  });

  map.on(L.Draw.Event.EDITED, recalculateArea);
  map.on(L.Draw.Event.DELETED, recalculateArea);
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const area = Number(areaInput.value);
  const volumeHa = Number(document.getElementById('volumeHa').value);
  const productDose = Number(document.getElementById('productDose').value);
  const tank = Number(document.getElementById('tank').value);

  if (!area || !volumeHa || !productDose || !tank) {
    return;
  }

  const result = calculate({ area, volumeHa, productDose, tank });

  totalVolumeEl.textContent = `${numberFmt.format(result.totalVolume)} L`;
  tankLoadsEl.textContent = numberFmt.format(result.tankLoads);
  areaPerTankEl.textContent = `${numberFmt.format(result.areaPerTank)} ha`;
  totalProductEl.textContent = `${numberFmt.format(result.totalProduct)} L`;
  productPerTankEl.textContent = `${numberFmt.format(result.productPerTank)} L`;

  resultCard.hidden = false;

  appendToHistory({
    area,
    volumeHa,
    productDose,
    tank,
    ...result,
    date: new Date().toISOString()
  });
});

useMapAreaBtn.addEventListener('click', () => {
  areaInput.value = latestMapAreaHa > 0 ? latestMapAreaHa.toFixed(2) : '';
  areaInput.dispatchEvent(new Event('input'));
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
  initMap();
};

init();
