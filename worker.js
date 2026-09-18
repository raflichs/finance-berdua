export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (url.pathname === "/api/scan-struk" && req.method === "POST") {
      // ponytail: proxy via Worker, fallback direct when env missing upgrade when need rate limit
      const key = env.GEMINI_API_KEY;
      if (!key) return new Response(JSON.stringify({ error: "GEMINI_API_KEY not set" }), { status: 500, headers: { "Content-Type": "application/json", ...cors } });
      let body;
      try { body = await req.json(); } catch { return new Response(JSON.stringify({ error: "invalid json" }), { status: 400, headers: { "Content-Type": "application/json", ...cors } }); }
      const base64 = body.imageBase64 || body.image || body.base64;
      const mediaType = body.mediaType || body.mimeType || "image/jpeg";
      if (!base64) return new Response(JSON.stringify({ error: "imageBase64 required" }), { status: 400, headers: { "Content-Type": "application/json", ...cors } });
      const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ inline_data: { mime_type: mediaType, data: base64 } }, { text: 'Baca struk/nota ini dan ekstrak semua item beserta harganya. Balas HANYA dengan JSON array seperti ini, tanpa teks lain, tanpa markdown: [{"name": "nama item", "price": 12000}, ...]. Gunakan harga satuan (bukan subtotal). Jika ada qty lebih dari 1, sertakan di nama item.' }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
        })
      });
      const data = await gemRes.json();
      return new Response(JSON.stringify(data), { status: gemRes.status, headers: { "Content-Type": "application/json", ...cors } });
    }
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "not found" }), { status: 404, headers: { "Content-Type": "application/json", ...cors } });
    }
    if (env.ASSETS && env.ASSETS.fetch) return env.ASSETS.fetch(req);
    return fetch(req);
  }
};
