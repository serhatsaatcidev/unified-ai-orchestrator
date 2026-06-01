import { NextRequest, NextResponse } from "next/server";
import { runOrchestrator } from "@/lib/orchestrator";

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "brick_fortune_secure_token_123";

/**
 * Meta Webhook Verification Endpoint (GET)
 * Meta calls this endpoint with a challenge to verify that our server is legitimate.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode && token) {
      if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
        console.log("[WhatsApp Webhook] Successfully verified with Meta!");
        return new NextResponse(challenge, { status: 200 });
      } else {
        console.warn("[WhatsApp Webhook] Verification failed: Token mismatch.");
        return new NextResponse("Forbidden", { status: 403 });
      }
    }

    return new NextResponse("Bad Request", { status: 400 });
  } catch (error: any) {
    console.error("[WhatsApp Webhook GET] Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Meta Incoming Webhook Handler (POST)
 * Receives incoming text messages from users on WhatsApp, routes them to our AI Orchestrator,
 * and replies back to the user's phone number.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("[WhatsApp Webhook] Received payload:", JSON.stringify(body, null, 2));

    // Parse Meta WhatsApp incoming payload structure
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.text && message.text.body) {
      const from = message.from; // User's phone number (sender ID)
      const text = message.text.body; // Incoming message text
      
      console.log(`[WhatsApp Webhook] Message from: ${from} | Text: "${text}"`);

      // 1. Pass the message to our core AI Orchestrator
      // Convert 'from' phone number string to a numerical ID for orchestrator compatibility
      const userId = parseInt(from.replace(/\D/g, ""), 10) || 12345;
      const responseText = await runOrchestrator(userId, text);

      // 2. Send the reply back to WhatsApp
      await sendWhatsAppMessage(from, responseText);
    }

    // Always return 200 OK to Meta to acknowledge receipt and prevent retry loops
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[WhatsApp Webhook POST] Error processing webhook:", error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }
}

/**
 * Sends a message back to the user via Meta WhatsApp Business Cloud API
 */
async function sendWhatsAppMessage(to: string, text: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.log(`[Mock WhatsApp Send] Sending to: ${to} | Text: "${text}"`);
    return;
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
        to: to,
        type: "text",
        text: {
          preview_url: true,
          body: text
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Meta API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log(`[WhatsApp API] Successfully sent message. Message ID: ${data.messages?.[0]?.id}`);
  } catch (error: any) {
    console.error("[WhatsApp API] Failed to send message:", error);
    throw error;
  }
}
