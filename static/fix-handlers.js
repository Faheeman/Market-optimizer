// Delete all the old button handlers from line 786 to 799 in main.js
// and replace with these UNIFIED handlers:

// Stock Alert - UNIFIED
document.getElementById('btnStock')?.addEventListener('click', async () => {
    showToast('স্টক তথ্য আনা হচ্ছে...');
    try {
        const res = await api('/api/stock/alert');
        if (res.error) throw new Error(res.error);
        let html = '';
        res.alerts.forEach(alert => {
            const statusBadge = alert.status === 'critical' ? 'bg-danger' : alert.status === 'warning' ? 'bg-warning' : 'bg-success';
            const statusText = alert.status === 'critical' ? 'জরুরি' : alert.status === 'warning' ? 'সতর্কতা' : 'ভালো';
            html += `<div class="alert alert-${alert.status === 'ok' ? 'success' : 'warning'} mb-3"><div class="d-flex justify-content-between align-items-center"><strong>${alert.product}</strong><span class="badge ${statusBadge}">${statusText}</span></div><div class="mt-2"><small>দৈনিক গড় বিক্রয়: ${alert.daily_avg_sales} ইউনিট</small><br><small>স্টক শেষ হবে: ${alert.days_until_stockout} দিনে</small><br><strong>💡 ${alert.recommendation}</strong></div></div>`;
        });
        showUnifiedResults('স্টক সতর্কতা', html, '📦');
        showToast('স্টক রিপোর্ট তৈরি হয়েছে!', 'success');
    } catch (e) { showToast(`ত্রুটি: ${e.message}`, 'error'); }
});

// Sales Trends - UNIFIED
document.getElementById('btnTrends')?.addEventListener('click', async () => {
    showToast('বিক্রয় প্রবণতা বিশ্লেষণ হচ্ছে...');
    try {
        const res = await api('/api/trends/analysis');
        if (res.error) throw new Error(res.error);
        let html = `<div class="card mb-3"><div class="card-body"><h5 class="text-primary">🏆 সেরা বিক্রয় দিন: ${res.best_day.name}</h5><p>আয়: ৳${res.best_day.revenue.toLocaleString()}</p></div></div><div class="card mb-3"><div class="card-body"><h6>সাপ্তাহিক প্যাটার্ন</h6><ul class="list-group">`;
        res.weekly_pattern.forEach(day => { html += `<li class="list-group-item d-flex justify-content-between"><span>${day.day}</span><strong>৳${day.revenue.toLocaleString()}</strong></li>`; });
        html += `</ul></div></div><div class="alert alert-info"><strong>💡 পরামর্শ:</strong> ${res.recommendation}</div>`;
        showUnifiedResults('বিক্রয় প্রবণতা', html, '📈');
        showToast('প্রবণতা বিশ্লেষণ সম্পন্ন!', 'success');
    } catch (e) { showToast(`ত্রুটি: ${e.message}`, 'error'); }
});

// Customer Insights - UNIFIED
document.getElementById('btnCustomer')?.addEventListener('click', async () => {
    showToast('ক্রেতা তথ্য বিশ্লেষণ হচ্ছে...');
    try {
        const res = await api('/api/customer/insights');
        if (res.error) throw new Error(res.error);
        let html = `<div class="row mb-3"><div class="col-md-6"><div class="card"><div class="card-body text-center"><h3 class="text-primary">${res.total_customers}</h3><p class="text-muted">মোট ক্রেতা</p></div></div></div><div class="col-md-6"><div class="card"><div class="card-body text-center"><h3 class="text-success">৳${res.avg_ltv.toLocaleString()}</h3><p class="text-muted">গড় LTV</p></div></div></div></div><h6>🏆 সেরা ৫ ক্রেতা</h6><ul class="list-group mb-3">`;
        res.top_customers.forEach((cust, idx) => { html += `<li class="list-group-item d-flex justify-content-between"><span>#${idx + 1} - ক্রেতা ${cust.customer_id}</span><div><strong>৳${cust.total_spent.toLocaleString()}</strong><small class="text-muted">(${cust.orders} অর্ডার)</small></div></li>`; });
        html += `</ul><div class="alert alert-warning"><strong>⚠️ ঝুঁকি:</strong> ${res.at_risk_customers} জন ক্রেতা নিষ্ক্রিয়</div><div class="alert alert-info"><strong>💡 ${res.recommendation}</strong></div>`;
        showUnifiedResults('ক্রেতা বিশ্লেষণ', html, '👥');
        showToast('ক্রেতা রিপোর্ট তৈরি!', 'success');
    } catch (e) { showToast(`ত্রুটি: ${e.message}`, 'error'); }
});

