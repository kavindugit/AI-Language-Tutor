// backend/controllers/aiController.js
export const ocrProxy = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "file is required (multipart/form-data, key: file)" });
    }

    const base = process.env.SPEECH_VISION_URL || "http://localhost:8001";
    const target = `${base.replace(/\/$/, "")}/ocr`;

    // Build multipart form with the uploaded buffer
    const form = new FormData(); // global in Node >=18
    const blob = new Blob([req.file.buffer], { type: req.file.mimetype }); // global Blob
    form.append("file", blob, req.file.originalname);

    const response = await fetch(target, {
      method: "POST",
      body: form,
      // If your FastAPI required a token, add it here:
      // headers: { "x-internal-token": process.env.AI_SERVICE_TOKEN || "" },
      // fetch will set Content-Type boundary automatically for FormData
    });

    const text = await response.text(); // capture non-JSON errors too
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!response.ok) {
      return res.status(response.status).json({ success: false, message: "AI service error", data });
    }

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error("ocrProxy error:", err);
    return res.status(500).json({ success: false, message: err.message || "OCR proxy failed" });
  }
};

