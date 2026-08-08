// Ikat DOM Element
const form = document.getElementById("transaction-form");
const descInput = document.getElementById("description");
const amountInput = document.getElementById("amount");
const typeInput = document.getElementById("type");
const categoryInput = document.getElementById("category");

const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const listContainer = document.getElementById("transaction-list");
const clearAllBtn = document.getElementById("clear-all");

// Target Elements
const targetAmountInput = document.getElementById("target-amount-input");
const saveTargetBtn = document.getElementById("save-target-btn");
const targetPercentageEl = document.getElementById("target-percentage");
const targetProgressEl = document.getElementById("target-progress");

// State Data (Local Storage)
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let targetSaving = parseFloat(localStorage.getItem("targetSaving")) || 0;

function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// Update Dashboard Angka Utama dan Bar Target Progress
function updateDashboard() {
  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((trx) => {
    if (trx.type === "income") {
      totalIncome += trx.amount;
    } else {
      totalExpense += trx.amount;
    }
  });

  const currentBalance = totalIncome - totalExpense;

  totalIncomeEl.textContent = formatRupiah(totalIncome);
  totalExpenseEl.textContent = formatRupiah(totalExpense);
  balanceEl.textContent = formatRupiah(currentBalance);

  // Hitung Persentase Target Tabungan dari Sisa Saldo saat ini
  if (targetSaving > 0 && currentBalance > 0) {
    let pct = Math.min(Math.round((currentBalance / targetSaving) * 100), 100);
    targetPercentageEl.textContent = pct + "%";
    targetProgressEl.style.width = pct + "%";
  } else {
    targetPercentageEl.textContent = "0%";
    targetProgressEl.style.width = "0%";
  }
}

// Render isi list tabel bawah
function renderList() {
  listContainer.innerHTML = "";

  if (transactions.length === 0) {
    listContainer.innerHTML = `
            <tr id="empty-state">
                <td colspan="5" class="empty-text">Belum ada data keuangan yang tercatat.</td>
            </tr>`;
    return;
  }

  [...transactions].reverse().forEach((trx) => {
    const row = document.createElement("tr");

    const isIncome = trx.type === "income";
    const textColor = isIncome ? "text-income" : "text-expense";
    const sign = isIncome ? "+" : "-";

    row.innerHTML = `
            <td>${trx.date}</td>
            <td style="font-weight: 600; text-transform: capitalize;">${trx.description}</td>
            <td>${trx.category || "Umum"}</td>
            <td class="text-right ${textColor}">${sign} ${formatRupiah(trx.amount)}</td>
            <td class="text-center">
                <button onclick="deleteTransaction(${trx.id})" class="delete-btn">✕</button>
            </td>
        `;
    listContainer.appendChild(row);
  });
}

function saveData() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  localStorage.setItem("targetSaving", targetSaving);
  updateDashboard();
  renderList();
}

// Menyimpan Target Rupiah Baru
saveTargetBtn.addEventListener("click", function () {
  const val = parseFloat(targetAmountInput.value);
  if (val > 0) {
    targetSaving = val;
    saveData();
    targetAmountInput.value = "";
    alert("Target Tabungan berhasil diperbarui!");
  }
});

// Submit Transaksi Baru
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const opsiTanggal = { day: "numeric", month: "short" };
  const tanggalSekarang = new Date().toLocaleDateString("id-ID", opsiTanggal);

  const newTrx = {
    id: Date.now(),
    type: typeInput.value,
    description: descInput.value.trim(),
    amount: parseFloat(amountInput.value),
    category: categoryInput.value,
    date: tanggalSekarang,
  };

  transactions.push(newTrx);
  saveData();

  descInput.value = "";
  amountInput.value = "";
});

window.deleteTransaction = function (id) {
  transactions = transactions.filter((trx) => trx.id !== id);
  saveData();
};

clearAllBtn.addEventListener("click", function () {
  if (confirm("Hapus seluruh data?")) {
    transactions = [];
    targetSaving = 0;
    saveData();
  }
});

// Jalankan saat startup halaman terbuka
updateDashboard();
renderList();
