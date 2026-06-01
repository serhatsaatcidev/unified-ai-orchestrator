import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY || "",
});

/**
 * Invokes Claude 3.5 Sonnet for advanced reasoning, content drafting,
 * or formal correspondence.
 */
export async function callClaude(prompt: string, systemPrompt?: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return "Hata: ANTHROPIC_API_KEY çevre değişkeni tanımlanmamış. Lütfen Vercel veya .env.local dosyasına ekleyin.";
  }

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022", // Active stable Claude 3.5 Sonnet model name
      max_tokens: 4000,
      system: systemPrompt || "Sen Brick & Fortune firmasının elit marka sesini yansıtan profesyonel bir asistan yazarsın.",
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content[0];
    if (textBlock && textBlock.type === "text") {
      return textBlock.text;
    }
    return "Claude'dan geçerli bir yanıt alınamadı.";
  } catch (error: any) {
    console.error("Claude API Error:", error);
    const errString = error?.message || JSON.stringify(error) || "";
    if (errString.includes("credit balance") || errString.includes("credit_balance_too_low")) {
      throw new Error("credit_balance_too_low");
    }
    throw new Error(`Claude API işlem hatası: ${error?.message || error}`);
  }
}
