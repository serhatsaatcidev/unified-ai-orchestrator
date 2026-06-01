import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";
import { listGmailEmails, sendGmailEmail, uploadToDrive, postToGoogleBusiness, listGoogleCalendarEvents, createGoogleCalendarEvent, listGoogleTasks, createGoogleTask, completeGoogleTask } from "./google";
import { callClaude } from "./claude";
import { callSkywork } from "./skywork";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();

// Define function declarations (Tools) for Gemini
const marketResearchTool: FunctionDeclaration = {
  name: "performMarketResearch",
  description: "Searches the web or database to analyze real estate prices, market trends, or property listings in a specific location.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      location: { type: SchemaType.STRING, description: "The city or district to research (e.g., 'Kadıköy', 'Bodrum')." },
      query: { type: SchemaType.STRING, description: "Specific research query (e.g., 'acilde satılık 3+1 daire fiyatları')." },
      propertyType: { type: SchemaType.STRING, description: "Type of property: 'residential', 'commercial', 'land'." }
    },
    required: ["location", "query"]
  }
};

const socialMediaTool: FunctionDeclaration = {
  name: "generateSocialMediaContent",
  description: "Generates structured social media posts (LinkedIn or Instagram) with appropriate formatting, emojis, and hashtags.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      platform: { type: SchemaType.STRING, description: "The platform: 'linkedin' or 'instagram'." },
      topic: { type: SchemaType.STRING, description: "The core topic or theme of the post (e.g., 'Emlak yatırımı yaparken dikkat edilmesi gerekenler')." },
      tone: { type: SchemaType.STRING, description: "Tone of the post: 'professional', 'casual', 'energetic', 'educational'." }
    },
    required: ["platform", "topic"]
  }
};

const emailCalendarTool: FunctionDeclaration = {
  name: "manageEmailsAndCalendar",
  description: "Manages business emails and calendar invites. Can check incoming emails, list appointments, draft replies, or schedule meetings.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      action: { 
        type: SchemaType.STRING, 
        description: "The action to perform: 'list_emails' (recent emails), 'list_calendar' (upcoming events), 'send_email' (draft/send), 'schedule_event' (calendar add)." 
      },
      details: { type: SchemaType.STRING, description: "Context details (e.g., recipient email, meeting title, date/time)." },
      calendarSummary: { type: SchemaType.STRING, description: "Title/Summary of calendar event." },
      calendarStart: { type: SchemaType.STRING, description: "Start time of calendar event in ISO 8601 format (e.g., '2026-06-01T14:00:00Z')." },
      calendarEnd: { type: SchemaType.STRING, description: "End time of calendar event in ISO 8601 format (e.g., '2026-06-01T15:00:00Z')." },
      calendarLocation: { type: SchemaType.STRING, description: "Location of the event (e.g. 'Knightsbridge Office')." }
    },
    required: ["action"]
  }
};

const presentationTool: FunctionDeclaration = {
  name: "createPresentationOutline",
  description: "Creates a structured slide-by-slide outline (compatible with Marp Markdown) for a business presentation, client pitch, or report.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      topic: { type: SchemaType.STRING, description: "The topic of the presentation." },
      audience: { type: SchemaType.STRING, description: "Target audience (e.g., 'Emlak Yatırımcıları', 'Potansiyel Alıcılar')." },
      slideCount: { type: SchemaType.INTEGER, description: "Desired number of slides." }
    },
    required: ["topic", "audience"]
  }
};

const webUpdateTool: FunctionDeclaration = {
  name: "updateWebsiteContent",
  description: "Drafts and schedules content updates, blog posts, or property listings for the user's web applications or WordPress/Vercel sites.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      page: { type: SchemaType.STRING, description: "Target page or section (e.g., 'blog', 'listings', 'about')." },
      title: { type: SchemaType.STRING, description: "Title of the content or listing." },
      contentBody: { type: SchemaType.STRING, description: "The body or HTML content to upload." }
    },
    required: ["page", "title", "contentBody"]
  }
};

