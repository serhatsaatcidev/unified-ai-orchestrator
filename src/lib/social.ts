/**
 * Social Media Publishing Module (Brick & Fortune)
 * Connects to LinkedIn Share API and Meta Graph API (Instagram Business)
 * for automated multi-channel premium content publishing.
 */

const LINKEDIN_ACCESS_TOKEN = process.env.LINKEDIN_ACCESS_TOKEN;
const LINKEDIN_PERSON_URN = process.env.LINKEDIN_PERSON_URN; // e.g. urn:li:person:12345

const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const INSTAGRAM_BUSINESS_ID = process.env.INSTAGRAM_BUSINESS_ID;

/**
 * Publishes a text/link post directly to LinkedIn
 */
export async function shareOnLinkedIn(content: string): Promise<{ status: string; message: string; shareId?: string }> {
  if (!LINKEDIN_ACCESS_TOKEN || !LINKEDIN_PERSON_URN) {
    console.log("[Mock LinkedIn Share] Publishing post: ", content.substring(0, 100) + "...");
    return {
      status: "success",
      message: "LinkedIn gönderisi (Simüle Modda) başarıyla paylaşıldı. Canlı entegrasyon için LinkedIn Token'ları bekleniyor."
    };
  }

  try {
    const url = "https://api.linkedin.com/v2/ugcPosts";
    
    const requestBody = {
      author: LINKEDIN_PERSON_URN,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: content
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
        "X-Restli-Protocol-Version": "2.0.0"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`LinkedIn API returned status ${response.status}: ${errText}`);
    }

    const data = await response.json();
    return {
      status: "success",
      message: "Gönderi başarıyla canlı LinkedIn hesabınızda paylaşıldı!",
      shareId: data.id
    };
  } catch (error: any) {
    console.error("LinkedIn publish error:", error);
    throw new Error(`LinkedIn paylaşım hatası: ${error?.message || error}`);
  }
}

/**
 * Publishes an image and caption directly to Instagram Business
 */
export async function shareOnInstagram(imageUrl: string, caption: string): Promise<{ status: string; message: string; mediaId?: string }> {
  if (!INSTAGRAM_ACCESS_TOKEN || !INSTAGRAM_BUSINESS_ID) {
    console.log("[Mock Instagram Share] Publishing image post: ", imageUrl);
    return {
      status: "success",
      message: "Instagram gönderisi (Simüle Modda) başarıyla paylaşıldı. Canlı entegrasyon için Instagram/Meta Token'ları bekleniyor."
    };
  }

  try {
    // Step 1: Create media container
    const containerUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_BUSINESS_ID}/media`;
    const containerRes = await fetch(containerUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption: caption,
        access_token: INSTAGRAM_ACCESS_TOKEN
      })
    });

    if (!containerRes.ok) {
      const errText = await containerRes.text();
      throw new Error(`Instagram media container creation failed: ${errText}`);
    }

    const containerData = await containerRes.json();
    const creationId = containerData.id;

    // Step 2: Publish media container
    const publishUrl = `https://graph.facebook.com/v19.0/${INSTAGRAM_BUSINESS_ID}/media_publish`;
    const publishRes = await fetch(publishUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: INSTAGRAM_ACCESS_TOKEN
      })
    });

    if (!publishRes.ok) {
      const errText = await publishRes.text();
      throw new Error(`Instagram publishing failed: ${errText}`);
    }

    const publishData = await publishRes.json();
    return {
      status: "success",
      message: "Görsel gönderisi başarıyla canlı Instagram hesabınızda paylaşıldı!",
      mediaId: publishData.id
    };
  } catch (error: any) {
    console.error("Instagram publish error:", error);
    throw new Error(`Instagram paylaşım hatası: ${error?.message || error}`);
  }
}
