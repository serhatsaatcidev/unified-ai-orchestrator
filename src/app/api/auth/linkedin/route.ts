import { NextRequest, NextResponse } from "next/server";

/**
 * Initiates the LinkedIn 3-Legged OAuth Flow.
 * Redirects the developer/user to LinkedIn's official approval dialog.
 */
export async function GET(req: NextRequest) {
  const client_id = process.env.LINKEDIN_CLIENT_ID;
  const host = req.headers.get("host") || "";
  const protocol = req.headers.get("x-forwarded-proto") || "https";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

  if (!client_id) {
    return NextResponse.json({
      success: false,
      error: "Vercel üzerinde 'LINKEDIN_CLIENT_ID' bulunamadı. Lütfen önce bu çevre değişkenini Vercel'e ekleyin."
    }, { status: 400 });
  }

  const redirect_uri = `${siteUrl}/api/auth/linkedin/callback`;
  
  // Scopes requested: only w_member_social (sharing posts) since openid is not authorized by default
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=w_member_social`;
  
  return NextResponse.redirect(authUrl);
}
