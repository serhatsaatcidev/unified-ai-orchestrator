import { NextRequest, NextResponse } from "next/server";

/**
 * Handles the redirect callback from LinkedIn.
 * Exchanges the code for an Access Token and fetches the user's Person URN,
 * rendering a beautiful interface to copy the final Vercel keys.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const error_description = searchParams.get("error_description");

  if (error) {
    return NextResponse.json({ success: false, error, error_description }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ success: false, error: "Authorization code is missing." }, { status: 400 });
  }

  const client_id = process.env.LINKEDIN_CLIENT_ID;
  const client_secret = process.env.LINKEDIN_CLIENT_SECRET;
  const host = req.headers.get("host") || "";
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  const redirect_uri = `${siteUrl}/api/auth/linkedin/callback`;

  try {
    // 1. Exchange authorization code for Access Token
    const tokenUrl = "https://www.linkedin.com/oauth/v2/accessToken";
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
        client_id: client_id || "",
        client_secret: client_secret || ""
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`LinkedIn token exchange failed: ${errText}`);
    }

    const tokenData = await tokenResponse.json();
    const access_token = tokenData.access_token;

    // 2. Fetch the user's Person URN using OpenID UserInfo
    let personUrn = "";
    let name = "LinkedIn Kullanıcısı";
    let scopeWarning = false;

    try {
      const userinfoUrl = "https://api.linkedin.com/v2/userinfo";
      const userinfoRes = await fetch(userinfoUrl, {
        headers: { "Authorization": `Bearer ${access_token}` }
      });

      if (userinfoRes.ok) {
        const userinfo = await userinfoRes.json();
        personUrn = `urn:li:person:${userinfo.sub}`;
        name = `${userinfo.given_name || ""} ${userinfo.family_name || ""}`.trim() || "Değerli Müşterimiz";
      } else {
        // Fallback to legacy me endpoint
        const meUrl = "https://api.linkedin.com/v2/me";
        const meRes = await fetch(meUrl, {
          headers: { "Authorization": `Bearer ${access_token}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          personUrn = `urn:li:person:${meData.id}`;
          name = `${meData.localizedFirstName} ${meData.localizedLastName}`;
        } else {
          scopeWarning = true;
          personUrn = "urn:li:person:PROFIL_ID_GIRIN";
        }
      }
    } catch (err) {
      scopeWarning = true;
      personUrn = "urn:li:person:PROFIL_ID_GIRIN";
    }

    // 3. Render premium dark UI with copier cards
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>LinkedIn Bağlantısı — Brick & Fortune</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            background-color: #0c0d12;
            color: #f3f4f6;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
          }
          .card {
            background: linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.01));
            border: 1px solid rgba(255, 255, 255, 0.08);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
            max-width: 600px;
            width: 90%;
            text-align: center;
          }
          .brand-logo {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
            margin-bottom: 20px;
            color: #0077b5;
          }
          h1 {
            font-size: 22px;
            margin-bottom: 10px;
            color: #ffffff;
          }
          p {
            color: #9ca3af;
            font-size: 14px;
            line-height: 1.6;
            margin-bottom: 30px;
          }
          .block {
            text-align: left;
            margin-top: 24px;
          }
          label {
            display: block;
            font-size: 12px;
            font-weight: bold;
            color: #0077b5;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
          }
          .token-box {
            background: #1e293b;
            border: 1px solid #334155;
            padding: 14px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 13px;
            word-break: break-all;
            color: #38bdf8;
            user-select: all;
            cursor: pointer;
            transition: 0.2s;
          }
          .token-box:hover {
            border-color: #38bdf8;
            background: #0f172a;
          }
          .info-note {
            font-size: 12px;
            color: #6b7280;
            margin-top: 30px;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="brand-logo">Brick & Fortune</div>
          <h1>🎉 LinkedIn Bağlantısı Başarılı!</h1>
          <p>Merhaba <strong>${name}</strong>, Orkestratörünüz için canlı LinkedIn yetkilendirmesi başarıyla tamamlandı. Aşağıdaki iki anahtarı kopyalayarak Vercel Çevre Değişkenleri (Environment Variables) paneline ekleyin:</p>
          
          <div class="block">
            <label>1. LINKEDIN_ACCESS_TOKEN (Kopyalamak için üzerine tıklayın)</label>
            <div class="token-box" onclick="navigator.clipboard.writeText(this.innerText); alert('Kopyalandı!');">${access_token}</div>
          </div>
          
          <div class="block">
            <label>2. LINKEDIN_PERSON_URN (Kopyalamak için üzerine tıklayın)</label>
            <div class="token-box" onclick="navigator.clipboard.writeText(this.innerText); alert('Kopyalandı!');">${personUrn}</div>
            ${scopeWarning ? `<p style="font-size: 11px; color: #f59e0b; margin-top: 6px; text-align: left;">⚠️ <strong>Not:</strong> LinkedIn uygulamanızda profil okuma yetkisi kısıtlı olduğundan yasal kimliğiniz otomatik okunamadı. Vercel'e eklerken <code>PROFIL_ID_GIRIN</code> kısmını silerek yerine kendi LinkedIn profil ID'nizi veya kullanıcı adınızı yazabilirsiniz (Örn: <code>urn:li:person:serhatsaatci</code>).</p>` : ""}
          </div>
          
          <div class="info-note">
            Bu iki şifreyi Vercel Dashboard'da projenizin <strong>Settings -> Environment Variables</strong> kısmına ekleyip kaydettikten sonra <strong>Redeploy</strong> edin. Artık asistanınız doğrudan sizin adınıza LinkedIn'de paylaşım yapmaya başlayacaktır!
          </div>
        </div>
      </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8" }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
