// ========== UNIFIED BUTTON HANDLERS FOR ALL 10 FEATURES ==========

// 1. Demand Forecast
document.getElementById('btnForecast').addEventListener('click', async () => {
    const product = getSelectedProduct();
    if (!product) { showToast('দয়া করে একটি পণ্য নির্বাচন করুন', 'warning'); return; }
    showToast('পূর্বাভাস তৈরি হচ্ছে...');
    try {
        const res = await api(`/api/forecast?product=${product}`);
        if (res.error) throw new Error(res.error);
        const forecastData = Array.isArray(res) ? res : res.forecast || res;
        const labels = forecastData.map(item => formatDateLabel(item.ds));
        const yhat = forecastData.map(item => item.yhat);
        const avgSales = (yhat.reduce((a, b) => a + b, 0) / yhat.length).toFixed(0);
        showUnifiedResults('চাহিদা পূর্বাভাস', `<div class="chart-container"><canvas id="forecastChartUnified"></canvas></div><div class="mt-3"><p class="fw-bold">📈 পরবর্তী ৩০ দিনের পূর্বাভাস</p><p>গড় দৈনিক বিক্রয়: <strong>${avgSales} units</strong></p></div>`, '📊');
        setTimeout(() => {
            const ctx = document.getElementById('forecastChartUnified');
            if (ctx) new Chart(ctx, { type: 'line', data: { labels, datasets: [{ label: 'Demand', data: yhat, borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.1)', tension: 0.4, fill: true }] }, options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } } });
        }, 100);
        showToast('পূর্বাভাস প্রস্তুত!', 'success');
    } catch (e) { console.error('Forecast error:', e); }
});

// 2. Price Optimize
document.getElementById('btnPrice').addEventListener('click', async () => {
    const product = getSelectedProduct();
    if (!product) { showToast('দয়া করে একটি পণ্য নির্বাচন করুন', 'warning'); return; }
    showToast('মূল্য বিশ্লেষণ হচ্ছে...');
    try {
        const res = await api(`/api/price?product=${product}`);
        if (res.error) throw new Error(res.error);
        showUnifiedResults('মূল্য অপটিমাইজেশন', `<div class="row"><div class="col-md-6"><div class="card bg-light mb-3"><div class="card-body text-center"><h6 class="text-muted">বর্তমান দাম</h6><h2 class="text-primary">৳${(res.current_price || 0).toFixed(2)}</h2></div></div></div><div class="col-md-6"><div class="card bg-success text-white mb-3"><div class="card-body text-center"><h6>প্রস্তাবিত দাম</h6><h2>৳${(res.optimized_price || 0).toFixed(2)}</h2></div></div></div></div><div class="alert alert-info"><strong>💡 পরামর্শ:</strong> এই মূল্যে সর্বোচ্চ লাভ হবে</div>`, '💰');
        showToast('মূল্য বিশ্লেষণ সম্পন্ন!', 'success');
    } catch (e) { console.error('Price error:', e); }
});

// 3. Product Recommendations
document.getElementById('btnRecommend').addEventListener('click', async () => {
    showToast('সুপারিশ আনা হচ্ছে...');
    try {
        const res = await api('/api/recommend');
        if (res.error) throw new Error(res.error);
        let html = '<ul class="list-group">';
        (res.recommendations || []).forEach((rec, idx) => { html += `<li class="list-group-item d-flex justify-content-between"><span><strong>#${idx + 1}</strong> ${rec}</span><span class="badge bg-primary">${idx + 1}</span></li>`; });
        html += '</ul><div class="alert alert-success mt-3"><strong>💡</strong> এই পণ্যগুলো সবচেয়ে বেশি বিক্রয় হচ্ছে</div>';
        showUnifiedResults('পণ্য সুপারিশ', html, '⭐');
        showToast('সুপারিশ প্রস্তুত!', 'success');
    } catch (e) { console.error('Recommend error:', e); }
});

// 4. Social Sentiment
document.getElementById('btnSocial').addEventListener('click', async () => {
    const product = getSelectedProduct();
    if (!product) { showToast('দয়া করে একটি পণ্য নির্বাচন করুন', 'warning'); return; }
    showToast('সামাজিক তথ্য আনা হচ্ছে...');
    try {
        const res = await api(`/api/social_series?product=${product}`);
        if (res.error) throw new Error(res.error);
        showUnifiedResults('সামাজিক অনুভূতি', `<div class="chart-container"><canvas id="socialChartUnified"></canvas></div><div class="mt-3 alert alert-info"><strong>😊 সামাজিক অনুভূতি:</strong> ইতিবাচক</div>`, '😊');
        setTimeout(() => {
            const ctx = document.getElementById('socialChartUnified');
            if (ctx && res.series) new Chart(ctx, { type: 'line', data: { labels: res.series.map(s => s.date), datasets: [{ label: 'Sentiment', data: res.series.map(s => s.sentiment), borderColor: '#fd79a8', backgroundColor: 'rgba(253,121,168,0.1)', tension: 0.4, fill: true }] }, options: { responsive: true, maintainAspectRatio: false } });
        }, 100);
        showToast('সামাজিক তথ্য প্রস্তুত!', 'success');
    } catch (e) { console.error('Social error:', e); }
});

// 5. Stock Alert
document.getElementById('btnStock').addEventListener('click', async () => {
    showToast('স্টক তথ্য আনা হচ্ছে...');
    try {
        const res = await api('/api/stock/alert');
        if (res.error) throw new Error(res.error);
        let html = '';
        (res.alerts || []).forEach(alert => {
            const badge = alert.status === 'critical' ? 'bg-danger' : alert.status === 'warning' ? 'bg-warning' : 'bg-success';
            const text = alert.status === 'critical' ? 'জরুরি' : alert.status === 'warning' ? 'সতর্কতা' : 'ভালো';
            html += `<div class="alert alert-${alert.status === 'ok' ? 'success' : 'warning'} mb-3"><div class="d-flex justify-content-between"><strong>${alert.product}</strong><span class="badge ${badge}">${text}</span></div><div class="mt-2"><small>দৈনিক বিক্রয়: ${alert.daily_avg_sales} | স্টক শেষ: ${alert.days_until_stockout} দিন</small><br><strong>💡 ${alert.recommendation}</strong></div></div>`;
        });
        showUnifiedResults('স্টক সতর্কতা', html, '📦');
        showToast('স্টক রিপোর্ট প্রস্তুত!', 'success');
    } catch (e) { console.error('Stock error:', e); }
});

// 6. Sales Trends
document.getElementById('btnTrends').addEventListener('click', async () => {
    showToast('বিক্রয় প্রবণতা বিশ্লেষণ হচ্ছে...');
    try {
        const res = await api('/api/trends/analysis');
        if (res.error) throw new Error(res.error);
        let html = `<div class="card mb-3"><div class="card-body"><h5 class="text-primary">🏆 সেরা দিন: ${res.best_day.name}</h5><p>আয়: ৳${res.best_day.revenue.toLocaleString()}</p></div></div><div class="card"><div class="card-body"><h6>সাপ্তাহিক প্যাটার্ন</h6><ul class="list-group">`;
        (res.weekly_pattern || []).forEach(day => { html += `<li class="list-group-item d-flex justify-content-between"><span>${day.day}</span><strong>৳${day.revenue.toLocaleString()}</strong></li>`; });
        html += `</ul></div></div><div class="alert alert-info mt-3"><strong>💡</strong> ${res.recommendation}</div>`;
        showUnifiedResults('বিক্রয় প্রবণতা', html, '📈');
        showToast('প্রবণতা বিশ্লেষণ সম্পন্ন!', 'success');
    } catch (e) { console.error('Trends error:', e); }
});

// 7. Customer Insights  
document.getElementById('btnCustomer').addEventListener('click', async () => {
    showToast('ক্রেতা তথ্য বিশ্লেষণ হচ্ছে...');
    try {
        const res = await api('/api/customer/insights');
        if (res.error) throw new Error(res.error);
        let html = `<div class="row mb-3"><div class="col-md-6"><div class="card"><div class="card-body text-center"><h3 class="text-primary">${res.total_customers}</h3><p class="text-muted">মোট ক্রেতা</p></div></div></div><div class="col-md-6"><div class="card"><div class="card-body text-center"><h3 class="text-success">৳${res.avg_ltv.toLocaleString()}</h3><p class="text-muted">গড় LTV</p></div></div></div></div><h6>🏆 সেরা ৫ ক্রেতা</h6><ul class="list-group mb-3">`;
        (res.top_customers || []).forEach((c, i) => { html += `<li class="list-group-item d-flex justify-content-between"><span>#${i + 1} - ক্রেতা ${c.customer_id}</span><div><strong>৳${c.total_spent.toLocaleString()}</strong> <small>(${c.orders} অর্ডার)</small></div></li>`; });
        html += `</ul><div class="alert alert-warning"><strong>⚠️</strong> ${res.at_risk_customers} জন ক্রেতা নিষ্ক্রিয়</div><div class="alert alert-info"><strong>💡</strong> ${res.recommendation}</div>`;
        showUnifiedResults('ক্রেতা বিশ্লেষণ', html, '👥');
        showToast('ক্রেতা রিপোর্ট প্রস্তুত!', 'success');
    } catch (e) { console.error('Customer error:', e); }
});

// 8. Profit Calculator
document.getElementById('btnProfit').addEventListener('click', async () => {
    showToast('লাভ হিসাব করা হচ্ছে...');
    try {
        const res = await api('/api/profit/analysis');
        if (res.error) throw new Error(res.error);
        let html = `<div class="row mb-3"><div class="col-md-6"><div class="card bg-success text-white"><div class="card-body text-center"><h3>৳${res.total_profit.toLocaleString()}</h3><p>মোট লাভ</p></div></div></div><div class="col-md-6"><div class="card bg-info text-white"><div class="card-body text-center"><h3>${res.profit_margin.toFixed(1)}%</h3><p>লাভের হার</p></div></div></div></div><h6>🏆 লাভজনক পণ্য</h6><ul class="list-group mb-3">`;
        (res.top_profitable || []).forEach((p, i) => { html += `<li class="list-group-item"><div class="d-flex justify-content-between"><strong>#${i + 1} ${p.product}</strong><span class="badge bg-success">${p.margin.toFixed(1)}%</span></div><small>লাভ: ৳${p.profit.toLocaleString()}</small></li>`; });
        html += `</ul><div class="alert alert-success"><strong>💡</strong> ${res.recommendation}</div>`;
        showUnifiedResults('লাভ ক্যালকুলেটর', html, '💵');
        showToast('লাভ রিপোর্ট প্রস্তুত!', 'success');
    } catch (e) { console.error('Profit error:', e); }
});

// 9. Seasonal Predictor
document.getElementById('btnSeasonal').addEventListener('click', async () => {
    showToast('মৌসুমী পূর্বাভাস করা হচ্ছে...');
    try {
        const res = await api('/api/seasonal/predictor');
        if (res.error) throw new Error(res.error);
        let html = `<div class="alert alert-primary"><h5>🎯 ${res.upcoming_season}</h5></div><div class="card mb-3"><div class="card-body"><h6>পিক মাস: ${res.peak_month.name}</h6><p>আয়: ৳${res.peak_month.revenue.toLocaleString()}</p></div></div><div class="row"><div class="col-md-6"><div class="card"><div class="card-header">ঈদ/রমজান</div><ul class="list-group list-group-flush">`;
        (res.eid_top_products || []).forEach(p => { html += `<li class="list-group-item">${p.product}</li>`; });
        html += `</ul></div></div><div class="col-md-6"><div class="card"><div class="card-header">শীতকালীন</div><ul class="list-group list-group-flush">`;
        (res.winter_top_products || []).forEach(p => { html += `<li class="list-group-item">${p.product}</li>`; });
        html += `</ul></div></div></div>`;
        showUnifiedResults('মৌসুমী পূর্বাভাস', html, '🌟');
        showToast('মৌসুমী রিপোর্ট সম্পন্ন!', 'success');
    } catch (e) { console.error('Seasonal error:', e); }
});

// 10. Marketing Planner
document.getElementById('btnMarketing').addEventListener('click', async () => {
    showToast('মার্কেটিং পরিকল্পনা তৈরি হচ্ছে...');
    try {
        const res = await api('/api/marketing/planner');
        if (res.error) throw new Error(res.error);
        let html = `<div class="alert alert-success"><h5>📅 সেরা দিন: ${res.best_campaign_day}</h5></div><div class="card mb-3"><div class="card-header bg-warning">⚠️ বিক্রয় কমছে</div><ul class="list-group list-group-flush">`;
        (res.declining_products || []).forEach(p => { html += `<li class="list-group-item d-flex justify-content-between"><span>${p.product}</span><span class="badge bg-danger">${p.decline.toFixed(1)}% কমেছে</span></li>`; });
        html += `</ul></div><div class="card mb-3"><div class="card-body"><h6>💰 প্রস্তাবিত ডিসকাউন্ট</h6><p><strong>${res.recommended_discount}</strong></p></div></div><div class="alert alert-info"><strong>💡</strong> ${res.recommendation}</div>`;
        showUnifiedResults('মার্কেটিং পরিকল্পনা', html, '🎯');
        showToast('মার্কেটিং পরিকল্পনা প্রস্তুত!', 'success');
    } catch (e) { console.error('Marketing error:', e); }
});
