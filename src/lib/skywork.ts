const SKYWORK_API_KEY = process.env.SKYWORK_API_KEY;
const SKYWORK_API_BASE = process.env.SKYWORK_API_BASE || "https://api.skywork.ai/v1";

/**
 * Invokes the Skywork AI model for specialized reasoning, Chinese/global market connections,
 * or advanced bilingual translations.
 */
export async function callSkywork(prompt: string, systemPrompt?: string): Promise<string> {
  if (!SKYWORK_API_KEY) {
    // Return mock fallback if not configured yet
    return `[Skywork Simüle Modu] Şifre henüz tanımlanmamış. \n\n*Örnek Skywork Yanıtı:* Skywork AI modeli, özellikle büyük ölçekli muhakeme (reasoning) ve veri sentezleme konularında uzmandır. Talebiniz: "${prompt}"`;
  }

  const url = `${SKYWORK_API_BASE}/chat/completions`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SKYWORK_API_KEY}`
      },
      body: JSON.stringify({
        model: "skywork-o1-preview", // Standard Skywork reasoning model name
        messages: [
          { role: "system", content: systemPrompt || "Sen Brick & Fortune firmasının elit marka sesini yansıtan profesyonel bir asistan yazarsın." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Skywork API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    return content;
  } catch (error: any) {
    console.error("Skywork API Error:", error);
    return `Skywork API işlem hatası: ${error?.message || error}`;
  }
}
