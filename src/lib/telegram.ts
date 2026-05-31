const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

/**
 * Sends a message to a Telegram chat.
 */
export async function sendTelegramMessage(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error("TELEGRAM_BOT_TOKEN is not defined in env variables.");
    return;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "Markdown",
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Telegram API error: ${response.status} - ${errorText}`);
      
      // Fallback without Markdown parsing in case formatting was broken
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      });
    }
  } catch (error) {
    console.error("Failed to send Telegram message:", error);
  }
}

/**
 * Sends a chat action (like 'typing') to a Telegram chat.
 */
export async function sendTelegramAction(chatId: number, action: "typing" | "upload_photo" | "record_video" = "typing") {
  if (!TELEGRAM_BOT_TOKEN) return;

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendChatAction`;

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        action: action,
      }),
    });
  } catch (error) {
    console.error("Failed to send Telegram action:", error);
  }
}
