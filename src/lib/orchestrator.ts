import { GoogleGenerativeAI, FunctionDeclaration, SchemaType } from "@google/generative-ai";

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
      details: { type: SchemaType.STRING, description: "Context details (e.g., recipient email, meeting title, date/time)." }
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

// Tool implementations (Mocking the dynamic results for our PoC with London/UK Context)
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  performMarketResearch: async ({ location, query, propertyType }) => {
    console.log(`[Tool Call] performMarketResearch in London/${location}: ${query}`);
    
    // Simulate UK web searching / scraping and returning rich London market data
    const loc = location || "London";
    const isPrime = loc.toLowerCase().includes("kensington") || loc.toLowerCase().includes("chelsea") || loc.toLowerCase().includes("richmond");
    
    return {
      status: "success",
      location: loc,
      summary: `🇬🇧 *London - ${loc}* bölgesi için yapılan güncel gayrimenkul analiz sonuçları:`,
      averagePrice: isPrime ? "£850,000 - £1,500,000" : "£450,000 - £750,000",
      listingsFound: [
        { title: "Stunning 2 Bed Apartment with River Views", price: "£675,000", size: "82 m² (880 sq ft)", source: "rightmove.co.uk" },
        { title: "Modern 1 Bed Flat near Tube Station", price: "£425,000", size: "55 m² (590 sq ft)", source: "zoopla.co.uk" },
        { title: "Beautiful 3 Bed Terrace House in Commuter Zone", price: "£895,000", size: "115 m² (1,230 sq ft)", source: "rightmove.co.uk" }
      ],
      marketTrend: "Londra genelinde Zone 2 ve Zone 3 banliyö hatlarında kiralama talebi çok güçlü seyrediyor. Ortalama kira getirileri (yield) %4.8 - %5.9 arasında.",
      insights: "İngiltere'deki güncel mortgage (konut kredisi) faiz oranları dengelenirken, nakit alıcılar ve kurumsal yatırımcılar Rightmove/Zoopla üzerinde aktif kalmaya devam ediyor. Alırken pazarlık payı Zone 3 dışı bölgelerde %3-5 seviyesinde."
    };
  },

  generateSocialMediaContent: async ({ platform, topic, tone }) => {
    console.log(`[Tool Call] generateSocialMediaContent for ${platform} on topic: ${topic}`);
    
    const hashtags = platform === "linkedin" 
      ? "\n\n#LondonProperty #UKRealEstate #PropertyInvestment #Rightmove #Zoopla #UKFinance"
      : "\n\n#london #londonrealestate #ukproperty #flatforrent #luxuryhomes #investinlondon";

    const content = platform === "linkedin"
      ? `📈 **London Property Market: Why Commuter Zones Are Outperforming Prime Central London**\n\nHaving analyzed the UK real estate dynamics for the past few quarters, one trend stands out clearly: Zone 3 and commuter belt properties are outperforming Prime Central London in terms of rental yields and capital growth.\n\nHere are 3 reasons why buy-to-let investors are shifting their capital outside Zone 1:\n\n1️⃣ **The Hybrid Work Effect:** Professionals are willing to travel 30-40 mins if they get a home office and private green space for their money.\n2️⃣ **Rental Yield Resilience:** Outer zones offer 5.5% - 6.2% gross yields, compared to a mere 3% in Kensington or Chelsea.\n3️⃣ **Regeneration Projects:** Areas like Wembley, Croydon, and Stratford continue to benefit from multi-billion pound infrastructure injections.\n\nAre you looking to expand your portfolio in London this year? What zones are on your radar? Let's discuss in the comments! 👇${hashtags}`
      : `🏡 **Thinking of buying a flat in London? Avoid these 3 mistakes!**\n\nNavigating the UK property market can be tricky. Here is what to watch out for:\n\n❌ **1. Overlooking Service Charges & Ground Rent:** In leasehold flats, these can eat up your yields.\n❌ **2. Ignoring the Council Tax band:** Make sure you calculate the exact monthly holding costs.\n❌ **3. Commute distance vs. Tube line reliability:** Always check the Elizabeth Line or Overground connections!\n\n💡 Drop me a DM for direct listings and custom portfolio analysis in London! ✨${hashtags}`;

    return {
      status: "success",
      platform,
      tone,
      generatedContent: content
    };
  },

  manageEmailsAndCalendar: async ({ action, details }) => {
    console.log(`[Tool Call] manageEmailsAndCalendar: ${action}`);
    
    if (action === "list_emails") {
      return {
        status: "success",
        emails: [
          { from: "James Smith (UK Investor)", subject: "London buy-to-let portfolio proposal", date: "Today, 10:30", summary: "Richmond ve Greenwich bölgelerindeki portföy teklifini revize etmek istiyor, sizinle yüz yüze görüşmek üzere randevu talep ediyor." },
          { from: "Sarah Jenkins (Dexters Estate Agents)", subject: "New property listings in Richmond", date: "Yesterday, 17:15", summary: "Richmond nehir kenarında acil satılık 2 dairenin Rightmove linklerini ve tapu durum bilgilerini paylaştı." }
        ]
      };
    } else if (action === "list_calendar") {
      return {
        status: "success",
        events: [
          { title: "Meeting with James Smith (Investor)", time: "Tomorrow, 14:00 - 15:00", location: "Richmond Riverside Cafe" },
          { title: "Weekly Portfolio Review with UK Team", time: "Wednesday, 10:00 - 11:00", location: "Zoom / London Office" }
        ]
      };
    } else if (action === "schedule_event") {
      return {
        status: "success",
        message: `Takviminize (Londra GMT/BST Saat Dilimine göre) başarıyla eklendi: "${details}".`
      };
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
backgroundColor: #121214
color: #f3f4f6
---

# ${topic}
### London Real Estate Investment Opportunities
Prepared by: Your AI Personal Orchestrator
Target Audience: ${audience}

---

## 1. Executive Summary & UK Macro Outlook
- Current UK inflation, interest rates, and property trends.
- London's status as a global financial and real estate hub.
- Why buy-to-let remains resilient despite regulatory shifts.

---

## 2. Top Performing London Boroughs (Zone 2-4)
- Richmond upon Thames vs. Greenwich rental yields.
- Capital appreciation trends in Wembley and Hackney.
- Commuter belt connectivity (Elizabeth Line impacts).

---

## 3. Financial Analysis & Yield Modeling
- Average purchase price vs. rental income modeling in GBP.
- Impact of Service Charges, Ground Rent, and Stamp Duty Land Tax (SDLT).
- Net yields (target 5.5%+) comparison sheet.

---

## 4. Investment Execution Roadmap
- Identifying off-market deals through local agent relationships.
- Legal conveyancing steps in England & Wales.
- Next 30 days action plan. Thank you! Q&A.
`;

    return {
      status: "success",
      topic,
      slideCount: count,
      marpMarkdown: slides,
      instructions: "Yukarıdaki metni kopyalayıp bir `.md` dosyasına yapıştırarak VS Code Marp eklentisiyle anında şık sunumlara dönüştürebilirsiniz."
    };
  },

  updateWebsiteContent: async ({ page, title, contentBody }) => {
    console.log(`[Tool Call] updateWebsiteContent on page "${page}": ${title}`);
    
    return {
      status: "success",
      page,
      title,
      deploymentUrl: "https://unified-ai-orchestrator.vercel.app/blog/london-market-update-2026",
      message: `İçerik başarıyla "${page}" sayfasına taslak olarak eklendi. Vercel webhook tetiklendi ve site yeniden derleniyor.`
    };
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
          webUpdateTool
        ]
      }],
      systemInstruction: `Sen kullanıcının tüm işlerini koordine eden, son derece yetenekli, kibar, çözüm odaklı bir Kişisel Yapay Zeka Asistanısın (Orkestratör). 
Kullanıcı seninle Telegram üzerinden konuşuyor.
Sana tanımlanmış özel fonksiyonları (araçları) akıllıca kullanarak kullanıcının taleplerini yerine getirmelisin. 
Eğer bir aracı çağırırsan, o aracın çıktısını alıp kullanıcıya Türkçe dilinde, profesyonel, anlaşılır ve emojilerle zenginleştirilmiş güzel bir özet sunmalısın.
Daima samimi, yardımcı ve profesyonel bir dil kullan.`
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
