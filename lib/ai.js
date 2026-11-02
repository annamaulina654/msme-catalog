// US-14 dan US-50: panggil Gemini API dari server. Kunci API tidak pernah dikirim ke browser.
// Variabel yang dipakai (di .env.local dan Vercel):
//   GEMINI_API_KEY  wajib untuk mengaktifkan fitur AI
//   GEMINI_MODEL    opsional, nama model (bawaan: gemini-2.5-flash)

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const BATAS_WAKTU_MS = 30_000;

export async function tanyaGemini({ sistem, pengguna, maksToken = 1024 }) {
  const kunci = process.env.GEMINI_API_KEY;
  if (!kunci) {
    return { error: "Fitur AI belum aktif karena GEMINI_API_KEY belum diisi." };
  }

  try {
    const respons = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": kunci },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sistem }] },
          contents: [{ role: "user", parts: [{ text: pengguna }] }],
          generationConfig: {
            maxOutputTokens: maksToken,
            temperature: 0.4,
            thinkingConfig: { thinkingLevel: "low" },
          },
        }),
        signal: AbortSignal.timeout(BATAS_WAKTU_MS),
      }
    );

    if (!respons.ok) {
      console.error("Gemini gagal, status:", respons.status);
      return { error: "Layanan AI sedang bermasalah. Coba lagi beberapa saat lagi." };
    }

    const json = await respons.json();
    const teks = (json?.candidates?.[0]?.content?.parts ?? [])
      .map((bagian) => bagian?.text ?? "")
      .join("")
      .trim();

    if (!teks) {
      return { error: "AI belum memberi jawaban. Coba ulangi dengan kalimat lain." };
    }
    return { teks };
  } catch (err) {
    if (err?.name === "TimeoutError" || err?.name === "AbortError") {
      return { error: "AI terlalu lama menjawab. Coba lagi." };
    }
    console.error("Gemini tidak terjangkau, jenis error:", err?.name ?? "tidak-diketahui");
    return { error: "Layanan AI belum bisa dihubungi. Coba lagi beberapa saat lagi." };
  }
}