const notebookLMTool: FunctionDeclaration = {
  name: "generateNotebookSource",
  description: "Formats and compiles prime London property data or research into a NotebookLM-optimized text document and uploads it directly to Google Drive.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      topic: { type: SchemaType.STRING, description: "The research topic or title (e.g., 'Mayfair Freehold vs Leasehold Analysis')." },
      contentBody: { type: SchemaType.STRING, description: "The detailed, structured text content to prepare for NotebookLM." }
    },
    required: ["topic", "contentBody"]
  }
};

const tasksTool: FunctionDeclaration = {
  name: "manageTasks",
  description: "Manages the user's todo list and tasks on Google Tasks. Can list tasks, add a new task, or mark a task as completed.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      action: {
        type: SchemaType.STRING,
        description: "The action to perform: 'list_tasks' (lists uncompleted tasks), 'create_task' (adds a new task), 'complete_task' (marks a task as completed)."
      },
      title: { type: SchemaType.STRING, description: "The title or main description of the task (required for create_task)." },
      notes: { type: SchemaType.STRING, description: "Additional details, notes, or subtasks (optional)." },
      due: { type: SchemaType.STRING, description: "Sensible due date in ISO 8601/relative format (optional)." },
      taskId: { type: SchemaType.STRING, description: "The unique ID of the task to mark as completed (required for complete_task)." }
    },
    required: ["action"]
  }
};

