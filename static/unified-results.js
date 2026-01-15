// ==================== UNIFIED RESULTS SYSTEM ====================
// Add this at the top of main.js (after the helper functions)

// Show results in unified area
function showUnifiedResults(title, content, icon = '📊') {
    // Hide empty state
    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.style.display = 'none';

    // Show results card
    const resultsCard = document.getElementById('unifiedResults');
    if (resultsCard) resultsCard.style.display = 'block';

    // Update title
    const resultsTitle = document.getElementById('resultsTitle');
    if (resultsTitle) resultsTitle.textContent = `${icon} ${title}`;

    // Update content
    const resultsContent = document.getElementById('resultsContent');
    if (resultsContent) {
        resultsContent.innerHTML = content;
    }

    // Scroll to results
    resultsCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Clear/close results
function clearResults() {
    const resultsCard = document.getElementById('unifiedResults');
    if (resultsCard) resultsCard.style.display = 'none';

    const emptyState = document.getElementById('emptyState');
    if (emptyState) emptyState.style.display = 'block';
}

// ==================== UPDATED BUTTON HANDLERS ====================
// Replace ALL existing button handlers with these:

// 1. Forecast Button
document.getElementById('btnForecast')?.addEventListener('click', async () => {
    const product = getSelectedProduct();
    if (!product) {
        showToast('দয়া করে একটি পণ্য নির্বাচন করুন', 'warning');
        return;
    }

    showToast('পূর্বাভাস তৈরি হচ্ছে...');
    try {
        const res = await api(`/api/forecast?product=${product}`);
        if (res.error) throw new Error(res.error);

        const labels = res.forecast.map(item => formatDateLabel(item.ds));
        const yhat = res.forecast.map(item => item.yhat);

        const content = `
      <canvas id="forecastChartUnified" height="300"></canvas>
      <div class="mt-3">
        <p class="fw-bold">📈 পরবর্তী ৩০ দিনের পূর্বাভাস</p>
        <p>গড় দৈনিক বিক্রয়: <strong>${(yhat.reduce((a, b) => a + b, 0) / yhat.length).toFixed(0)} units</strong></p>
      </div>
    `;

        showUnifiedResults('চাহিদা পূর্বাভাস', content, '📊');

        // Render chart after content is added to DOM
        setTimeout(() => {
            const ctx = document.getElementById('forecastChartUnified');
            if (ctx) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Predicted Demand',
                            data: yhat,
                            borderColor: '#667eea',
                            backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: { legend: { display: true } },
                        scales: {
                            x: { ticks: { maxRotation: 45, minRotation: 45 } }
                        }
                    }
                });
            }
        }, 100);

        showToast('পূর্বাভাস প্রস্তুত!', 'success');
    } catch (e) {
        showToast(`ত্রুটি: ${e.message}`, 'error');
    }
});

// 2. Price Button
document.getElementById('btnPrice')?.addEventListener('click', async () => {
    const product = getSelectedProduct();
    if (!product) {
        showToast('দয়া করে একটি পণ্য নির্বাচন করুন', 'warning');
        return;
    }

    showToast('মূল্য বিশ্লেষণ হচ্ছে...');
    try {
        const res = await api(`/api/price?product=${product}`);
        if (res.error) throw new Error(res.error);

        const content = `
      <div class="row">
        <div class="col-md-6">
          <div class="card bg-light mb-3">
            <div class="card-body text-center">
              <h6 class="text-muted">বর্তমান দাম</h6>
              <h2 class="text-primary">৳${res.current_price?.toFixed(2) || 'N/A'}</h2>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card bg-success text-white mb-3">
            <div class="card-body text-center">
              <h6>প্রস্তাবিত সর্বোত্তম দাম</h6>
              <h2>৳${res.optimized_price?.toFixed(2) || 'N/A'}</h2>
            </div>
          </div>
        </div>
      </div>
      <div class="alert alert-info">
        <strong>💡 পরামর্শ:</strong> এই মূল্যে সর্বোচ্চ লাভ হবে
      </div>
    `;

        showUnifiedResults('মূল্য অপটিমাইজেশন', content, '💰');
        showToast('মূল্য বিশ্লেষণ সম্পন্ন!', 'success');
    } catch (e) {
        showToast(`ত্রুটি: ${e.message}`, 'error');
    }
});

// 3. Recommend Button
document.getElementById('btnRecommend')?.addEventListener('click', async () => {
    showToast('সুপারিশ আনা হচ্ছে...');
    try {
        const res = await api('/api/recommend');
        if (res.error) throw new Error(res.error);

        let content = '<ul class="list-group">';
        res.recommendations?.forEach((rec, idx) => {
            content += `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <span><strong>#${idx + 1}</strong> ${rec}</span>
          <span class="badge bg-primary rounded-pill">${idx + 1}</span>
        </li>
      `;
        });
        content += '</ul>';
        content += '<div class="alert alert-success mt-3"><strong>💡</strong> এই পণ্যগুলো সবচেয়ে বেশি বিক্রয় হচ্ছে</div>';

        showUnifiedResults('পণ্য সুপারিশ', content, '⭐');
        showToast('সুপারিশ প্রস্তুত!', 'success');
    } catch (e) {
        showToast(`ত্রুটি: ${e.message}`, 'error');
    }
});

// 4. Social Button
document.getElementById('btnSocial')?.addEventListener('click', async () => {
    const product = getSelectedProduct();
    if (!product) {
        showToast('দয়া করে একটি পণ্য নির্বাচন করুন', 'warning');
        return;
    }

    showToast('সামাজিক তথ্য আনা হচ্ছে...');
    try {
        const res = await api(`/api/social_series?product=${product}`);
        if (res.error) throw new Error(res.error);

        const content = `
      <canvas id="socialChartUnified" height="300"></canvas>
      <div class="mt-3 alert alert-info">
        <strong>😊 সামাজিক অনুভূতি:</strong> গ্রাহকরা এই পণ্য সম্পর্কে ইতিবাচক
      </div>
    `;

        showUnifiedResults('সামাজিক অনুভূতি', content, '😊');

        setTimeout(() => {
            const ctx = document.getElementById('socialChartUnified');
            if (ctx && res.series) {
                new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: res.series.map(s => s.date),
                        datasets: [{
                            label: 'Sentiment Score',
                            data: res.series.map(s => s.sentiment),
                            borderColor: '#fd79a8',
                            backgroundColor: 'rgba(253, 121, 168, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: { responsive: true }
                });
            }
        }, 100);

        showToast('সামাজিক তথ্য প্রস্তুত!', 'success');
    } catch (e) {
        showToast(`ত্রুটি: ${e.message}`, 'error');
    }
});

// Note: The 6 new feature handlers (Stock, Trends, Customer, Profit, Seasonal, Marketing)
// already use chatLog which we'll need to update similarly
// For now, they can stay as-is or you can update them to use showUnifiedResults too
