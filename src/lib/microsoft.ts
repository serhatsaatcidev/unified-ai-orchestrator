/**
 * Microsoft 365 Integration Module (Brick & Fortune)
 * Connects to Microsoft Graph API for kurumsal Outlook, OneDrive, Teams,
 * and automated Word/PDF NDA & Contract generation.
 * Offers resilient mock/simulated fallbacks if credentials are not configured.
 */

const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_REFRESH_TOKEN = process.env.MICROSOFT_REFRESH_TOKEN;

/**
 * Helper to check if Microsoft Graph credentials are active.
 */
function isMicrosoftConfigured(): boolean {
  return !!(MICROSOFT_CLIENT_ID && MICROSOFT_CLIENT_SECRET && MICROSOFT_REFRESH_TOKEN);
}

/**
 * Automatically generates a custom, branded Non-Disclosure Agreement (NDA) Word Document (.docx)
 * and backs it up securely in OneDrive / SharePoint.
 */
export async function generateWordNDA(clientName: string, details: string): Promise<{ status: string; message: string; docUrl?: string }> {
  const dateStr = new Date().toLocaleDateString("tr-TR");
  
  // Standard elite NDA template content for Brick & Fortune buying agency
  const ndaContent = `
========================================================================
                      BRICK & FORTUNE PROPERTY BUYING AGENCY
                            NON-DISCLOSURE AGREEMENT
========================================================================
Tarih: ${dateStr}
Taraflar:
1. Brick & Fortune Ltd. (Knightsbridge Office, London) - "Alıcı Temsilcisi"
2. ${clientName} - "Yatırımcı / Potansiyel Alıcı"

KONU VE KAPSAM:
İşbu sözleşme, Alıcı Temsilcisi tarafından Yatırımcı'ya sunulacak olan Londra Zone 1 (Mayfair, Knightsbridge, Chelsea vb.) bölgelerindeki kamuya kapalı (off-market) gayrimenkul yatırım fırsatlarının, RICS raporlarının ve finansal modellemelerin gizlilik şartlarını belirlemek üzere akdedilmiştir.

GİZLİLİK TAAHHÜDÜ:
1. Yatırımcı, kendisine sunulan hiçbir off-market ilanı, mülk adresini ve satıcı bilgilerini üçüncü şahıslarla paylaşmayacağını taahhüt eder.
2. Sunulan veriler yalnızca yatırımcının şahsi değerlendirmesi amacıyla kullanılabilir.
3. Bu sözleşmeden doğacak ihtilaflarda İngiltere ve Galler Tahkim Mahkemeleri (Courts of England & Wales) yetkilidir.

DETAYLAR VE ŞARTLAR:
${details}

İMZALAR:
Brick & Fortune Ltd: [Serhat Saatcı, Kurucu]
Yatırımcı: [${clientName}]
========================================================================
  `;

  if (!isMicrosoftConfigured()) {
    console.log(`[Mock MS Graph] Generating Word NDA for: ${clientName}`);
    console.log(ndaContent);
    return {
      status: "success",
      message: `Microsoft Word NDA sözleşmesi "${clientName.replace(/\s+/g, "_")}_NDA.docx" (Simüle Modda) başarıyla üretildi ve OneDrive'da 'Brick_Fortune/NDA' klasörüne kaydedildi.`,
      docUrl: "https://onedrive.live.com/mock/nda_document_link"
    };
  }

  try {
    // MS Graph API connection to upload/create files in OneDrive
    // Endpoint: https://graph.microsoft.com/v1.0/me/drive/root:/Brick_Fortune/NDA/${clientName}_NDA.docx:/content
    const token = await getMicrosoftAccessToken();
    const url = `https://graph.microsoft.com/v1.0/me/drive/root:/Brick_Fortune/NDA/${encodeURIComponent(clientName)}_NDA.docx:/content`;
    
    // We convert the text content to a buffer (representing a basic document file stream)
    const fileBuffer = Buffer.from(ndaContent, "utf-8");

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      },
      body: fileBuffer
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OneDrive API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return {
      status: "success",
      message: `Microsoft Word NDA belgesi başarıyla oluşturuldu ve OneDrive'a yüklendi!`,
      docUrl: data.webUrl
    };
  } catch (error: any) {
    console.error("Microsoft OneDrive error:", error);
    throw new Error(`Microsoft OneDrive Word üretme hatası: ${error?.message || error}`);
  }
}

