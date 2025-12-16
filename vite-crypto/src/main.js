import './style.css';
import { Chart } from 'chart.js/auto';

const app = document.querySelector('#app');
app.innerHTML = `
  <h1>Dashboard Krypto-Inwestora</h1>

  <h2>Top 50 kryptowalut</h2>
  <table id="coins-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Nazwa</th>
        <th id="price-header">Cena [PLN]</th>
        <th>Zmiana 24h [%]</th>
      </tr>
    </thead>
    <tbody id="coins-body"></tbody>
  </table>

  <h2>Wykres (ostatnie 7 dni)</h2>
  <div class="chart-wrapper">
    <canvas id="chart-canvas"></canvas>
  </div>

  <h2>Kalkulator: PLN → BTC</h2>
  <div id="calculator">
    <input type="number" id="pln-input" placeholder="np. 5000" />
    <span>PLN</span>
    <p id="btc-output"></p>
  </div>
`;

let coins = [];
let sortDirection = "desc";
let btcPrice = null;
let chartInstance = null;

const API_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=pln&order=market_cap_desc&per_page=50&page=1&sparkline=false';

async function loadCoins() {
  const response = await fetch(API_URL);

  const data = await response.json();
  coins = [...data];
  const btc = coins.find(item => item.id === 'bitcoin')
  btcPrice = btc.current_price;

  renderTable();
}


function renderTable() {
  const tbody = document.getElementById('coins-body');
tbody.innerHTML = '';

coins.forEach((coin, index) => {
  const row = document.createElement('tr');

  const cellIndex = document.createElement('td');
  const cellName = document.createElement('td');
  const cellPrice = document.createElement('td');
  const cellChange = document.createElement('td');

  cellIndex.textContent = index + 1;
  cellName.textContent = coin.name;
  cellPrice.textContent = coin.current_price;
  cellChange.textContent = coin.price_change_percentage_24h;


  row.appendChild(cellIndex);
  row.appendChild(cellName);
  row.appendChild(cellPrice);
  row.appendChild(cellChange);

  row.addEventListener('click', ()=>{
    loadChartForCoin(coin);
  })

  tbody.appendChild(row);
});
}
loadCoins();



async function loadChartForCoin(coin) {
  const url = `https://api.coingecko.com/api/v3/coins/${coin.id}/market_chart?vs_currency=pln&days=7`;
  const response = await fetch(url);

  const data = await response.json();

  const prices = data.prices

  renderChart(prices, coin)
}

function renderChart(prices, coin) {
const canvas = document.getElementById('chart-canvas');

const labels = prices.map(item => {
   return new Date(item[0]).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit'
    });
});

const values = prices.map(item=>item[1])

if (chartInstance) {
    chartInstance.destroy();
  }

   chartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: coin.name,
        data: values,
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}


function toggleSort() {
  console.log('da');
  sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';

  coins.sort((a,b) => {
    return sortDirection === 'asc'
    ? a.current_price - b.current_price
    : b.current_price - a.current_price;
  });
  renderTable();
}
const priceHeader = document.getElementById('price-header');
priceHeader.style.cursor = 'pointer';
priceHeader.addEventListener('click', toggleSort);

const input = document.getElementById("pln-input");
const output = document.getElementById('btc-output');

input.addEventListener('input', ()=>{
  let plnValue = Number(input.value)
  if(!plnValue || !btcPrice) {
    input.textContent = '';
    return;
  }
  let btcAmount = plnValue / btcPrice;
  output.textContent = `To jest : ${btcAmount.toFixed(6)}`;
})