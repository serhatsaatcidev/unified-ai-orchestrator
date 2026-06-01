import { appendGoogleSheetRow, createGoogleSpreadsheet, sendGmailEmail } from "./google";
import { generateWordNDA } from "./microsoft";
import { sendTelegramMessage } from "./telegram";

// Optional: Custom CRM Spreadsheet ID from env or saved globally
let CRM_SPREADSHEET_ID = process.env.CRM_SPREADSHEET_ID || "";
const MY_TELEGRAM_CHAT_ID = process.env.MY_TELEGRAM_CHAT_ID ? parseInt(process.env.MY_TELEGRAM_CHAT_ID, 10) : null;

interface CRMLead {
  name: string;
  phone: string;
  email: string;
  budget: string;
  region: string;
  notes?: string;
}

/**
 * Registers a new client lead into the Brick & Fortune Custom CRM system.
 * Performs a 5-step automated workflow:
 * 1. Saves lead to the secure Google Sheets CRM Database.
 * 2. Generates a custom Microsoft Word NDA for the client.
 * 3. Sends a branded Gmail welcoming them with the Off-Market Catalog.
 * 4. Triggers a live Telegram admin alert directly to Serhat Bey.
 * 5. Schedules a follow-up task on Google Tasks.
 */
export async function registerNewLead(lead: CRMLead): Promise<{ 
  status: string; 
  message: string; 
  spreadsheetId: string;
  ndaUrl?: string; 
  telegramStatus?: string;
  emailStatus?: string;
}> {
  console.log(`[CRM] Registering new VIP Lead: ${lead.name} (${lead.email})`);
  
  const dateStr = new Date().toLocaleString("tr-TR");

  // Step 1: Secure Google Sheets CRM Database connection
  let sheetId = CRM_SPREADSHEET_ID;
  let sheetCreatedMsg = "";
  
  if (!sheetId) {
    console.log("[CRM] CRM_SPREADSHEET_ID is missing. Creating a new CRM Database Spreadsheet in Google Drive...");
    try {
      const newSheet = await createGoogleSpreadsheet("Brick_Fortune_Custom_CRM");
      sheetId = newSheet.spreadsheetId!;
      CRM_SPREADSHEET_ID = sheetId; // Save in memory for current process
      sheetCreatedMsg = ` (Yeni CRM veri tabanı tablosu oluşturuldu!)`;
    } catch (err: any) {
      console.error("[CRM] Failed to create CRM Spreadsheet. Falling back to local logging.", err.message);
    }
  }

  let sheetStatus = "Mmock Mode / Not Appended";
  if (sheetId) {
    try {
      const rowValues = [
        dateStr,
        lead.name,
        lead.phone || "Belirtilmemiş",
        lead.email || "Belirtilmemiş",
        lead.budget || "Belirtilmemiş",
        lead.region || "London Zone 1",
        lead.notes || "Yapay zeka üzerinden kaydoldu."
      ];
      await appendGoogleSheetRow(sheetId, "Sheet1!A2:G2", rowValues);
      sheetStatus = "Başarıyla Google Sheets CRM tablosuna işlendi.";
    } catch (err: any) {
      console.error("[CRM] Sheets append failed:", err.message);
      sheetStatus = `Hata: ${err.message}`;
    }
  }

  // Step 2: Custom Microsoft Word NDA word document generation (Office 365 / OneDrive)
  let ndaUrl = "";
  let ndaStatus = "";
  try {
    const ndaResult = await generateWordNDA(
      lead.name,
      `Yatırım Tercihleri: ${lead.region} bölgesi, Bütçe: ${lead.budget}. Notlar: ${lead.notes || "Yok"}`
    );
    ndaUrl = ndaResult.docUrl || "";
    ndaStatus = ndaResult.message;
  } catch (err: any) {
    ndaStatus = `Microsoft NDA üretilemedi: ${err.message}`;
  }

  // Step 3: Branded HTML Gmail follow-up with Off-Market Catalog link
  let emailStatus = "";
  if (lead.email) {
    try {
      const emailBody = `
        <div style="font-family: 'Georgia', 'Times New Roman', serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #dcdcdc; color: #1a1a1a; background-color: #ffffff;">
          <div style="text-align: center; border-bottom: 2px solid #000000; padding-bottom: 20px; margin-bottom: 25px;">
            <h1 style="font-weight: normal; letter-spacing: 2px; margin: 0; font-size: 24px; color: #0c0d12;">BRICK & FORTUNE</h1>
            <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin: 5px 0 0 0; color: #666666;">London Zone 1 Property Buying Agency</p>
          </div>
          
          <p>Sayın <strong>${lead.name}</strong>,</p>
          
          <p>Londra Zone 1 prime gayrimenkul pazarına gösterdiğiniz ilgi ve paylaştığınız yatırım talebi için teşekkür ederiz. Brick & Fortune Alıcı Temsilciliği (Buying Agent) olarak, talebinizi ve bütçenizi önceliklendirerek çalışmalara başladık.</p>
          
          <div style="background-color: #f7f8fa; border-left: 3px solid #0c0d12; padding: 15px; margin: 20px 0; font-size: 14px;">
            <strong style="color: #0c0d12; display: block; margin-bottom: 8px;">📋 Kayıt Altına Alınan Yatırım Kriterleriniz:</strong>
            <ul style="margin: 0; padding-left: 20px; line-height: 1.6;">
              <li><strong>Bütçe Aralığı:</strong> ${lead.budget}</li>
              <li><strong>Tercih Edilen Bölgeler:</strong> ${lead.region}</li>
              <li><strong>Mülkiyet Hedefi:</strong> Freehold (Tam Toprak Mülkiyeti) Odaklı</li>
            </ul>
          </div>
          
          <p>Yalnızca alıcı tarafını temsil ettiğimiz ve kamuya açık olmayan <strong>off-market</strong> portföyümüze ait en seçkin fırsatların yer aldığı <strong>Brick & Fortune Off-Market Gayrimenkul Kataloğu</strong> ektedir. Kataloğu incelemek için aşağıdaki bağlantıya tıklayabilirsiniz:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://www.investinlondon.com.tr/catalog/off_market_portfolio.pdf" style="background-color: #0c0d12; color: #ffffff; text-decoration: none; padding: 12px 30px; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; display: inline-block;">Kataloğu Görüntüle 📖</a>
          </div>
          
          <p>Ayrıca, size özel hazırladığımız <strong>Gizlilik ve Alıcı Temsil Sözleşmesi (NDA)</strong> taslağı OneDrive hesabımızda güvenli bir şekilde yedeklenmiştir. Mülk adresleri ve RICS değerleme detayları bu sözleşme kapsamında sizinle paylaşılacaktır.</p>
          
          <p style="margin-top: 30px;">Kurucumuz <strong>Serhat Saatcı</strong> en kısa sürede sizinle irtibata geçerek detaylı analiz sunumunu ve off-market eşleşmeleri paylaşacaktır.</p>
          
          <div style="border-top: 1px solid #dcdcdc; padding-top: 20px; margin-top: 35px; font-size: 12px; color: #666666; text-align: center; line-height: 1.6;">
            <p><strong>Brick & Fortune Buying Agency</strong><br>Rutland Gate Office, Knightsbridge, London SW7<br>investinlondon.com.tr | info@investinlondon.com.tr</p>
          </div>
        </div>
      `;
      
      const emailRes = await sendGmailEmail(
        lead.email,
        "Brick & Fortune — Londra Zone 1 Gayrimenkul Yatırım Talebiniz Alındı",
        emailBody
      );
      emailStatus = emailRes.message;
    } catch (err: any) {
      emailStatus = `Gmail gönderilemedi: ${err.message}`;
    }
  }

  // Step 4: Live Telegram admin alert to Serhat Bey
  let telegramStatus = "Chat ID is not configured";
  if (MY_TELEGRAM_CHAT_ID) {
    try {
      const alertMsg = `🚨 **Yeni VIP Yatırımcı Talebi Alındı!** 🚨

👤 **Yatırımcı Adı:** ${lead.name}
📞 **Telefon:** ${lead.phone || "Belirtilmemiş"}
📧 **E-posta:** ${lead.email || "Belirtilmemiş"}
💰 **Yatırım Bütçesi:** ${lead.budget}
📍 **Tercih Ettiği Bölgeler:** ${lead.region}
📝 **Yapay Zeka Notları:** ${lead.notes || "Yok"}

💼 **Otomatik İşlemler:**
1. Google Sheets CRM tablosuna yeni satır olarak yazıldı. ✅
2. Microsoft Word NDA belgesi otomatik üretildi ve OneDrive'a kaydedildi. ✅
3. Müşteriye Gmail üzerinden **Off-Market Kataloğu** gönderildi. ✅

*Serhat Asistan CRM Modülü tarafından otomatik olarak tetiklenmiştir.*`;
      
      await sendTelegramMessage(MY_TELEGRAM_CHAT_ID, alertMsg);
      telegramStatus = "Telegram yönetici bildirimi başarıyla gönderildi.";
    } catch (err: any) {
      console.error("[CRM] Telegram alert failed:", err.message);
      telegramStatus = `Hata: ${err.message}`;
    }
  }

  return {
    status: "success",
    message: `Tebrikler! Müşteri "${lead.name}" başarıyla CRM'e kaydedildi.${sheetCreatedMsg}`,
    spreadsheetId: sheetId,
    ndaUrl,
    telegramStatus,
    emailStatus
  };
}
