# Brick & Fortune — Google OAuth 2.0 & AI API Entegrasyon Kılavuzu

Bu kılavuz, Vercel'de çalışan Bütünsel Orkestratörünüzün **gerçek Gmail, Google Drive ve Google Business Profile** hesaplarınıza güvenli bir şekilde bağlanabilmesi için gereken adımları içerir. 

---

## 1. Adım: Yapay Zeka Şifrelerini Vercel'e Ekleyin (En Basit Adım)

1. [Anthropic Console](https://console.anthropic.com) adresinden **Claude API Anahtarı** edinin.
2. [Vercel Dashboard](https://vercel.com) -> Projeniz -> **Settings** -> **Environment Variables** sayfasına gidin.
3. Aşağıdaki iki değişkeni ekleyin:
   * **Key:** `ANTHROPIC_API_KEY` | **Value:** (Claude şifreniz)
   * **Key:** `SKYWORK_API_KEY` | **Value:** (Varsa Skywork şifreniz, yoksa boş kalabilir)
4. Kaydedin.

---

## 2. Adım: Google Cloud Projesi Oluşturun

1. [Google Cloud Console](https://console.cloud.google.com) adresine gidin.
2. En üst barın solundaki proje seçiciye tıklayıp **"New Project"** (Yeni Proje) butonuna basın.
3. Proje adını `Brick and Fortune Orchestrator` yapın ve **Create** (Oluştur) butonuna tıklayın.
4. Projenin oluşturulması tamamlanınca en üst bardan yeni projenizi seçtiğinizden emin olun.

---

## 3. Adım: Google API'lerini Etkinleştirin

Yapay zekanın erişeceği Google servislerini projemize tanımlamalıyız:

1. Cloud Console'da sol üstteki menüden **"APIs & Services"** -> **"Library"** (Kütüphane) seçeneğine gidin.
2. Arama çubuğuna **"Gmail API"** yazın, çıkan sonuca tıklayıp **"Enable"** (Etkinleştir) butonuna basın.
3. Tekrar Kütüphane'ye dönüp **"Google Drive API"** aratın ve onu da **"Enable"** yapın.
4. *(İsteğe Bağlı Yerel SEO İçin)* Kütüphane'de **"My Business Business Information API"** aratın ve onu da **"Enable"** yapın.

---

## 4. Adım: OAuth İzin Ekranını (Consent Screen) Yapılandırın

Kendi Google hesabımıza güvenli erişim izni vermek için bir onay ekranı oluşturmalıyız:

1. Cloud Console sol menüsünden **"OAuth consent screen"** (OAuth izin ekranı) sayfasına gidin.
2. **User Type** olarak **"External"** (Harici) seçeneğini işaretleyip **Create** deyin.
3. Gelen formda zorunlu alanları doldurun:
   * **App name:** `Brick & Fortune Orchestrator`
   * **User support email:** Kendi e-postanız.
   * **Developer contact information:** Kendi e-postanız.
4. **Save and Continue** diyerek ilerleyin.
5. **Scopes** (Kapsamlar) adımını dokunmadan **Save and Continue** ile geçin.
6. **Test Users** (Test Kullanıcıları) adımına gelin. **ÇOK ÖNEMLİ:** Burada **"ADD USERS"** butonuna basarak **kendi kişisel Gmail adresinizi** (yani botun bağlanmasını istediğiniz Gmail hesabını) test kullanıcısı olarak ekleyin.
7. Kaydedip izin ekranı kurulumunu tamamlayın.

---

## 5. Adım: Kimlik Bilgilerini (Client ID & Client Secret) Oluşturun

1. Sol menüden **"Credentials"** (Kimlik Bilgileri) sayfasına gidin.
2. En üstteki **"+ Create Credentials"** butonuna basıp **"OAuth client ID"** seçeneğini seçin.
3. **Application type** kısmını **"Web application"** (Web uygulaması) yapın.
4. **Name** kısmına `Orchestrator Web Client` yazın.
5. **Authorized redirect URIs** (Yetkilendirilmiş yönlendirme URI'leri) kısmına gelin ve **"ADD URI"** butonuna basarak **tam olarak şu adresi** yapıştırın:
   `https://developers.google.com/oauthplayground`
   *(Bu adres, Google'ın resmi test aracıdır ve şifreyi güvenli bir şekilde almamızı sağlayacaktır).*
6. **Create** butonuna basın.
7. Ekranınızda **Client ID** ve **Client Secret** şifreleri belirecektir. Bunları kopyalayıp güvenli bir yere (örneğin `.env.local` dosyanıza) not edin.

---

## 6. Adım: Ömürlük "Refresh Token" Elde Edin (Google OAuth Playground ile)

Google güvenlik protokolleri gereği normal şifreler 1 saatte geçerliliğini yitirir. Vercel'in 7/24 kesintisiz çalışabilmesi için asla süresi bitmeyen bir **Refresh Token** almalıyız:

1. Tarayıcınızda [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground) adresini açın.
2. Sağ üst köşedeki **Çark (Ayarlar)** simgesine tıklayın.
3. Açılan küçük menüde en altta yer alan **"Use your own OAuth credentials"** (Kendi kimlik bilgilerinizi kullanın) kutucuğunu işaretleyin.
4. Altına 5. Adımda aldığınız **OAuth Client ID** ve **OAuth Client Secret** değerlerini yapıştırın. **Close** diyerek ayarları kapatın.
5. Ekranın sol tarafındaki listeden (Step 1) şu izinleri bulun ve kutucuklarını işaretleyin:
   * **Gmail API v1:** `https://mail.google.com/` (tüm Gmail yetkisi)
   * **Drive API v3:** `https://www.googleapis.com/auth/drive` (tüm Drive yetkisi)
   * *(İsteğe Bağlı)* **My Business Business Information API v1:** İlgili izin kutucuğunu bulun.
6. Altındaki mavi **"Authorize APIs"** butonuna tıklayın.
7. Google sizi hesap seçme ekranına yönlendirecektir. Burada test kullanıcısı olarak eklediğiniz **kendi kişisel Gmail hesabınızı** seçin.
8. Gelen uyarı ekranında *"Gelişmiş"* -> *"Güvenli olmayan sayfaya git (Brick & Fortune)"* seçeneğini seçerek onay verin.
9. İzinleri onayladıktan sonra tekrar OAuth Playground sayfasına geri döneceksiniz.
10. Sol tarafta **Step 2** adımında **"Exchange authorization code for tokens"** butonuna tıklayın.
11. Alt tarafta **"Refresh Token"** satırı belirecektir! Bu uzun kodu kopyalayın.

---

## 7. Adım: Tüm Anahtarları Vercel'e Girin ve Canlıya Alın

Artık elinizdeki tüm anahtarları Vercel'e ekleyip sistemi çalıştırabiliriz:

1. [Vercel Dashboard](https://vercel.com) -> Projeniz -> **Settings** -> **Environment Variables** sayfasına gidin.
2. Sırasıyla şu 3 yeni değişkeni ekleyin:
   * **Key:** `GOOGLE_CLIENT_ID` | **Value:** (5. Adımdaki Client ID)
   * **Key:** `GOOGLE_CLIENT_SECRET` | **Value:** (5. Adımdaki Client Secret)
   * **Key:** `GOOGLE_REFRESH_TOKEN` | **Value:** (6. Adımdaki Refresh Token)
3. Kaydedin.
4. Son olarak üstteki **Deployments** sekmesine gidin, en son derlememizin sağındaki üç noktaya tıklayıp **"Redeploy"** seçeneğini seçin.

**Tebrikler!** Sisteminiz artık tamamen entegre oldu. Telegram botunuza gidip *"Maillerimi oku"* veya *"Şu sunumu Drive'a kaydet"* diyerek gerçek dünya bağlantılarını deneyimleyebilirsiniz!
