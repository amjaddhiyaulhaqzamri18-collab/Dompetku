// Mengikat Elemen DOM HTML ke JavaScript
const form = document.getElementById('transaction-form');
const descInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const categoryInput = document.getElementById('category');
const receiptInput = document.getElementById('receipt-image');
const ocrStatus = document.getElementById('ocr-status');

const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const balanceEl = document.getElementById('balance');
const listContainer = document.getElementById('transaction-list');
const clearAllBtn = document.getElementById('clear-all');

// Target Elements
const targetAmountInput = document.getElementById('target-amount-input');
const saveTargetBtn = document.getElementById('save-target-btn');
const targetPercentageEl = document.getElementById('target-percentage');
const targetProgressEl = document.getElementById('target-progress');
const targetNominalDisplay = document.getElementById('target-nominal-display');

// Memuat Data Keuangan Berdasarkan Penyimpanan Browser (Local Storage)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let targetSaving = parseFloat(localStorage.getItem('targetSaving')) || 0;

// Mengubah Format Angka Menjadi Gaya Rupiah
function formatRupiah(angka) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(angka);
}

// Menghitung Serta Memperbarui Statistik di Dashboard Atas Otomatis
function updateDashboard() {
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(trx => {
        if (trx.type === 'income') {
            totalIncome += trx.amount;
        } else {
            totalExpense += trx.amount;
        }
    });

    const currentBalance = totalIncome - totalExpense;

    if (totalIncomeEl) totalIncomeEl.textContent = formatRupiah(totalIncome);
    if (totalExpenseEl) totalExpenseEl.textContent = formatRupiah(totalExpense);
    if (balanceEl) {
        balanceEl.textContent = formatRupiah(currentBalance);
        if (currentBalance < 0) {
            balanceEl.className = "text-2xl font-bold text-red-600 mt-1";
        } else {
            balanceEl.className = "text-2xl font-bold text-blue-600 mt-1";
        }
    }

    if (targetSaving > 0) {
        if (targetNominalDisplay) targetNominalDisplay.textContent = "Target: " + formatRupiah(targetSaving);
        let pct = Math.min(Math.round((currentBalance / targetSaving) * 100), 100);
        if (currentBalance <= 0) pct = 0;
        
        if (targetPercentageEl) targetPercentageEl.textContent = pct + "%";
        if (targetProgressEl) targetProgressEl.style.width = pct + "%";
    } else {
        if (targetNominalDisplay) targetNominalDisplay.textContent = "Target: Rp 0";
        if (targetPercentageEl) targetPercentageEl.textContent = "0%";
        if (targetProgressEl) targetProgressEl.style.width = "0%";
    }
}

// Merender Barisan Data Transaksi ke dalam Tabel Panjang Berdesain Excel Gelap
function renderList() {
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (transactions.length === 0) {
        listContainer.innerHTML = `
            <tr id="empty-state">
                <td colspan="6" class="empty-text" style="text-align: center; color: #88a0c0; padding: 30px; font-style: italic;">Belum ada data keuangan yang tercatat.</td>
            </tr>`;
        return;
    }

    [...transactions].reverse().forEach(trx => {
        const row = document.createElement('tr');
        
        const isIncome = trx.type === 'income';
        const textColor = isIncome ? 'text-income' : 'text-expense';
        const sign = isIncome ? '+' : '-';

        let receiptColumn = '<span style="color: #6b7280; font-style: italic;">Tidak ada</span>';
        if (trx.receiptImage) {
            receiptColumn = `<button onclick="viewReceiptPopup('${trx.receiptImage}')" class="view-receipt-btn">Lihat Struk 👁️</button>`;
        }

        row.innerHTML = `
            <td>${trx.date}</td>
            <td style="font-weight: 600; text-transform: capitalize;">${trx.description}</td>
            <td>${trx.category || 'Umum'}</td>
            <td>${receiptColumn}</td>
            <td class="text-right ${textColor}">${sign} ${formatRupiah(trx.amount)}</td>
            <td class="text-center">
                <button onclick="deleteTransaction(${trx.id})" class="delete-btn">✕</button>
            </td>
        `;
        listContainer.appendChild(row);
    });
}