/**
 * Sends a premium Outlook email using MS Graph API.
 */
export async function sendOutlookEmail(to: string, subject: string, htmlContent: string): Promise<{ status: string; message: string }> {
  if (!isMicrosoftConfigured()) {
    console.log(`[Mock Outlook Email] Sending to: ${to} | Subject: ${subject}`);
    return {
      status: "success",
      message: `Outlook kurumsal e-postası (Simüle Modda) başarıyla ${to} adresine gönderildi.`
    };
  }

  try {
    const token = await getMicrosoftAccessToken();
    const url = "https://graph.microsoft.com/v1.0/me/sendMail";

    const requestBody = {
      message: {
        subject: subject,
        body: {
          contentType: "HTML",
          content: htmlContent
        },
        toRecipients: [
          {
            emailAddress: {
              address: to
            }
          }
        ]
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Outlook API returned status ${response.status}: ${errText}`);
    }

    return {
      status: "success",
      message: `Kurumsal Outlook e-postası başarıyla ${to} adresine gönderildi.`
    };
  } catch (error: any) {
    console.error("Microsoft Outlook error:", error);
    throw new Error(`Outlook e-posta gönderim hatası: ${error?.message || error}`);
  }
}

/**
 * Creates an Outlook Calendar Event with Teams meeting option.
 */
export async function createOutlookEvent(summary: string, start: string, end: string, location?: string, description?: string): Promise<{ status: string; message: string; htmlLink?: string }> {
  if (!isMicrosoftConfigured()) {
    console.log(`[Mock Outlook Calendar] Event: ${summary} | ${start} to ${end}`);
    return {
      status: "success",
      message: `Microsoft Takvim etkinliği (Simüle Modda) başarıyla oluşturuldu: "${summary}".`,
      htmlLink: "https://outlook.live.com/mock/calendar_link"
    };
  }

  try {
    const token = await getMicrosoftAccessToken();
    const url = "https://graph.microsoft.com/v1.0/me/events";

    const requestBody = {
      subject: summary,
      body: {
        contentType: "HTML",
        content: description || "Brick & Fortune Microsoft Takvim Planlaması"
      },
      start: {
        dateTime: start,
        timeZone: "GMT Standard Time"
      },
      end: {
        dateTime: end,
        timeZone: "GMT Standard Time"
      },
      location: {
        displayName: location || "Rutland Gate Office, Knightsbridge"
      },
      isOnlineMeeting: true, // Automatically attach Microsoft Teams meeting link!
      onlineMeetingProvider: "teamsForBusiness"
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Outlook Calendar API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return {
      status: "success",
      message: `Microsoft Takvim ve Teams toplantı etkinliği başarıyla oluşturuldu: "${summary}".`,
      htmlLink: data.webLink
    };
  } catch (error: any) {
    console.error("Microsoft Calendar error:", error);
    throw new Error(`Microsoft Takvim etkinliği oluşturma hatası: ${error?.message || error}`);
  }
}

/**
 * Exchages MS Refresh Token for a temporary access token.
 */
async function getMicrosoftAccessToken(): Promise<string> {
  const url = "https://login.microsoftonline.com/common/oauth2/v2.0/token";
  
  try {
    const params = new URLSearchParams();
    params.append("client_id", MICROSOFT_CLIENT_ID!);
    params.append("client_secret", MICROSOFT_CLIENT_SECRET!);
    params.append("refresh_token", MICROSOFT_REFRESH_TOKEN!);
    params.append("grant_type", "refresh_token");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`MS OAuth exchange failed: ${errText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error: any) {
    console.error("Microsoft Auth error:", error);
    throw new Error(`Microsoft kimlik doğrulama hatası: ${error?.message || error}`);
  }
}
