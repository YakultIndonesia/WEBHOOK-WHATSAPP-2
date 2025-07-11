import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

// Ganti token sesuai token verifikasi yang kamu atur di Facebook Developer
const VERIFY_TOKEN = "yakult123";

// Token WhatsApp Cloud API kamu
const ACCESS_TOKEN = "EAATwJ7fXR9cBPEk9apOAsFXaD6ZBRQUhNBw2NoasjbytHYZAd2TgIHHZAdBOcBVZCumgSXmnj2yoWuDe2WJrZAd2cBQLf7TzXYopc4Hjg98DzWBESTDW3tJTGdkhJAlQKCmDIS00gyzrtACBgD8scceFT28sxArKF3HSGhISU2jz8VAhsC94cCrvRlUUZAWRXVHZBhrsXRIbOo2j7njd5ObOa83T6sKUOC6dYuWzuxMrSgs2023zvnGIF9zVboCVQZDZD";
const PHONE_NUMBER_ID = "695532333647494";

// Untuk webhook verification
app.get("/webhook", (req, res) => {
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  if (mode && token) {
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Untuk menerima pesan dari WhatsApp
app.post("/webhook", async (req, res) => {
  let body = req.body;

  console.log("Webhook received:", JSON.stringify(body, null, 2));

  if (
    body.object &&
    body.entry &&
    body.entry[0].changes &&
    body.entry[0].changes[0].value.messages
  ) {
    let phone_number_id = body.entry[0].changes[0].value.metadata.phone_number_id;
    let from = body.entry[0].changes[0].value.messages[0].from;
    let msg_body = body.entry[0].changes[0].value.messages[0].text.body;

    console.log("Pesan masuk dari:", from, "Isi pesan:", msg_body);

    // Kirim balasan ke WhatsApp
    await sendWhatsAppMessage(from, `Halo! Pesanmu sudah diterima: ${msg_body}`);
  }

  res.sendStatus(200);
});

// Fungsi kirim pesan ke WhatsApp API
async function sendWhatsAppMessage(to, message) {
  try {
    const url = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: message },
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ACCESS_TOKEN}`,
      },
    });

    console.log("Pesan berhasil dikirim:", response.data);
  } catch (error) {
    console.error("Gagal kirim pesan:", error.response?.data || error.message);
  }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook berjalan di port ${PORT}`);
});
