/**
 * WhatsApp Business Cloud API Helper Module (Brick & Fortune)
 * Connects to Meta Graph API for automated two-way WhatsApp business messaging.
 * Supports robust mock fallbacks if credentials are not set in environment.
 */

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

function isWhatsAppConfigured(): boolean {
  return !!(WHATSAPP_TOKEN && WHATSAPP_PHONE_NUMBER_ID);
}

/**
 * Sends a direct text message to a user's phone number via WhatsApp.
 */
export async function sendWhatsAppTextMessage(to: string, text: string): Promise<{ status: string; message: string; messageId?: string }> {
  // Normalize phone number (ensure country code, remove spacing/characters)
  const normalizedTo = to.replace(/\D/g, ""); // e.g. 905321234567

  if (!isWhatsAppConfigured()) {
    console.log(`[Mock WhatsApp Outbound] Sending to: ${normalizedTo} | Text: "${text}"`);
    return {
      status: "success",
      message: `WhatsApp mesajı (Simüle Modda) başarıyla +${normalizedTo} numarasına gönderildi.`
    };
  }

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: normalizedTo,
        type: "text",
        text: {
          preview_url: true,
          body: text
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Meta WhatsApp API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return {
      status: "success",
      message: `WhatsApp mesajı başarıyla +${normalizedTo} numarasına gönderildi!`,
      messageId: data.messages?.[0]?.id
    };
  } catch (error: any) {
    console.error("WhatsApp API outbound error:", error);
    throw new Error(`WhatsApp mesaj gönderim hatası: ${error?.message || error}`);
  }
}
