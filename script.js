:root {
    --primary: #4f46e5;
    --success: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --bg: #f8fafc;
    --white: #ffffff;
    --text: #1e293b;
}
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--bg);
    margin: 0;
    padding: 16px;
    color: var(--text);
    display: flex;
    justify-content: center;
}
.container {
    width: 100%;
    max-width: 480px;
    background: var(--white);
    padding: 20px;
    border-radius: 24px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.03);
}
.header {
    text-align: center;
    margin-bottom: 24px;
}
.header h2 {
    margin: 0;
    color: var(--primary);
    font-size: 26px;
    letter-spacing: 0.5px;
}
.header p {
    color: #64748b;
    font-size: 13px;
    margin: 4px 0 0 0;
}
.card {
    background: white;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    border-left: 5px solid #ccc;
}
.card-income { border-left-color: var(--success); }
.card-expense { border-left-color: var(--danger); }
.card-balance { border-left-color: var(--primary); }

.card-title { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; }
.card-value { font-size: 24px; font-weight: 700; margin-top: 4px; }
.text-income { color: var(--success); }
.text-expense { color: var(--danger); }
.text-balance { color: var(--primary); }

.goal-container {
    background: #f1f5f9;
    padding: 16px;
    border-radius: 16px;
    margin-bottom: 20px;
}
.goal-header { display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; }
.progress-bar-bg {
    background: #e2e8f0;
    height: 10px;
    border-radius: 5px;
    margin-top: 8px;
    overflow: hidden;
}
.progress-bar-fill {
    background: var(--warning);
    height: 100%;
    width: 0%;
    transition: width 0.4s ease;
}

.section-title { font-size: 16px; font-weight: 700; margin: 24px 0 12px 0; }
.flex-group { display: flex; gap: 8px; }
form { display: flex; flex-direction: column; gap: 10px; }
input, select, button {
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    outline: none;
}
input:focus, select:focus { border-color: var(--primary); }
button {
    background: var(--primary);
    color: white;
    border: none;
    font-weight: 600;
    cursor: pointer;
}

.chart-container { max-width: 100%; margin: 16px 0; display: none; }

.filter-select { width: 100%; margin-bottom: 12px; background: #fff; }
ul { list-style: none; padding: 0; margin: 0; max-height: 250px; overflow-y: auto; }
li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    background: #f8fafc;
    border-radius: 12px;
    margin-bottom: 8px;
    font-size: 14px;
}
.li-title { font-weight: 600; }
.li-sub { font-size: 11px; color: #94a3b8; }
.li-amount { font-weight: 700; display: flex; align-items: center; gap: 8px; }
.btn-delete {
    background: none;
    border: none;
    color: #cbd5e1;
    cursor: pointer;
    font-size: 16px;
    padding: 0;
}
.btn-delete:hover { color: var(--danger); }