import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col items-center justify-between p-6 md:p-24 selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-900/15 blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="w-full max-w-5xl flex items-center justify-between z-10 mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/20">
            Ω
          </div>
          <span className="font-semibold tracking-wider text-slate-200">ORCHESTRATOR AI</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium tracking-wide uppercase">Vercel Ready</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full max-w-5xl flex flex-col items-center text-center z-10 mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 backdrop-blur-sm animate-fade-in">
          ✨ Tüm Uygulamalarınız Tek Bir Noktada Birleşti
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-400 mb-6 leading-tight">
          Tek Muhatap. <br className="hidden md:inline"/>Sınırsız Otomasyon.
        </h1>
        
        <p className="text-slate-400 text-lg max-w-2xl mb-8 leading-relaxed">
          Tüm işlerinizi Telegram üzerinden tek bir yapay zeka ile konuşarak koordine edin. 
          Piyasa analizinden sosyal medyaya, e-postalardan sunumlara kadar her şey arka planda konuşsun, maliyetiniz kuruşlara düşsün.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="https://t.me/BotFather"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-medium shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] duration-200"
          >
            Telegram Botunu Oluştur
          </a>
          <a
            href="#kurulum"
            className="px-8 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 text-slate-300 font-medium transition-all duration-200"
          >
            Kurulum Adımları
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 z-10 mb-20">
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-indigo-500/20 transition-all duration-300 group backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 flex items-center justify-center text-indigo-400 text-xl mb-4 group-hover:scale-110 transition-transform">
            💬
          </div>
          <h3 className="font-semibold text-lg text-slate-200 mb-2">Telegram Arayüzü</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Dışarıdayken sesli mesaj, görsel veya metin gönderin. Önemli mailleri özetletin, takvimi güncelletin.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-indigo-500/20 transition-all duration-300 group backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 flex items-center justify-center text-indigo-400 text-xl mb-4 group-hover:scale-110 transition-transform">
            📈
          </div>
          <h3 className="font-semibold text-lg text-slate-200 mb-2">Piyasa & Emlak Analizi</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Belirlediğiniz lokasyonlarda anlık fiyat analizi ve emlak taraması yapın. Raporları anında teslim alın.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-indigo-500/20 transition-all duration-300 group backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 flex items-center justify-center text-indigo-400 text-xl mb-4 group-hover:scale-110 transition-transform">
            ✍️
          </div>
          <h3 className="font-semibold text-lg text-slate-200 mb-2">Sosyal Medya Yönetimi</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            LinkedIn ve Instagram için gönderiler hazırlayın, etiketleri belirleyin ve tek bir kelimenizle doğrudan paylaşın.
          </p>
        </div>

        {/* Card 4 */}
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-indigo-500/20 transition-all duration-300 group backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 flex items-center justify-center text-indigo-400 text-xl mb-4 group-hover:scale-110 transition-transform">
            📅
          </div>
          <h3 className="font-semibold text-lg text-slate-200 mb-2">Mail & Takvim Takibi</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Kritik e-postaları filtreleyin, taslak cevaplar hazırlayın. Randevularınızı sesle yönetip takvime işleyin.
          </p>
        </div>

        {/* Card 5 */}
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-indigo-500/20 transition-all duration-300 group backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 flex items-center justify-center text-indigo-400 text-xl mb-4 group-hover:scale-110 transition-transform">
            📊
          </div>
          <h3 className="font-semibold text-lg text-slate-200 mb-2">Anında Sunum Taslakları</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Marp Markdown formatında, slayt slayt hazır sunum içerikleri oluşturun. Sunumlarınızı saniyeler içinde tamamlayın.
          </p>
        </div>

        {/* Card 6 */}
        <div className="p-6 rounded-2xl bg-slate-950/40 border border-slate-900 hover:border-indigo-500/20 transition-all duration-300 group backdrop-blur-md">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/60 flex items-center justify-center text-indigo-400 text-xl mb-4 group-hover:scale-110 transition-transform">
            🌐
          </div>
          <h3 className="font-semibold text-lg text-slate-200 mb-2">Web Sitesi Entegrasyonu</h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            WordPress veya statik Vercel siteleriniz için yeni ilanları, blog yazılarını doğrudan bota yazdırıp yayınlayın.
          </p>
        </div>
      </section>

      {/* Setup Guide Section */}
      <section id="kurulum" className="w-full max-w-3xl z-10 p-8 rounded-3xl bg-slate-950/60 border border-slate-900 backdrop-blur-lg mb-12">
        <h2 className="text-2xl font-bold text-slate-200 mb-6 flex items-center gap-3">
          🚀 5 Dakikada Hızlı Kurulum Rehberi
        </h2>
        
        <div className="space-y-6 text-sm text-slate-400">
          <div className="flex gap-4">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-semibold flex-shrink-0">1</span>
            <div>
              <h4 className="font-semibold text-slate-300 mb-1">Projeyi Kendi GitHub Hesabınıza Aktarın</h4>
              <p>Bu projeyi GitHub üzerinde yeni bir repo oluşturarak yükleyin.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-semibold flex-shrink-0">2</span>
            <div>
              <h4 className="font-semibold text-slate-300 mb-1">Telegram Botunu Oluşturun</h4>
              <p>Telegram'da <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">@BotFather</a> hesabına gidin, <code>/newbot</code> yazın ve botunuza bir isim vererek size verilen <b>HTTP API Token</b>'ı kopyalayın.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-semibold flex-shrink-0">3</span>
            <div>
              <h4 className="font-semibold text-slate-300 mb-1">Gemini API Key Edinin</h4>
              <p>Google AI Studio'ya gidin ve tamamen ücretsiz, kullandıkça ödeyen bir <b>Gemini API Key</b> oluşturup kopyalayın.</p>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-semibold flex-shrink-0">4</span>
            <div>
              <h4 className="font-semibold text-slate-300 mb-1">Vercel'e Dağıtın (Deploy)</h4>
              <p>Vercel'e gidin, GitHub reposunu ekleyin ve aşağıdaki Çevre Değişkenlerini (Environment Variables) girin:</p>
              <div className="mt-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 space-y-1">
                <div>TELEGRAM_BOT_TOKEN = (BotFather'dan aldığınız token)</div>
                <div>GEMINI_API_KEY = (Google AI Studio key)</div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <span className="w-6 h-6 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-semibold flex-shrink-0">5</span>
            <div>
              <h4 className="font-semibold text-slate-300 mb-1">Webhook'u Aktif Edin</h4>
              <p>Dağıtım bittikten sonra tarayıcınızda <code>https://projeniz.vercel.app/api/register</code> adresini ziyaret edin. <b>"Telegram Webhook successfully registered!"</b> onayını gördükten sonra artık botunuzla Telegram'dan konuşmaya başlayabilirsiniz!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4 z-10">
        <p>© 2026 Orchestrator AI. Tüm hakları saklıdır. Sunucu maliyeti $0, zeka maliyeti kullandıkça öde.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-slate-300 transition-colors">Kullanım Koşulları</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Gizlilik Politikası</a>
        </div>
      </footer>
    </main>
  );
}
