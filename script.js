const apiBase = "https://api.coingecko.com/api/v3";

async function fetchTrendingCryptos() {
  const loader = document.getElementById('loader');
  loader.style.display = 'block';
  const search = document.getElementById('search');

  try {
    const response = await fetch(`${apiBase}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12`);
    const cryptos = await response.json();
    const cryptoList = document.getElementById('crypto-list');

    function renderCryptos(cryptos) {
      cryptoList.innerHTML = '';
      cryptos.forEach(crypto => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        col.innerHTML = `
          <div class="card p-3">
            <h5>${crypto.name}</h5>
            <img src="${crypto.image}" alt="${crypto.name}" class="img-fluid mb-2">
            <p>Price: $${crypto.current_price.toFixed(2)}</p>
            <a href="details.html?crypto=${crypto.id}" class="btn btn-primary">View Details</a>
          </div>`;
        cryptoList.appendChild(col);
      });
    }

    renderCryptos(cryptos);

    search.addEventListener('input', () => {
      const filtered = cryptos.filter(crypto =>
        crypto.name.toLowerCase().includes(search.value.toLowerCase())
      );
      renderCryptos(filtered);
    });
  } catch (error) {
    console.error("Error fetching cryptocurrencies:", error);
  } finally {
    loader.style.display = 'none';
  }
}

async function fetchCryptoDetails() {
  const params = new URLSearchParams(window.location.search);
  const cryptoId = params.get('crypto');

  if (!cryptoId) return;

  try {
    const [detailsResponse, historyResponse] = await Promise.all([
      fetch(`${apiBase}/coins/${cryptoId}`),
      fetch(`${apiBase}/coins/${cryptoId}/market_chart?vs_currency=usd&days=7`)
    ]);

    const details = await detailsResponse.json();
    const history = await historyResponse.json();

    document.getElementById('crypto-name').textContent = details.name;
    document.getElementById('crypto-image').src = details.image.large;
    document.getElementById('crypto-description').textContent = details.description.en || "No description available.";
    document.getElementById('crypto-price').textContent = details.market_data.current_price.usd.toFixed(2);
    document.getElementById('crypto-binance').href = `https://www.binance.com/en/trade/${details.symbol}_USDT`;
    document.getElementById('crypto-coinbase').href = `https://www.coinbase.com/price/${details.id}`;
    document.getElementById('crypto-kraken').href = `https://www.kraken.com/prices/${details.id}`;

    const prices = history.prices.map(([time, price]) => ({
      time: new Date(time).toLocaleDateString(),
      price,
    }));

    renderChart(prices);
  } catch (error) {
    console.error("Error fetching cryptocurrency details:", error);
  }
}

function renderChart(prices) {
  const ctx = document.getElementById('history-chart').getContext('2d');
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: prices.map(p => p.time),
      datasets: [{
        label: 'Price (USD)',
        data: prices.map(p => p.price),
        borderColor: '#00c896',
        backgroundColor: 'rgba(0, 200, 150, 0.2)',
        fill: true,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
      },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Price (USD)' } },
      },
    },
  });
}

if (document.getElementById('crypto-list')) fetchTrendingCryptos();
if (document.getElementById('crypto-name')) fetchCryptoDetails();
