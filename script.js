// Mengambil data dari LocalStorage agar data tidak hilang saat web di-refresh
let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

// Inisialisasi Elemen DOM
const formTransaksi = document.getElementById("form-transaksi");
const deskripsiInput = document.getElementById("deskripsi");
const jumlahInput = document.getElementById("jumlah");
const jenisInput = document.getElementById("jenis");

const totalPemasukanEl = document.getElementById("total-pemasukan");
const totalPengeluaranEl = document.getElementById("total-pengeluaran");
const sisaSaldoEl = document.getElementById("sisa-saldo");
const daftarTransaksiEl = document.getElementById("daftar-transaksi");
const pesanKosongEl = document.getElementById("pesan-kosong");

// Fungsi format angka ke Rupiah secara otomatis
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
}

// Fungsi memperbarui hitungan saldo otomatis
function updateKalkulasi() {
  let pemasukan = 0;
  let pengeluaran = 0;

  transaksi.forEach((item) => {
    if (item.jenis === "pemasukan") {
      pemasukan += item.jumlah;
    } else {
      pengeluaran += item.jumlah;
    }
  });

  const sisaSaldo = pemasukan - pengeluaran;

  // Masukkan hasil kalkulasi ke HTML
  totalPemasukanEl.innerText = formatRupiah(pemasukan);
  totalPengeluaranEl.innerText = formatRupiah(pengeluaran);
  sisaSaldoEl.innerText = formatRupiah(sisaSaldo);

  // Ganti warna saldo otomatis jika minus/negatif
  if (sisaSaldo < 0) {
    sisaSaldoEl.className = "card-value text-red";
  } else {
    sisaSaldoEl.className = "card-value text-indigo";
  }
}

// Fungsi menampilkan list tabel riwayat transaksi
function renderTransaksi() {
  daftarTransaksiEl.innerHTML = "";

  if (transaksi.length === 0) {
    pesanKosongEl.classList.remove("hidden");
    return;
  } else {
    pesanKosongEl.classList.add("hidden");
  }

  transaksi.forEach((item, index) => {
    const tr = document.createElement("tr");

    const warnaTeks = item.jenis === "pemasukan" ? "text-green" : "text-red";
    const labelJenis =
      item.jenis === "pemasukan" ? "📈 Pemasukan" : "📉 Pengeluaran";
    const tanda = item.jenis === "pemasukan" ? "+" : "-";

    tr.innerHTML = `
            <td>${item.tanggal}</td>
            <td><strong>${item.deskripsi}</strong></td>
            <td><span class="text-muted">${labelJenis}</span></td>
            <td class="text-right ${warnaTeks}"><strong>${tanda} ${formatRupiah(item.jumlah)}</strong></td>
            <td class="text-center">
                <button onclick="hapusTransaksi(${index})" class="btn-delete">
                    Hapus
                </button>
            </td>
        `;
    daftarTransaksiEl.appendChild(tr);
  });
}

// Fungsi menambah transaksi baru saat form dikirim
formTransaksi.addEventListener("submit", function (e) {
  e.preventDefault();

  const itemBaru = {
    id: Date.now(),
    tanggal: new Date().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    deskripsi: deskripsiInput.value,
    jumlah: parseFloat(jumlahInput.value),
    jenis: jenisInput.value,
  };

  transaksi.push(itemBaru);
  saveToLocalStorage();
  init();

  // Reset input form setelah submit selesai
  formTransaksi.reset();
});

// Fungsi menghapus baris transaksi
function hapusTransaksi(index) {
  transaksi.splice(index, 1);
  saveToLocalStorage();
  init();
}

// Fungsi sinkronisasi data ke penyimpanan browser
function saveToLocalStorage() {
  localStorage.setItem("transaksi", JSON.stringify(transaksi));
}

// Jalankan fungsi kalkulasi & render saat pertama kali web dimuat
function init() {
  renderTransaksi();
  updateKalkulasi();
}

// Eksekusi aplikasi
init();
