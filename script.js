// Inisialisasi Elemen HTML DOM
const inputDeskripsi = document.getElementById("deskripsi");
const inputJumlah = document.getElementById("jumlah");
const inputTanggal = document.getElementById("tanggal");
const selectKategori = document.getElementById("kategori");
const btnSimpan = document.getElementById("btnSimpan");
const btnResetTable = document.getElementById("btnResetTable");
const tabelRiwayat = document.getElementById("tabelRiwayat");

const txtPemasukan = document.getElementById("totalPemasukan");
const txtPengeluaran = document.getElementById("totalPengeluaran");
const txtSisaSaldo = document.getElementById("sisaSaldo");

const inputTarget = document.getElementById("inputTarget");
const progressText = document.getElementById("progressText");
const infoTargetAktif = document.getElementById("infoTargetAktif");

// Set tanggal default ke hari ini
const hariIni = new Date().toISOString().split("T");
inputTanggal.value = hariIni;

// Memuat data dari LocalStorage agar tidak hilang saat refresh
let daftarTransaksi =
  JSON.parse(localStorage.getItem("riwayat_keuangan")) || [];
let targetTabungan =
  parseFloat(localStorage.getItem("target_tabungan")) || 1000000;

// Set nilai awal kolom input target sesuai data tersimpan
inputTarget.value = targetTabungan;

// Fungsi Menghitung Seluruh Saldo, Target, dan Memperbarui Tampilan UI
function hitungDanRenderUlang() {
  let totalPemasukan = 0;
  let totalPengeluaran = 0;

  tabelRiwayat.innerHTML = "";

  if (daftarTransaksi.length === 0) {
    tabelRiwayat.innerHTML = `
            <tr id="rowKosong">
                <td colspan="4" class="empty-row">Belum ada data keuangan yang tercatat</td>
            </tr>
        `;
  } else {
    daftarTransaksi.forEach((item) => {
      if (item.kategori === "Pemasukan") {
        totalPemasukan += item.jumlah;
      } else {
        totalPengeluaran += item.jumlah;
      }

      const baris = document.createElement("tr");
      const opsiTanggal = { day: "2-digit", month: "2-digit", year: "numeric" };
      const tglFormat = new Date(item.tanggal).toLocaleDateString(
        "id-ID",
        opsiTanggal,
      );
      const warnaTeks = item.kategori === "Pemasukan" ? "#6ee7b7" : "#fca5a5";

      baris.innerHTML = `
                <td>${tglFormat}</td>
                <td>${item.deskripsi}</td>
                <td>${item.kategori}</td>
                <td style="color: ${warnaTeks}; font-weight: bold;">Rp ${item.jumlah.toLocaleString("id-ID")}</td>
            `;
      tabelRiwayat.appendChild(baris);
    });
  }

  const sisaSaldo = totalPemasukan - totalPengeluaran;

  // Tampilkan data kalkulasi di kotak ringkasan atas
  txtPemasukan.innerText = `Rp ${totalPemasukan.toLocaleString("id-ID")}`;
  txtPengeluaran.innerText = `Rp ${totalPengeluaran.toLocaleString("id-ID")}`;
  txtSisaSaldo.innerText = `Rp ${sisaSaldo.toLocaleString("id-ID")}`;

  // Tampilkan nilai target aktif saat ini
  infoTargetAktif.innerText = `Rp ${targetTabungan.toLocaleString("id-ID")}`;

  // Hitung Persentase Progress Lingkaran
  let persentase = 0;
  if (targetTabungan > 0 && sisaSaldo > 0) {
    persentase = Math.round((sisaSaldo / targetTabungan) * 100);
  }
  if (persentase > 100) persentase = 100;
  if (persentase < 0) persentase = 0;

  progressText.innerText = `${persentase}%`;
}

// BARU: Event Listener 'input' untuk mendeteksi perubahan target secara langsung (real-time)
inputTarget.addEventListener("input", function () {
  const nilaiBaru = parseFloat(inputTarget.value);

  // Jika kolom dikosongkan atau diisi angka tidak valid, set sementara ke 0 agar tidak merusak rumus persen
  if (!isNaN(nilaiBaru) && nilaiBaru >= 0) {
    targetTabungan = nilaiBaru;
  } else {
    targetTabungan = 0;
  }

  // Simpan otomatis ke penyimpanan browser setiap kali angka diketik
  localStorage.setItem("target_tabungan", targetTabungan);

  // Langsung update layar tanpa perlu klik tombol simpan target lagi
  hitungDanRenderUlang();
});

// Tombol Simpan Transaksi Baru ke Tabel
btnSimpan.addEventListener("click", function () {
  const deskripsi = inputDeskripsi.value.trim();
  const jumlah = parseFloat(inputJumlah.value);
  const tanggal = inputTanggal.value;
  const kategori = selectKategori.value;

  if (deskripsi === "" || isNaN(jumlah) || jumlah <= 0 || tanggal === "") {
    alert("Harap isi deskripsi, nominal jumlah uang, dan tanggal transaksi!");
    return;
  }

  const transaksiBaru = {
    id: +new Date(),
    deskripsi: deskripsi,
    jumlah: jumlah,
    tanggal: tanggal,
    kategori: kategori,
  };

  daftarTransaksi.push(transaksiBaru);
  localStorage.setItem("riwayat_keuangan", JSON.stringify(daftarTransaksi));

  hitungDanRenderUlang();

  inputDeskripsi.value = "";
  inputJumlah.value = "";
  inputTanggal.value = hariIni;
});

// Tombol Hapus Semua Riwayat Data Tabel
btnResetTable.addEventListener("click", function () {
  if (confirm("Apakah Anda yakin ingin menghapus seluruh data transaksi?")) {
    daftarTransaksi = [];
    localStorage.removeItem("riwayat_keuangan");
    hitungDanRenderUlang();
  }
});

// Jalankan kalkulasi data awal saat pertama kali web dibuka
hitungDanRenderUlang();