// Tool implementations (Mocking the dynamic results for our PoC with Brick & Fortune London Zone 1 Context)
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  performMarketResearch: async ({ location, query, propertyType }) => {
    console.log(`[Tool Call] performMarketResearch in London Zone 1 / ${location}: ${query}`);
    
    // Simulate UK Zone 1 Prime Off-Market searching for Brick & Fortune
    const loc = location || "Mayfair/Knightsbridge";
    
    return {
      status: "success",
      location: loc,
      summary: `🇬🇧 *Brick & Fortune — London Zone 1 (${loc})* Off-Market Değerleme ve Analiz Raporu:`,
      averagePrice: "£2,500,000 - £15,000,000+ (Prime Zone 1 Freehold)",
      listingsFound: [
        { title: "Kensington Court — Stunning Off-Market Freehold Townhouse", price: "£6,450,000", size: "320 m² (3,440 sq ft)", source: "Brick & Fortune Off-Market Private Network" },
        { title: "Belgravia Mews — Fully Refurbished Freehold House with Garage", price: "£4,850,000", size: "210 m² (2,260 sq ft)", source: "Pre-Market Private Client Relations" },
        { title: "Knightsbridge — Exclusive Penthouse Apartment near Harrods (Leasehold 990+ Yrs)", price: "£8,900,000", size: "280 m² (3,010 sq ft)", source: "Boutique RICS Valued Portfolio" }
      ],
      marketTrend: "Londra Zone 1 prime gayrimenkul pazarı, küresel dalgalanmalara karşı en dirençli 'güvenli liman' olmaya devam ediyor. Türk HNWI (High Net Worth Individual) yatırımcıların enflasyon korumalı İngiliz Sterlini ve özellikle 'Freehold' (toprak mülkiyetli) varlıklara olan talebi son derece yüksek.",
      insights: "Knightsbridge ve Mayfair bölgesinde off-market (kamuya kapalı) ilanlarda alıcı tarafını (Buying Agent) temsil etmenin avantajıyla pazarlık gücümüz ortalama %6-10 seviyesindedir. Satıcı emlakçısının aksine yalnızca alıcı çıkarlarını ve gizliliğini koruyoruz."
    };
  },

  generateSocialMediaContent: async ({ platform, topic, tone }) => {
    console.log(`[Tool Call] generateSocialMediaContent for ${platform} on topic: ${topic}`);
    
    const hashtags = platform === "linkedin" 
      ? "\n\n#BrickAndFortune #LondonZone1 #BuyingAgent #PrimeCentralLondon #OffMarketLondon #FreeholdProperty #UKInvestment"
      : "\n\n#londra #londraemlak #londradavevalmak #gayrimenkulyatırımı #kensington #mayfair #buyingagent #luxuryhomes";

    const content = platform === "linkedin"
      ? `📈 **Londra Zone 1'de Gayrimenkul Yatırımı: Neden 'Leasehold' Değil, 'Freehold' Tercih Etmelisiniz?**\n\nLondra'da ev satın alırken karşınıza çıkacak en kritik kavramlardan biri mülkiyet tipidir. Çoğu emlakçı size 'Leasehold' (uzun vadeli kiralama) satmaya çalışırken, biz Brick & Fortune olarak yatırımcılarımızı **'Freehold' (gerçek toprak mülkiyetli)** yapılara yönlendiriyoruz.\n\nNeden mi?\n\n1️⃣ **Gerçek Sahiplik:** Freehold mülklerde toprağın ve binanın tamamı yasal olarak size aittir. Süre sınırı veya kira ödeme (ground rent) yükümlülüğünüz yoktur.\n2️⃣ **Maddi Değer Koruma:** Leasehold mülklerde süre azaldıkça mülkün değeri düşerken, Freehold mülkler nesiller boyu değerini katlayarak korur.\n3️⃣ **Karar Özgürlüğü:** Yenileme, tadilat veya yönetim kararlarında hiçbir third-party kuruma bağlı kalmazsınız.\n\nTürk yatırımcılarımıza Londra'nın en seçkin Zone 1 bölgelerinde (Mayfair, Knightsbridge, Chelsea) kamuya açık olmayan (off-market) 'Freehold' fırsatları sunuyoruz. Yalnızca alıcıyı temsil ettiğimiz Buying Agent modelimizi keşfetmek için iletişime geçebilirsiniz. 🤝${hashtags}`
      : `🏡 **Londra Zone 1'de Ev Alırken 'Emlakçı' Tuzağına Düşmeyin!**\n\nİngiltere'de standart emlakçılar (Estate Agent) kanunen yalnızca satıcıyı temsil eder ve onun çıkarına çalışır. \n\nSizin haklarınızı kim koruyor? \n\n✨ **Brick & Fortune** olarak biz **Buying Agent (Alıcı Temsilcisi)** rolündeyiz: \n✔️ Sadece sizin (alıcı) çıkarlarınızı koruruz.\n✔️ Kamuya açık olmayan (off-market) en iyi mülkleri buluruz.\n✔️ Satıcıdan komisyon almaz, tamamen sizin yanınızda yer alırız.\n\nLondra'da güvenli ve gizlilik odaklı yatırımın adresi: **investinlondon.com.tr** 🇬🇧${hashtags}`;

    // Auto-Post to Google Business Profile for London local SEO
    let gbpMessage = "Google Business Profile entegrasyonu simüle edildi.";
    try {
      const gbpResult = await postToGoogleBusiness(topic, content);
      gbpMessage = gbpResult.message;
    } catch (err: any) {
      console.warn("GBP Post failed:", err.message);
    }

    return {
      status: "success",
      platform,
      tone,
      generatedContent: content,
      googleBusinessStatus: gbpMessage
    };
  },

  manageEmailsAndCalendar: async (args: any) => {
    const { action, details } = args;
    console.log(`[Tool Call] manageEmailsAndCalendar: ${action}`);
    
    if (action === "list_emails") {
      try {
        const emails = await listGmailEmails();
        return { status: "success", emails };
      } catch (error: any) {
        return { status: "error", message: `Gmail listeleme hatası: ${error.message}` };
      }
    } else if (action === "list_calendar") {
      try {
        const events = await listGoogleCalendarEvents();
        return { status: "success", events };
      } catch (error: any) {
        return { status: "error", message: `Takvim listeleme hatası: ${error.message}` };
      }
    } else if (action === "send_email") {
      try {
        // Parse email recipient and body from details
        // Details structure expected: "To: recipient@email.com | Subject: subject_text | Body: html_body"
        let to = "info@investinlondon.com.tr";
        let subject = "Brick & Fortune Asistan Bildirimi";
        let body = details;

        if (details && details.includes("|")) {
          const parts = details.split("|");
          to = parts[0].replace(/to:/i, "").trim();
          subject = parts[1].replace(/subject:/i, "").trim();
          body = parts[2].replace(/body:/i, "").trim();
        }

        const res = await sendGmailEmail(to, subject, body);
        return res;
      } catch (error: any) {
        return { status: "error", message: `E-posta gönderim hatası: ${error.message}` };
      }
    } else if (action === "schedule_event") {
      try {
        const summary = args.calendarSummary || "Knightsbridge Görüşmesi";
        let start = args.calendarStart;
        let end = args.calendarEnd;
        const location = args.calendarLocation || "Rutland Gate Office, Knightsbridge";

        if (!start) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(14, 0, 0, 0);
          start = tomorrow.toISOString();
        }
        if (!end) {
          const startDate = new Date(start);
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
          end = endDate.toISOString();
        }

        const res = await createGoogleCalendarEvent(
          summary, 
          start, 
          end, 
          location, 
          details || "Brick & Fortune Asistan Planlaması"
        );
        return res;
      } catch (error: any) {
        return { status: "error", message: `Takvim etkinliği oluşturma hatası: ${error.message}` };
      }
    }
    
    return { status: "success", message: "E-posta/Takvim işlemi başarıyla tamamlandı." };
  },

  createPresentationOutline: async ({ topic, audience, slideCount }) => {
    console.log(`[Tool Call] createPresentationOutline for "${topic}"`);
    
    const count = slideCount || 5;
    const slides = `
---
marp: true
theme: gaia
_class: lead
paginate: true
backgroundColor: #0c0d12
color: #f3f4f6
---

# ${topic}
### Brick & Fortune — London Zone 1 Gayrimenkul Fırsatları
Hazırlayan: AI Kişisel Asistanınız
Hedef Kitle: ${audience} (Türk HNWI Yatırımcılar)

---

## 1. Brick & Fortune Yönetici Özeti
- Knightsbridge merkezli, yalnızca Londra Zone 1 prime gayrimenkul odağı.
- Satıcıyı değil, yalnızca ALICIYI temsil eden **Buying Agent** iş modeli.
- Freehold (gerçek mülkiyet) ve off-market (kamuya kapalı) portföy avantajı.

---

## 2. Neden Londra Zone 1 Gayrimenkulü?
- Enflasyona karşı korumalı Sterlin (GBP) bazlı sermaye koruması.
- Mayfair, Knightsbridge, Chelsea ve Kensington gibi dünyanın en prestijli lokasyonları.
- Tarihsel olarak krizlere karşı en yüksek direnci gösteren 'güvenli liman'.

---

## 3. Yatırım Kriterleri: Leasehold vs. Freehold
- Leasehold'un riskleri ve ek maliyetleri (Ground Rent, Service Charge).
- Neden yatırımcılarimizi toprağıyla gerçek mülkiyet sunan **Freehold** yapılara yönlendiriyoruz?
- Bölgesel net getiri (yield) ve amortisman analizleri.

---

## 4. Brick & Fortune Satın Alma Süreci ve Yol Haritası
- Müşteri profil analizi ve bütçelendirme (Knightsbridge ofisimizde veya İstanbul'da).
- RICS standartlarında bağımsız değerleme ve conveyancing (hukuki) süreç yönetimi.
- Gizlilik taahhüdü (NDA) çerçevesinde off-market mülklere özel erişim.
`;

    // Automatically backup the generated presentation slides into Google Drive!
    let driveMessage = "Google Drive yedekleme aktif değil.";
    try {
      const driveUpload = await uploadToDrive(
        `Marp_Sunum_${topic.replace(/\s+/g, "_")}.md`,
        slides,
        "text/markdown"
      );
      driveMessage = `Google Drive'a başarıyla yedeklendi: ${driveUpload.webViewLink}`;
    } catch (err: any) {
      console.warn("Drive upload failed:", err.message);
    }

    return {
      status: "success",
      topic,
      slideCount: count,
      marpMarkdown: slides,
      googleDriveStatus: driveMessage,
      instructions: "Yukarıdaki metni kopyalayıp bir `.md` dosyasına yapıştırarak VS Code Marp eklentisiyle anında şık sunumlara dönüştürebilirsiniz."
    };
  },

  updateWebsiteContent: async ({ page, title, contentBody }) => {
    console.log(`[Tool Call] updateWebsiteContent on page "${page}": ${title}`);
    
    return {
      status: "success",
      page,
      title,
      deploymentUrl: "https://www.investinlondon.com.tr/blog/londra-zone-1-freehold-yatirimlari",
      message: `İçerik başarıyla Brick & Fortune web sitenizin "${page}" sayfasına taslak olarak eklendi. Vercel webhook tetiklendi ve investinlondon.com.tr derleniyor.`
    };
  },

  generateNotebookSource: async ({ topic, contentBody }) => {
    console.log(`[Tool Call] generateNotebookSource for topic: ${topic}`);
    
    const formattedContent = `# NotebookLM Source Document: ${topic}
Generated by Brick & Fortune AI Orchestrator
Date: ${new Date().toLocaleDateString("tr-TR")}
---
${contentBody}
`;

    let driveMessage = "Google Drive yedekleme aktif değil.";
    try {
      const driveUpload = await uploadToDrive(
        `NotebookLM_Source_${topic.replace(/\s+/g, "_")}.txt`,
        formattedContent,
        "text/plain"
      );
      driveMessage = `Google Drive'a başarıyla yedeklendi: ${driveUpload.webViewLink}`;
    } catch (err: any) {
      console.warn("Drive upload failed:", err.message);
    }

    return {
      status: "success",
      topic,
      googleDriveStatus: driveMessage,
      instructions: `Belge başarıyla NotebookLM için Google Drive'a kaydedildi. Drive'dan NotebookLM'e tek tıkla ekleyebilirsiniz!`
    };
  },

  manageTasks: async (args: any) => {
    const { action } = args;
    console.log(`[Tool Call] manageTasks: ${action}`);

    try {
      if (action === "list_tasks") {
        const tasks = await listGoogleTasks();
        return { status: "success", tasks };
      } else if (action === "create_task") {
        const title = args.title;
        if (!title) {
          return { status: "error", message: "Görev oluşturmak için 'title' parametresi zorunludur." };
        }
        const res = await createGoogleTask(title, args.notes, args.due);
        return res;
      } else if (action === "complete_task") {
        const taskId = args.taskId;
        if (!taskId) {
          return { status: "error", message: "Görevi tamamlamak için 'taskId' parametresi zorunludur." };
        }
        const res = await completeGoogleTask(taskId);
        return res;
      }
      return { status: "error", message: `Bilinmeyen görev aksiyonu: ${action}` };
    } catch (error: any) {
      console.error("manageTasks error:", error);
      return { status: "error", message: `Görev işlemi yürütülemedi: ${error.message}` };
    }
  }
};

