// Mock grammar correction logic
function mockTutorReply(message, options = {}) {
  let corrected = message.trim()
    .replace(/\bi\b/g, "I")
    .replace(/\bim\b/g, "I'm")
    .replace(/\s+/g, " ");

  let reply = corrected;
  if (options.correctGrammar) {
    reply = `✅ Correction: ${corrected}`;
  }
  if (options.explain) {
    reply += "\n\n💡 Explanation: Improved capitalization & subject-verb agreement.";
  }
  return reply;
}

export const chatController = async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { message, options } = req.body || {};
  if (!message) {
    res.write(`data: ${JSON.stringify({ error: "Message required" })}\n\n`);
    return res.end();
  }

  try {
    const target = process.env.NLP_WORKER_URL || "http://localhost:8002/chat";
    const hfResp = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, options }),
    });

    const data = await hfResp.json();
    const reply = data.text || "(no response)";

    // Stream token by token
    let i = 0;
    const interval = setInterval(() => {
      if (i < reply.length) {
        res.write(`data: ${JSON.stringify({ token: reply[i] })}\n\n`);
        i++;
      } else {
        clearInterval(interval);
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }
    }, 30);
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
};