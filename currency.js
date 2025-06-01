let chart;

async function convertCurrency() {
  const amount = +document.getElementById('amount').value;
  const currency = document.getElementById('currency').value;
  const direction = document.querySelector('input[name="direction"]:checked').value;

  const res = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
  const data = await res.json();

  if (currency in data.Valute) {
    const rate = data.Valute[currency].Value;

    let result;
    if (direction === 'to') {
      result = (amount / rate).toFixed(2) + ' ' + currency;
    } else {
      result = (amount * rate).toFixed(2) + ' ₽';
    }

    document.getElementById('result').textContent = `= ${result}`;
  } else {
    document.getElementById('result').textContent = `Курс для ${currency} не найден`;
  }
}

async function fetchHistoricalRates(code = 'UZS', days = 30) {
  const rates = [];
  const labels = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const formatted = date.toISOString().split('T')[0].replace(/-/g, '/');

    try {
      const res = await fetch(`https://www.cbr-xml-daily.ru/archive/${formatted}/daily_json.js`);
      const data = await res.json();

      if (data.Valute[code]) {
        rates.push(data.Valute[code].Value.toFixed(2));
        labels.push(date.toLocaleDateString('ru-RU'));
      }
    } catch (e) {
      console.warn(`Ошибка получения данных за ${formatted}`);
    }
  }

  return { labels, rates };
}

window.onload = async () => {
  const { labels, rates } = await fetchHistoricalRates('UZS');

  const ctx = document.getElementById('rateChart').getContext('2d');
  const barColors = new Array(labels.length).fill('#663399');

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Курс UZS',
        data: rates,
        backgroundColor: barColors,
      }]
    },
    options: {
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const i = elements[0].index;

          // Подсветка столбца
          chart.data.datasets[0].backgroundColor = barColors.map((_, index) =>
            index === i ? '#cc66ff' : '#663399'
          );
          chart.update();

          // Показать инфобокс
          document.getElementById('selectedInfo').textContent =
            `Дата: ${labels[i]} — Курс: ${rates[i]} ₽`;
        }
      },
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
        }
      }
    }
  });
};