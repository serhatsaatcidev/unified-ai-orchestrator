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

// Tool implementations (Mocking the dynamic results for our PoC)
const toolHandlers: Record<string, (args: any) => Promise<any>> = {
  performMarketResearch: async ({ location, query, propertyType }) => {
    console.log(`[Tool Call] performMarketResearch in ${location}: ${query}`);
    
    // Simulate web searching / scraping and returning rich market data
    return {
      status: "success",
      location,
      summary: `*${location}* bölgesi için yapılan analiz sonuçları:`,
      averagePricePerSqm: location.toLowerCase().includes("kadıköy") ? "85,000 TL - 120,000 TL" : "45,000 TL - 65,000 TL",
      listingsFound: [
        { title: "Caddebostan Sahile Yakın 3+1", price: "24,500,000 TL", size: "135 m²", source: "sahibinden.com" },
        { title: "Moda Caddesinde Yatırımlık 2+1", price: "18,200,000 TL", size: "90 m²", source: "hepsiemlak.com" },
        { title: "Göztepe Parkı Karşısı Lüks 4+1", price: "32,000,000 TL", size: "180 m²", source: "sahibinden.com" }
      ],
      marketTrend: "Son 3 ayda %4.2 artış eğiliminde, talep yüksek seyrediyor. Özellikle sahil şeridinde amortisman süresi 22 yıl civarında.",
      insights: "Fiyatlar yüksek ancak kiralama potansiyeli çok güçlü. Acil satılık ilanlarda %5-8 oranında pazarlık payı bulunuyor."
    };
  },

  generateSocialMediaContent: async ({ platform, topic, tone }) => {
    console.log(`[Tool Call] generateSocialMediaContent for ${platform} on topic: ${topic}`);
    
    const hashtags = platform === "linkedin" 
      ? "\n\n#GayrimenkulYatırımı #EmlakTrendleri #YatırımTavsiyesi #FinansalÖzgürlük"
      : "\n\n#emlak #yatırım #kadıköy #satılıkdaire #gayrimenkul #realestate #luxuryhomes";

    const content = platform === "linkedin"
      ? `📈 **Gayrimenkul Yatırımında Altın Kurallar: Doğru Lokasyon Nasıl Seçilir?**\n\nHerkes gayrimenkulün en güvenli liman olduğunu söyler, peki ama yatırımı kazanca dönüştüren asıl sır nedir? Tabii ki doğru lokasyon analizi!\n\nİşte bir bölgeyi incelerken mutlaka bakmanız gereken 3 kritik metrik:\n\n1️⃣ **Ulaşım Yatırımları:** Metro, metrobüs veya yeni açılacak bağlantı yolları bir bölgenin değerini ortalama %25-40 oranında artırır.\n2️⃣ **Amortisman Süresi:** Satın alma bedelinin kira geliriyle kaç yılda geri döneceği (Türkiye ortalaması 18-22 yıl arası mükemmel kabul edilir).\n3️⃣ **Sosyal Altyapı:** Okul, hastane ve park alanlarına yakınlık hem satışı kolaylaştırır hem de elit kiracı profilini çeker.\n\nSiz şu sıralar hangi lokasyonları radarınıza aldınız? Yorumlarda buluşalım! 👇${hashtags}`
      : `🏡 **Yatırım Yaparken Bu 3 Hatadan Kaçının!**\n\nGayrimenkul alırken duygusal davranmak size pahalıya patlayabilir. İşte dikkat etmeniz gerekenler:\n\n❌ **1. Sadece fiyata bakıp altyapıyı es geçmek:** Ucuz daire her zaman iyi yatırım değildir.\n❌ **2. Amortisman süresini hesaplamamak:** Kendi kendini ödemeyen mülk yük olur.\n❌ **3. Bölge trendlerini incelememek:** Gelişme aksının tersinde kalmayın!\n\n💡 Profesyonel analiz ve doğru portföy yönetimi için bana her zaman DM gönderebilirsiniz! ✨${hashtags}`;

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
          { from: "Ahmet Yılmaz (Yatırımcı)", subject: "Caddebostan projesi teklifi hakkında", date: "Bugün, 10:30", summary: "Fiyat teklifini revize etmek istiyor, sizinle görüşmek üzere randevu talep ediyor." },
          { from: "Zeynep Kaya (Emlak Danışmanı)", subject: "Yeni portföy detayları - Moda", date: "Dün, 17:15", summary: "Moda caddesinde acil satılık 2 dairenin fotoğraflarını ve tapu bilgilerini gönderdi." }
        ]
      };
    } else if (action === "list_calendar") {
      return {
        status: "success",
        events: [
          { title: "Ahmet Yılmaz ile Kahve / Sözleşme Görüşmesi", time: "Yarın, 14:00 - 15:00", location: "Caddebostan Starbucks" },
          { title: "Haftalık Portföy Güncelleme Toplantısı", time: "02 Haziran Çarşamba, 10:00 - 11:00", location: "Zoom" }
        ]
      };
    } else if (action === "schedule_event") {
      return {
        status: "success",
        message: `Takviminize başarıyla eklendi: "${details}". Bildirimler aktif edildi.`
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
### Potansiyel Yatırım Fırsatları Raporu
Hazırlayan: AI Kişisel Asistanınız
Hedef Kitle: ${audience}

---

## 1. Giriş ve Pazarın Durumu
- Genel ekonomik göstergeler ve gayrimenkul eğilimi.
- Son 12 ayda değişen faiz ve talep dengeleri.
- Neden gayrimenkul hâlâ en güvenli liman?

---

## 2. Bölgesel Fiyat Analizleri
- Kadıköy ve Beşiktaş sahil şeritleri amortisman oranları.
- Gelişmekte olan banliyö bölgelerindeki getiri potansiyelleri.
- Fiyat/Kazanç (F/K) karşılaştırmalı grafik analizi.

---

## 3. Yatırım Kriterleri ve Filtreler
- Doğru mülk seçiminde 3 altın kural.
- Altyapı ve kentsel dönüşüm fırsatlarını yakalamak.
- Hukuki süreçler ve tapu kontrollerinde dikkat edilmesi gerekenler.

---

## 4. Sonuç ve Eylem Planı
- Kısa vadeli nakit akışı mı, uzun vadeli değer artışı mı?
- Önümüzdeki 30 gün içinde atılması gereken kritik adımlar.
- Teşekkürler! Soru & Cevap.
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
      deploymentUrl: "https://your-app.vercel.app/blog/yeni-makale",
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
      model: "gemini-1.5-flash",
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