// Profit Calculator - UNIFIED
document.getElementById('btnProfit')?.addEventListener('click', async () => {
    showToast('লাভ হিসাব করা হচ্ছে...');
    try {
        const res = await api('/api/profit/analysis');
        if (res.error) throw new Error(res.error);
        let html = `<div class="row mb-3"><div class="col-md-6"><div class="card bg-success text-white"><div class="card-body text-center"><h3>৳${res.total_profit.toLocaleString()}</h3><p>মোট লাভ</p></div></div></div><div class="col-md-6"><div class="card bg-info text-white"><div class="card-body text-center"><h3">${res.profit_margin.toFixed(1)}%</h3><p>লাভের হার</p></div></div></div></div><h6>🏆 সবচেয়ে লাভজনক পণ্য</h6><ul class="list-group mb-3">`;
        res.top_profitable.forEach((prod, idx) => { html += `<li class="list-group-item"><div class="d-flex justify-content-between"><strong>#${idx + 1} ${prod.product}</strong><span class="badge bg-success">${prod.margin.toFixed(1)}% মার্জিন</span></div><small>লাভ: ৳${prod.profit.toLocaleString()}</small></li>`; });
        html += `</ul><div class="alert alert-success"><strong>💡 ${res.recommendation}</strong></div>`;
        showUnifiedResults('লাভ ক্যালকুলেটর', html, '💵');
        showToast('লাভ রিপোর্ট প্রস্তুত!', 'success');
    } catch (e) { showToast(`ত্রুটি: ${e.message}`, 'error'); }
});

// Seasonal Predictor - UNIFIED
document.getElementById('btnSeasonal')?.addEventListener('click', async () => {
    showToast('মৌসুমী পূর্বাভাস করা হচ্ছে...');
    try {
        const res = await api('/api/seasonal/predictor');
        if (res.error) throw new Error(res.error);
        let html = `<div class="alert alert-primary"><h5>🎯 ${res.upcoming_season}</h5></div><div class="card mb-3"><div class="card-body"><h6>পিক মাস: ${res.peak_month.name}</h6><p>আয়: ৳${res.peak_month.revenue.toLocaleString()}</p></div></div><div class="row"><div class="col-md-6"><div class="card"><div class="card-header">ঈদ/রমজান জনপ্রিয়</div><ul class="list-group list-group-flush">`;
        res.eid_top_products.forEach(prod => { html += `<li class="list-group-item">${prod.product}</li>`; });
        html += `</ul></div></div><div class="col-md-6"><div class="card"><div class="card-header">শীতকালীন জনপ্রিয়</div><ul class="list-group list-group-flush">`;
        res.winter_top_products.forEach(prod => { html += `<li class="list-group-item">${prod.product}</li>`; });
        html += `</ul></div></div></div>`;
        showUnifiedResults('মৌসুমী পূর্বাভাস', html, '🌟');
        showToast('মৌসুমী রিপোর্ট সম্পন্ন!', 'success');
    } catch (e) { showToast(`ত্রুটি: ${e.message}`, 'error'); }
});

// Marketing Planner - UNIFIED
document.getElementById('btnMarketing')?.addEventListener('click', async () => {
    showToast('মার্কেটিং পরিকল্পনা তৈরি হচ্ছে...');
    try {
        const res = await api('/api/marketing/planner');
        if (res.error) throw new Error(res.error);
        let html = `<div class="alert alert-success"><h5>📅 সেরা ক্যাম্পেইন দিন: ${res.best_campaign_day}</h5></div><div class="card mb-3"><div class="card-header bg-warning">⚠️ বিক্রয় কমছে যেসব পণ্যে</div><ul class="list-group list-group-flush">`;
        res.declining_products.forEach(prod => { html += `<li class="list-group-item d-flex justify-content-between"><span>${prod.product}</span><span class="badge bg-danger">${prod.decline.toFixed(1)}% কমেছে</span></li>`; });
        html += `</ul></div><div class="card mb-3"><div class="card-body"><h6>💰 প্রস্তাবিত ডিসকাউন্ট</h6><p><strong>${res.recommended_discount}</strong> - ${res.discount_recommendations.join(', ')}</p></div></div><div class="alert alert-info"><strong>💡 ${res.recommendation}</strong></div>`;
        showUnifiedResults('মার্কেটিং পরিকল্পনা', html, '🎯');
        showToast('মার্কেটিং পরিকল্পনা প্রস্তুত!', 'success');
    } catch (e) { showToast(`ত্রুটি: ${e.message}`, 'error'); }
});
