// US-25: pasang tema (terang atau gelap) sebelum halaman digambar, supaya tidak berkedip.
// Dimuat sebagai file terpisah (bukan script sisipan) agar sesuai dengan Content-Security-Policy.
(function () {
  try {
    var tersimpan = localStorage.getItem("tema");
    var tema =
      tersimpan === "gelap" || tersimpan === "terang"
        ? tersimpan
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "gelap"
          : "terang";
    document.documentElement.setAttribute("data-tema", tema);
  } catch (e) {
    // Penyimpanan browser diblokir: pakai tema terang bawaan.
  }
})();
