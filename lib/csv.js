// Baca dan tulis CSV tanpa paket tambahan (US-35 ekspor, US-46 impor).

// Pecah teks CSV menjadi baris dan kolom. Mendukung kolom bertanda kutip
// (boleh berisi koma, baris baru, dan "" untuk kutip), serta pemisah koma atau titik koma.
export function uraiCsv(teks) {
  let isi = String(teks ?? "");
  if (isi.charCodeAt(0) === 0xfeff) isi = isi.slice(1); // BOM dari Excel

  const barisPertama = isi.split(/\r?\n/, 1)[0] ?? "";
  const pemisah = (barisPertama.match(/;/g) ?? []).length > (barisPertama.match(/,/g) ?? []).length ? ";" : ",";

  const hasil = [];
  let baris = [];
  let sel = "";
  let dalamKutip = false;

  for (let i = 0; i < isi.length; i++) {
    const c = isi[i];

    if (dalamKutip) {
      if (c === '"') {
        if (isi[i + 1] === '"') {
          sel += '"';
          i++;
        } else {
          dalamKutip = false;
        }
      } else {
        sel += c;
      }
      continue;
    }

    if (c === '"') {
      dalamKutip = true;
    } else if (c === pemisah) {
      baris.push(sel);
      sel = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && isi[i + 1] === "\n") i++;
      baris.push(sel);
      hasil.push(baris);
      baris = [];
      sel = "";
    } else {
      sel += c;
    }
  }

  if (sel !== "" || baris.length > 0) {
    baris.push(sel);
    hasil.push(baris);
  }

  // Buang baris yang sepenuhnya kosong.
  return hasil.filter((b) => b.some((s) => s.trim() !== ""));
}

// Aman untuk spreadsheet: sel yang diawali = + - @ bisa dibaca sebagai rumus,
// jadi diberi awalan apostrof supaya tampil sebagai teks biasa.
function amankanSel(nilai) {
  if (nilai === null || nilai === undefined) return "";
  if (typeof nilai === "number") return String(nilai);
  let teks = String(nilai);
  if (/^[=+\-@\t\r]/.test(teks)) teks = `'${teks}`;
  if (/[",\r\n]/.test(teks)) teks = `"${teks.replace(/"/g, '""')}"`;
  return teks;
}

// Ubah daftar baris (array of array) menjadi teks CSV, dengan BOM supaya Excel
// membaca huruf Indonesia dengan benar.
export function keCsv(baris) {
  return "﻿" + baris.map((b) => b.map(amankanSel).join(",")).join("\r\n") + "\r\n";
}
