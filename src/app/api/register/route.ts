import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  // Fallback to reading the URL from request headers if env is not defined
  const host = req.headers.get("host") || "";
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  if (!TELEGRAM_BOT_TOKEN) {
    return NextResponse.json({
      success: false,
      error: "TELEGRAM_BOT_TOKEN is missing in the environment variables. Please set it in Vercel or local .env."
    }, { status: 400 });
  }

  const webhookUrl = `${siteUrl}/api/webhook`;
  const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;

  try {
    const response = await fetch(telegramUrl);
    const data = await response.json();

    if (data.ok) {
      return NextResponse.json({
        success: true,
        message: "Telegram Webhook successfully registered!",
        registeredUrl: webhookUrl,
        telegramResponse: data
      });
    } else {
      return NextResponse.json({
        success: false,
        error: "Failed to register webhook with Telegram.",
        telegramResponse: data
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: "Error occurred while connecting to Telegram API.",
      details: error?.message || error
    }, { status: 500 });
  }
}
