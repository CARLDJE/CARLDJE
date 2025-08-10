(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Tabs
  $$('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.tab').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const name = btn.dataset.tab;
      $$('.tab-panel').forEach((p) => {
        const isActive = p.id === `tab-${name}`;
        p.toggleAttribute('hidden', !isActive);
        p.classList.toggle('active', isActive);
      });
    });
  });

  // Footer year
  $('#year').textContent = new Date().getFullYear();

  // Helpers
  const formatDateISO = (d) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  const todayISO = () => formatDateISO(new Date());

  function loadEntries() {
    try { return JSON.parse(localStorage.getItem('calorieEntries') || '[]'); }
    catch { return []; }
  }
  function saveEntries(list) {
    localStorage.setItem('calorieEntries', JSON.stringify(list));
  }
  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  // Set default dates
  const dateInput = $('#date');
  const filterDate = $('#filter-date');
  const iso = todayISO();
  dateInput.value = iso;
  filterDate.value = iso;

  // Render list and totals
  function getEntriesByDate(dateISO) {
    return loadEntries().filter((e) => e.date === dateISO);
  }

  function renderList(dateISO) {
    const tbody = $('#entry-list');
    const records = getEntriesByDate(dateISO);
    tbody.innerHTML = '';
    records.forEach((e) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${e.name || '-'}</td>
        <td>${e.calories} kcal</td>
        <td>${e.date}</td>
        <td class="actions" style="text-align:right">
          <button class="btn danger outline btn-del" data-id="${e.id}">Sil</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Bind delete
    $$('.btn-del').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const all = loadEntries();
        const next = all.filter((x) => x.id !== id);
        saveEntries(next);
        renderAll();
      });
    });

    // Title
    const title = $('#list-title');
    title.textContent = `${dateISO} Kayıtları`;
  }

  function renderTodayTotal() {
    const total = getEntriesByDate(todayISO()).reduce((sum, e) => sum + e.calories, 0);
    $('#today-total').textContent = total;
  }

  function renderChart() {
    const ctx = $('#week-chart');
    if (!ctx) return;
    const c = ctx.getContext('2d');
    const W = ctx.clientWidth || 300;
    const H = ctx.height;
    // align canvas width to CSS width
    ctx.width = W; // set actual drawing width

    // Build last 7 days data
    const days = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = formatDateISO(d);
      const sum = getEntriesByDate(iso).reduce((s, e) => s + e.calories, 0);
      days.push({ iso, sum, label: `${d.getDate()}.${d.getMonth() + 1}` });
    }
    const max = Math.max(100, ...days.map((d) => d.sum));

    // Clear
    c.clearRect(0, 0, W, H);

    // Axes baseline
    c.strokeStyle = '#223059';
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(30, H - 24);
    c.lineTo(W - 10, H - 24);
    c.stroke();

    const barAreaW = W - 50;
    const barW = barAreaW / days.length - 12;
    const baseX = 30;

    days.forEach((d, idx) => {
      const x = baseX + idx * (barW + 12);
      const h = Math.round(((H - 50) * d.sum) / max);
      const y = H - 24 - h;

      // Bar
      const grad = c.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, '#6ea8fe');
      grad.addColorStop(1, '#5b94ea');
      c.fillStyle = grad;
      c.fillRect(x, y, barW, h);

      // Label
      c.fillStyle = '#a3a6b2';
      c.font = '12px Inter, system-ui';
      c.textAlign = 'center';
      c.fillText(d.label, x + barW / 2, H - 8);
    });
  }

  function renderAll() {
    renderList($('#filter-date').value);
    renderTodayTotal();
    renderChart();
  }

  // Form submit
  $('#entry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#food-name').value.trim();
    const calories = Number($('#calories').value);
    const date = $('#date').value;

    if (!Number.isFinite(calories) || calories <= 0) {
      alert('Lütfen geçerli bir kalori değeri girin.');
      return;
    }
    if (!date) {
      alert('Lütfen bir tarih seçin.');
      return;
    }

    const all = loadEntries();
    all.push({ id: uid(), name, calories: Math.round(calories), date });
    saveEntries(all);

    // Reset name and calories
    $('#food-name').value = '';
    $('#calories').value = '';

    // Keep selected date
    renderAll();
  });

  $('#filter-date').addEventListener('change', () => renderAll());

  $('#clear-day').addEventListener('click', () => {
    const d = $('#filter-date').value || todayISO();
    if (!confirm(`${d} tarihli tüm kayıtlar silinsin mi?`)) return;
    const next = loadEntries().filter((e) => e.date !== d);
    saveEntries(next);
    renderAll();
  });

  // BMI
  $('#bmi-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const h = Number($('#bmi-height').value);
    const w = Number($('#bmi-weight').value);
    if (!(h > 0 && w > 0)) { alert('Lütfen geçerli boy ve kilo girin.'); return; }
    const bmi = w / Math.pow(h / 100, 2);
    const bmiRounded = Math.round(bmi * 10) / 10;
    $('#bmi-value').textContent = bmiRounded.toFixed(1);

    let desc = '';
    if (bmi < 18.5) desc = 'Zayıf';
    else if (bmi < 25) desc = 'Normal';
    else if (bmi < 30) desc = 'Fazla kilolu';
    else desc = 'Obez';
    $('#bmi-desc').textContent = `Kategori: ${desc}`;

    const min = 18.5 * Math.pow(h / 100, 2);
    const max = 24.9 * Math.pow(h / 100, 2);
    $('#bmi-ideal').textContent = `İdeal kilo aralığı: ${min.toFixed(1)} — ${max.toFixed(1)} kg`;

    $('#bmi-result').hidden = false;
  });

  // TDEE
  $('#tdee-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const age = Number($('#tdee-age').value);
    const gender = $('#tdee-gender').value;
    const height = Number($('#tdee-height').value);
    const weight = Number($('#tdee-weight').value);
    const activity = Number($('#tdee-activity').value);

    if (!(age > 0 && height > 0 && weight > 0)) { alert('Lütfen tüm alanları geçerli doldurun.'); return; }

    const bmr = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;

    const tdee = bmr * activity;

    const round = (n) => Math.round(n);
    $('#bmr-value').textContent = round(bmr);
    $('#tdee-value').textContent = round(tdee);
    $('#maintain-value').textContent = round(tdee);
    $('#loss-500').textContent = round(tdee - 500);
    $('#gain-300').textContent = round(tdee + 300);

    $('#tdee-result').hidden = false;
  });

  // Initial render
  renderAll();
})();