/**
 * Main orchestrator handler that receives messages from Telegram,
 * runs the Gemini model with tool capability, resolves tool execution,
 * and compiles the final user response.
 */
export async function runOrchestrator(userId: number, userMessage: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return "Hata: `GEMINI_API_KEY` ortam değişkeni tanımlanmamış. Lütfen kurulum rehberini kontrol edin.";
  }

  // Dual-Model Routing: If user explicitly asks for Claude or starts with "claude:", route to Anthropic
  const isClaudeRequested = 
    userMessage.toLowerCase().startsWith("claude:") || 
    userMessage.toLowerCase().includes("claude'a sor") || 
    userMessage.toLowerCase().includes("claude ile");

  if (isClaudeRequested) {
    console.log(`[Model Routing] Routing request to Claude 3.5 Sonnet: ${userMessage}`);
    const cleanedMessage = userMessage.replace(/^claude:/i, "").trim();
    const systemInstruction = `Sen Brick & Fortune firmasının kurucusu Serhat Saatcı Bey'in tüm işlerini koordine eden, Londra Zone 1 prime gayrimenkul ve Knightsbridge emlak piyasasına, Buying Agent (Alıcı Temsilcisi) iş modeline, off-market freehold mülklere tamamen hakim, son derece profesyonel, kibar ve çözüm odaklı Kişisel Yapay Zeka Asistanısın (Brick & Fortune Claude 3.5 Sonnet Orchestrator).
Konuşmalarında ve raporlarında daima bu elit, kurumsal ve güven veren 'Brick & Fortune' tonunu yansıtmalısın.
Daima samimi, son derece saygılı ve profesyonel bir iş dili kullan.`;
    
    return await callClaude(cleanedMessage, systemInstruction);
  }

  // Skywork Routing: If user explicitly asks for Skywork or starts with "skywork:", route to Skywork AI
  const isSkyworkRequested = 
    userMessage.toLowerCase().startsWith("skywork:") || 
    userMessage.toLowerCase().includes("skywork'e sor") || 
    userMessage.toLowerCase().includes("skywork ile");

  if (isSkyworkRequested) {
    console.log(`[Model Routing] Routing request to Skywork AI: ${userMessage}`);
    const cleanedMessage = userMessage.replace(/^skywork:/i, "").trim();
    const systemInstruction = `Sen Brick & Fortune firmasının kurucusu Serhat Saatcı Bey'in tüm işlerini koordine eden, Londra Zone 1 prime gayrimenkul ve Knightsbridge emlak piyasasına tamamen hakim, son derece profesyonel, kibar ve çözüm odaklı Kişisel Yapay Zeka Asistanısın (Brick & Fortune Skywork AI Orchestrator).
Konuşmalarında ve raporlarında daima bu elit, kurumsal ve güven veren 'Brick & Fortune' tonunu yansıtmalısın.
Daima samimi, son derece saygılı ve profesyonel bir iş dili kullan.`;
    
    return await callSkywork(cleanedMessage, systemInstruction);
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      tools: [{
        functionDeclarations: [
          marketResearchTool,
          socialMediaTool,
          emailCalendarTool,
          presentationTool,
          webUpdateTool,
          notebookLMTool,
          tasksTool
        ]
      }],
      systemInstruction: `Sen Brick & Fortune firmasının kurucusu Serhat Saatcı Bey'in tüm işlerini koordine eden, Londra Zone 1 prime gayrimenkul ve Knightsbridge emlak piyasasına, Buying Agent (Alıcı Temsilcisi) iş modeline, off-market freehold mülklere tamamen hakim, son derece profesyonel, kibar ve çözüm odaklı Kişisel Yapay Zeka Asistanısın (Brick & Fortune AI Orchestrator).
Kullanıcı seninle Telegram üzerinden konuşuyor.
Sana tanımlanmış özel fonksiyonları (araçları) akıllıca kullanarak Serhat Bey'in taleplerini yerine getirmelisin.
Yatırımcılar genellikle Türk HNWI (yüksek net değerli) profilleridir. Konuşmalarında ve raporlarında daima bu elit, kurumsal ve güven veren 'Brick & Fortune' tonunu yansıtmalısın.
Eğer bir aracı çağırırsan, o aracın çıktısını alıp Serhat Bey'e Türkçe dilinde, çok profesyonel, anlaşılır ve emojilerle zenginleştirilmiş güzel bir özet sunmalısın.
Daima samimi, son derece saygılı ve profesyonel bir iş dili kullan.
Bugünün tarihi ve saati: ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/London" })} (Londra Saat Dilimi). Bu bilgiyi takvim etkinlikleri oluştururken tarihleri ISO 8601 formatına dönüştürmek için referans al.`
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(userMessage);
    const response = result.response;
    
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const toolName = call.name;
      const toolArgs = call.args;
      
      const handler = toolHandlers[toolName];
      if (handler) {
        // Execute the chosen tool
        const toolResult = await handler(toolArgs);
        
        // Send the tool execution result back to Gemini so it can formulate the final human friendly answer
        const followUp = await chat.sendMessage([
          {
            functionResponse: {
              name: toolName,
              response: toolResult
            }
          }
        ]);
        
        return followUp.response.text();
      } else {
        return `Uf, "${toolName}" adında bir aracı çalıştırmaya çalıştım ama bu aracın motorunu henüz tamamlamamışım!`;
      }
    }
    
    // If no function was called, just return the direct chat response
    return response.text();
  } catch (error: any) {
    console.error("Orchestrator error:", error);
    return `Mesajınızı işlerken bir hata oluştu: ${error?.message || error}`;
  }
}