window.viewReceiptPopup = function(base64Image) {
    const newWindow = window.open();
    newWindow.document.write(`<title>Bukti Nota Struk</title><body style="margin:0; background:#111; display:flex; justify-content:center; align-items:center; min-height:100vh;"><img src="${base64Image}" style="max-width:100%; max-height:100vh; object-fit:contain; box-shadow: 0 0 20px rgba(0,0,0,0.5);"></body>`);
};

function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('targetSaving', targetSaving);
    updateDashboard();
    renderList();
}

if (saveTargetBtn) {
    saveTargetBtn.addEventListener('click', function() {
        if (!targetAmountInput) return;
        const val = parseFloat(targetAmountInput.value);
        if (val > 0) {
            targetSaving = val;
            saveData();
            targetAmountInput.value = '';
            alert('Target Tabungan berhasil diperbarui!');
        } else {
            alert('Silakan masukkan nominal angka target yang valid!');
        }
    });
}

// ====== LOGIKA PARSING TEKS STRUK KE NOMINAL FINANSIAL ======
function extractTotalFromReceipt(text) {
    const lines = text.toLowerCase().split('\n');
    let detectedAmount = 0;
    const keywords = ['total', 'grand total', 'jumlah', 'netto', 'bayar', 'net', 'subtotal'];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const matchKeyword = keywords.some(key => line.includes(key));
        
        if (matchKeyword) {
            const numbers = line.replace(/[^0-9]/g, '');
            if (numbers && numbers.length > 2) {
                const parsed = parseFloat(numbers);
                if (parsed > detectedAmount && parsed < 50000000) {
                    detectedAmount = parsed;
                }
            }
        }
    }
    return detectedAmount;
}

// Memicu aksi pemindaian otomatis & langsung mengunci mode sebagai 'Pengeluaran'
if (receiptInput) {
    receiptInput.addEventListener('change', function(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        if (ocrStatus) {
            ocrStatus.textContent = "⏳ Sedang memindai struk belanja...";
            ocrStatus.className = "loading-scan";
        }

        const reader = new FileReader();
        reader.onloadend = function() {
            const base64Data = reader.result;

            Tesseract.recognize(base64Data, 'ind+eng')
                .then(({ data: { text } }) => {
                    const autoPrice = extractTotalFromReceipt(text);
                    
                    if (autoPrice > 0) {
                        if (amountInput) amountInput.value = autoPrice;
                        // OTOMATIS: Mengubah pilihan jenis transaksi menjadi Keluar / Expense
                        if (typeInput) typeInput.value = "expense"; 
                        
                        if (ocrStatus) {
                            ocrStatus.textContent = `✅ Berhasil menscan harga pengeluaran: ${formatRupiah(autoPrice)}`;
                            ocrStatus.style.color = "#10b981";
                        }
                    } else {
                        if (ocrStatus) {
                            ocrStatus.textContent = "⚠️ Gagal melacak nominal total otomatis. Jenis transaksi diset 'Keluar', silakan isi nominal manual.";
                            ocrStatus.style.color = "#ff9f00";
                        }
                        if (typeInput) typeInput.value = "expense"; 
                    }
                })
                .catch(err => {
                    console.error(err);
                    if (ocrStatus) {
                        ocrStatus.textContent = "✕ Gagal memproses gambar struk.";
                        ocrStatus.style.color = "#ef4444";
                    }
                });
        };
        reader.readAsDataURL(files[0]);
    });
}

// Submit Form Transaksi
if (form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const opsiTanggal = { day: 'numeric', month: 'short' };
        const tanggalSekarang = new Date().toLocaleDateString('id-ID', opsiTanggal);

        const files = receiptInput.files;

        const saveTransactionData = (imageDataBase64 = null) => {
            const newTrx = {
                id: Date.now(),
                type: typeInput.value,
                description: descInput.value.trim(),
                amount: parseFloat(amountInput.value) || 0,
                category: categoryInput.value,
                receiptImage: imageDataBase64,
                date: tanggalSekarang
            };

            transactions.push(newTrx);
            saveData();

            descInput.value = '';
            amountInput.value = '';
            receiptInput.value = '';
            if (ocrStatus) ocrStatus.textContent = '';
        };

        if (files && files.length > 0) {
            const reader = new FileReader();
            reader.onloadend = function() {
                saveTransactionData(reader.result);
            };
            reader.readAsDataURL(files[0]);
        } else {
            saveTransactionData();
        }
    });
}

window.deleteTransaction = function(id) {