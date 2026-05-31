import { NextRequest, NextResponse } from "next/server";
import { runOrchestrator } from "@/lib/orchestrator";
import { sendTelegramMessage, sendTelegramAction } from "@/lib/telegram";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received Telegram Webhook payload:", JSON.stringify(body, null, 2));

    // Telegram sends various updates; we are looking for text messages
    if (body.message && body.message.text) {
      const chatId = body.message.chat.id;
      const text = body.message.text;

      // Show typing indicator in Telegram while we process the request
      await sendTelegramAction(chatId, "typing");

      // Run orchestrator with the message
      const response = await runOrchestrator(chatId, text);

      // Send response back to Telegram
      await sendTelegramMessage(chatId, response);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error in webhook route:", error);
    // Always return 200 to Telegram to prevent retry loops
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 200 });
  }
}

// Simple GET endpoint for checking webhook status
export async function GET() {
  return NextResponse.json({ 
    status: "active", 
    message: "Telegram Webhook endpoint is up and running." 
  });
}
