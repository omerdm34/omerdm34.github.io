export type Lang = 'en' | 'tr';

type Row = {
  time: string;
  code: string;
  destination: string;
  org: string;
  gate: string;
  status: string;
  live?: boolean;
  details: string[];
  photo?: 'aselsan' | 'drone-workshop' | 'quadcopter';
  photoAlt?: string;
};

type Project = {
  id: 'signbridge' | 'datathon' | 'teknofest' | 'dcenergy' | 'masal';
  code: string;
  name: string;
  date: string;
  claim: string;
  body: string;
  stack: string;
  link?: { href: string; label: string };
  status: string;
};

const en = {
  htmlLang: 'en',
  title: 'Ömer Faruk Erdem · Software Engineering Student',
  description:
    'Software engineering student who ships end to end: ASELSAN and drone-software internships, on-device ML, Kaggle competitions and live websites.',
  skip: 'Skip to content',
  nav: { departures: 'Departures', projects: 'Projects', beyond: 'Beyond code', contact: 'Contact' },
  langSwitch: { label: 'Türkçe', short: 'TR', href: '/tr/' },
  cv: 'CV',
  cvLong: 'Download CV (PDF)',
  board: {
    heading: 'Departures',
    colTime: 'Time',
    colFlight: 'Flight',
    colDestination: 'Destination',
    colGate: 'Gate',
    colStatus: 'Status',
  },
  hero: {
    first: 'ÖMER FARUK',
    last: 'ERDEM',
    role: 'SOFTWARE ENGINEERING STUDENT',
    lede:
      'I build things end to end, from models that run on a phone to websites their owners update themselves. Fourth-year software engineering student, with internships at ASELSAN and a drone company behind me.',
    nextLabel: 'Next departure',
    next: 'INTERNSHIPS · JUNIOR ROLES',
    nextStatus: 'BOARDING',
    ctaPrimary: 'Get in touch',
    ctaSecondary: 'See the work',
    gate: 'GATE',
    photoAlt: 'Ömer in a hard hat next to an agricultural drone in a workshop',
  },
  intro: {
    boarding: 'Now boarding',
    heading: 'Passenger',
    text: [
      'I like the part of engineering where an idea has to survive contact with reality: a model that has to run on a phone, an assistant that has to pass a security review, a website a preschool publishes its news from every week.',
      'I have interned at ASELSAN and at Mostaş Teknoloji, spent a semester abroad on Erasmus+, and competed as a national taekwondo athlete for thirteen years. The mat taught me more about showing up every day than any course did.',
    ],
    facts: [
      { k: 'Languages', v: 'Turkish (native) · English (B2)' },
      { k: 'Focus', v: 'Applied ML · Mobile · Web systems' },
      { k: 'Looking for', v: 'Internships and junior roles, in Türkiye or abroad' },
    ],
  },
  departures: {
    heading: 'Departures',
    sub: 'Where I have worked and studied, latest first. Open a row for the details.',
    open: 'Details',
    close: 'Close',
    rows: [
      {
        time: 'AUG 2026',
        code: 'ASL 26',
        destination: 'Technology Management & Digital Transformation Intern (REHİS)',
        org: 'ASELSAN',
        gate: 'ANKARA',
        status: 'LANDED',
        photo: 'aselsan',
        photoAlt: 'Ömer standing in front of the ASELSAN sign on campus',
        details: [
          'Took over an internal web application that guides people through long, structured corporate forms: it detects the fields that must be filled, guides entry, reuses earlier answers as suggestions, protects sections that may not change, and recovers sessions.',
          'Rebuilt its AI assistant from scratch after finding the inherited version non-functional and incompatible with corporate information-security policy, and added a local layer that answers repetitive requests without leaving the machine. Responses got noticeably faster.',
          'Added Turkish morphology and synonym handling so different phrasings land on the right field, isolated the AI layer behind a single integration point, and moved the application onto the organization’s internal AI infrastructure.',
          'Proposed and built a second tool for handing projects between interns and engineers: it analyses a project folder, finds the entry point and dependencies, and produces a self-contained package with generated install and run scripts. No third-party dependencies, validated against archived intern projects.',
        ],
      },
      {
        time: 'AUG 2025',
        code: 'MST 25',
        destination: 'Software Engineering Intern · aviation & space technologies',
        org: 'MOSTAŞ TEKNOLOJİ',
        gate: 'İSTANBUL',
        status: 'LANDED',
        photo: 'drone-workshop',
        photoAlt: 'Ömer in a hard hat beside an agricultural spraying drone in the workshop',
        details: [
          'Designed and optimized Unreal Engine 5.2 simulation environments for flight and terrain testing of agricultural drones.',
          'Built an ESP32-C3-Mini based embedded system that measures liquid flow rate and controls the pump.',
          'Developed ground-station interface components in C++ and QML on QGroundControl.',
          'Soldered, cabled and calibrated drone hardware and took part in field flight tests.',
        ],
      },
      {
        time: 'SEP 2025',
        code: 'ERA 25',
        destination: 'Erasmus+ exchange · Informatics',
        org: 'UMFST “GEORGE EMIL PALADE”',
        gate: 'TÂRGU MUREȘ',
        status: 'LANDED',
        details: [
          'Won the Erasmus+ scholarship through written and oral selection exams.',
          'Completed a full semester of informatics courses taught in English, September 2025 to February 2026.',
        ],
      },
      {
        time: 'OCT 2024',
        code: 'FRT 24',
        destination: 'B.Sc. Software Engineering · fourth year',
        org: 'FIRAT UNIVERSITY',
        gate: 'ELAZIĞ',
        status: 'EN ROUTE',
        live: true,
        details: [
          'Coursework in software engineering, data mining, natural language processing, information systems and security, and mobile application development.',
        ],
      },
      {
        time: 'SEP 2023',
        code: 'MTU 23',
        destination: 'B.Sc. Software Engineering · first year',
        org: 'MALATYA TURGUT ÖZAL UNIVERSITY',
        gate: 'MALATYA',
        status: 'TRANSFER',
        details: ['Transferred to Fırat University after the first year based on academic performance.'],
      },
    ] satisfies Row[],
  },
  projects: {
    heading: 'Arrivals',
    sub: 'Things I built that actually landed. Each one comes with its proof.',
    illustrative: 'Illustration of the task, not competition data',
    chartTitle: 'Out-of-fold MSE, lower is better',
    chartBars: ['Predict the mean', 'Ridge', 'Gradient boosting', 'First stack', 'Final stack'],
    items: [
      {
        id: 'signbridge',
        code: 'SBA',
        name: 'SignBridgeAI',
        date: 'SEP 2026',
        claim: 'Reads the ASL alphabet in real time, entirely on the phone.',
        body:
          'An Android app that recognizes sign-language letters from the camera without sending a single frame anywhere, then translates the text with ML Kit. I trained the landmark classifier, fixed recognition for left-handed signers, built the icon, splash and brand palette, and prepared the signed Google Play release.',
        stack: 'Kotlin · Jetpack Compose · MediaPipe · TensorFlow Lite · ML Kit',
        link: { href: 'https://github.com/omerdm34/signbridge-ai', label: 'Source on GitHub' },
        status: 'LANDED',
      },
      {
        id: 'datathon',
        code: 'DTN',
        name: 'Datathon 2026',
        date: 'JUN 2026',
        claim: 'Cut the prediction error from 230 to 77.',
        body:
          'A Kaggle regression competition on career success scores. I combined engineered features with word- and character-level TF-IDF, stacked seven models under a Ridge meta-learner and tuned them with Optuna. I also spotted a time shift between the training and test sets and built a weighted validation scheme that reproduced the leaderboard offline.',
        stack: 'Python · scikit-learn · LightGBM · XGBoost · CatBoost · Optuna',
        link: { href: 'https://github.com/omerdm34/datathon-2026', label: 'Source on GitHub' },
        status: 'LANDED',
      },
      {
        id: 'teknofest',
        code: 'TKF',
        name: 'TEKNOFEST 2026 · Trendyol',
        date: 'JUN 2026',
        claim: 'Matching what people type to the product they mean.',
        body:
          'Team FiraTech, two people and no advisor. I fine-tuned multilingual E5 sentence-embedding models with hard-negative mining for semantic search. Daily leaderboard submissions were limited, so we hand-labeled our own gold set to evaluate offline.',
        stack: 'Python · PyTorch · Sentence Transformers · multilingual E5',
        status: 'LANDED',
      },
      {
        id: 'dcenergy',
        code: 'DCE',
        name: 'DC Energy',
        date: 'AUG 2026',
        claim: 'A live company website the owner edits without touching code.',
        body:
          'Corporate site for an electrical engineering firm, with a password-protected panel for text and images, a contact form that emails the company, rate limiting, SEO, and the domain, DNS and SSL set up end to end.',
        stack: 'Next.js · Cloudflare Workers · R2',
        link: { href: 'https://dcenergy.com.tr', label: 'dcenergy.com.tr' },
        status: 'LIVE',
      },
      {
        id: 'masal',
        code: 'MSL',
        name: 'Masal Bahçesi Preschool',
        date: '2026',
        claim: 'A preschool publishes its own announcements from a phone.',
        body:
          'A fast static site plus a Turkish management panel: a Cloudflare Worker commits through the GitHub API, with HMAC-signed sessions and unit tests. Built for a non-technical owner and used every day.',
        stack: 'Astro · Cloudflare Workers · GitHub API',
        link: { href: 'https://masalbahcesimaras.com', label: 'masalbahcesimaras.com' },
        status: 'LIVE',
      },
    ] satisfies Project[],
    more: {
      heading: 'Also on the board',
      rows: [
        {
          name: 'A Paso Seguro',
          date: '2026',
          text: 'Java/Android app for safer nightlife (UN SDG 11), designed in Figma with an international student team for San Luis Potosí, Mexico.',
        },
      ],
    },
    githubHeading: 'Latest pushes on GitHub',
    githubUpdated: 'updated',
    githubAll: 'All repositories',
  },
  beyond: {
    heading: 'Layover',
    sub: 'The parts of me that do not fit in a commit message.',
    taekwondoTitle: 'National athlete, 13 years',
    taekwondoText:
      'I competed in taekwondo at national level for over a decade, with a national athlete record from the Turkish Taekwondo Federation, and helped train younger athletes and run club competitions.',
    copTitle: 'COP31 volunteer',
    copText:
      'Selected for the volunteer team of the UN Climate Change Conference, working alongside delegations from many countries.',
    droneAlt: 'Ömer holding a self-built quadcopter outdoors',
    travelHeading: 'Recent destinations',
    travel: [
      { code: 'VIE', city: 'Vienna', photo: 'vienna', alt: 'Ömer on a terrace in front of the Vienna State Opera' },
      { code: 'PRG', city: 'Prague', photo: 'prague', alt: 'Ömer on the Vltava riverbank in Prague with the Charles Bridge behind' },
      { code: 'FCO', city: 'Rome', photo: 'rome', alt: 'Ömer in front of the Colosseum in Rome' },
    ],
    certsHeading: 'Certificates',
    certs: [
      { name: 'National Athlete Record · Taekwondo', by: 'Ministry of Youth and Sports', date: '2023', img: 'national-athlete' },
      { name: 'Code Genius', by: 'TalentCoders · participation', date: 'APR 2024', img: 'code-genius' },
      { name: 'Young Executive Academy', by: 'Six-month academy programme', date: '2023–2024', img: 'yea' },
      { name: 'Siber Vatan', by: 'National cybersecurity training programme', date: '' },
    ],
    viewCert: 'View certificate',
  },
  contact: {
    heading: 'Contact',
    lede: 'Have an internship, a role or a project in mind? Write to me, I read everything.',
    name: 'Your name',
    email: 'Your email',
    message: 'Message',
    send: 'Send message',
    sending: 'Sending…',
    ok: 'Thanks, your message is on its way. I will reply to the email you gave.',
    error: 'The message could not be sent. Please email me directly at',
    invalid: 'Please fill in your name, a valid email and a message.',
    subject: 'New message from your portfolio',
    or: 'Or find me here',
  },
  footer: { built: 'Designed and built by Ömer Faruk Erdem.', top: 'Back to top' },
};

type Content = typeof en;

const tr: Content = {
  htmlLang: 'tr',
  title: 'Ömer Faruk Erdem · Yazılım Mühendisliği Öğrencisi',
  description:
    'Uçtan uca iş çıkaran yazılım mühendisliği öğrencisi: ASELSAN ve drone yazılımı stajları, cihaz üstü yapay zekâ, Kaggle yarışmaları ve yayındaki web siteleri.',
  skip: 'İçeriğe geç',
  nav: { departures: 'Kalkışlar', projects: 'Projeler', beyond: 'Kod dışında', contact: 'İletişim' },
  langSwitch: { label: 'English', short: 'EN', href: '/' },
  cv: 'CV',
  cvLong: 'CV indir (PDF)',
  board: {
    heading: 'Kalkışlar',
    colTime: 'Saat',
    colFlight: 'Uçuş',
    colDestination: 'Varış',
    colGate: 'Kapı',
    colStatus: 'Durum',
  },
  hero: {
    first: 'ÖMER FARUK',
    last: 'ERDEM',
    role: 'YAZILIM MÜHENDİSLİĞİ ÖĞRENCİSİ',
    lede:
      'Telefonda çalışan modellerden sahiplerinin kendi güncellediği web sitelerine kadar işleri uçtan uca yapıyorum. Yazılım mühendisliği 4. sınıf öğrencisiyim; ASELSAN ve bir drone firmasında staj yaptım.',
    nextLabel: 'Sıradaki kalkış',
    next: 'STAJ · JUNIOR POZİSYON',
    nextStatus: 'BİNİŞ',
    ctaPrimary: 'İletişime geç',
    ctaSecondary: 'İşlerime bak',
    gate: 'KAPI',
    photoAlt: 'Atölyede baretle bir zirai dronun yanında duran Ömer',
  },
  intro: {
    boarding: 'Biniş başladı',
    heading: 'Yolcu',
    text: [
      'Mühendisliğin en sevdiğim kısmı, bir fikrin gerçekle karşılaştığı an: telefonda çalışmak zorunda olan bir model, güvenlik incelemesinden geçmek zorunda olan bir asistan, bir anaokulunun her hafta duyurusunu yayınladığı bir site.',
      'ASELSAN’da ve Mostaş Teknoloji’de staj yaptım, Erasmus+ ile bir dönem yurt dışında okudum ve on üç yıl millî taekwondo sporcusu olarak yarıştım. Her gün aynı ciddiyetle işin başına geçmeyi bana hiçbir ders minder kadar iyi öğretmedi.',
    ],
    facts: [
      { k: 'Diller', v: 'Türkçe (ana dil) · İngilizce (B2)' },
      { k: 'Odak', v: 'Uygulamalı yapay zekâ · Mobil · Web sistemleri' },
      { k: 'Aradığım', v: 'Türkiye’de veya yurt dışında staj ve junior pozisyonlar' },
    ],
  },
  departures: {
    heading: 'Kalkışlar',
    sub: 'Çalıştığım ve okuduğum yerler, en yeniden eskiye. Ayrıntılar için bir satırı aç.',
    open: 'Ayrıntılar',
    close: 'Kapat',
    rows: [
      {
        time: 'AĞU 2026',
        code: 'ASL 26',
        destination: 'Teknoloji Yönetimi ve Dijital Dönüşüm Stajyeri (REHİS)',
        org: 'ASELSAN',
        gate: 'ANKARA',
        status: 'İNDİ',
        photo: 'aselsan',
        photoAlt: 'Kampüste ASELSAN yazısının önünde duran Ömer',
        details: [
          'Kullanıcıları uzun ve yapılandırılmış kurumsal formlarda yönlendiren bir iç web uygulamasını devralıp geliştirdim: doldurulması gereken alanları bulma, yönlendirmeli giriş, önceki cevaplardan öneri, değiştirilmemesi gereken bölümleri koruma ve oturum kurtarma.',
          'Devraldığım yapay zekâ asistanı çalışmıyordu ve kurumsal bilgi güvenliği politikasına uymuyordu; sıfırdan yeniden yazdım. Tekrarlayan istekleri makineden hiç çıkmadan cevaplayan yerel bir katman ekledim, cevap süreleri gözle görülür şekilde kısaldı.',
          'Farklı ifadelerin doğru alana eşlenmesi için Türkçe biçim bilgisi ve eş anlamlı desteği ekledim, yapay zekâ katmanını tek bir entegrasyon noktasının arkasına aldım ve uygulamayı kurumun iç yapay zekâ altyapısına taşıdım.',
          'Stajyerlerle mühendisler arasında proje devrini çözen ikinci bir aracı önerip geliştirdim: proje klasörünü inceliyor, giriş noktasını ve bağımlılıkları buluyor, kurulum ve çalıştırma betikleriyle kendi başına çalışan bir paket üretiyor. Üçüncü parti bağımlılığı yok, arşivdeki stajyer projeleriyle doğrulandı.',
        ],
      },
      {
        time: 'AĞU 2025',
        code: 'MST 25',
        destination: 'Yazılım Mühendisliği Stajyeri · havacılık ve uzay teknolojileri',
        org: 'MOSTAŞ TEKNOLOJİ',
        gate: 'İSTANBUL',
        status: 'İNDİ',
        photo: 'drone-workshop',
        photoAlt: 'Atölyede baretle zirai ilaçlama dronunun yanında duran Ömer',
        details: [
          'Zirai dronların uçuş ve arazi testleri için Unreal Engine 5.2 simülasyon ortamları tasarlayıp optimize ettim.',
          'Sıvı debisini ölçen ve pompayı kontrol eden ESP32-C3-Mini tabanlı gömülü bir sistem geliştirdim.',
          'QGroundControl üzerinde C++ ve QML ile yer istasyonu arayüz bileşenleri yazdım.',
          'Dron donanımında lehim, kablolama ve kalibrasyon yaptım, saha uçuş testlerine katıldım.',
        ],
      },
      {
        time: 'EYL 2025',
        code: 'ERA 25',
        destination: 'Erasmus+ değişim programı · Bilişim',
        org: 'UMFST “GEORGE EMIL PALADE”',
        gate: 'TÂRGU MUREȘ',
        status: 'İNDİ',
        details: [
          'Erasmus+ bursunu yazılı ve sözlü seçme sınavlarını geçerek kazandım.',
          'Eylül 2025 – Şubat 2026 arasında İngilizce verilen bilişim derslerinden oluşan tam bir dönemi tamamladım.',
        ],
      },
      {
        time: 'EKİ 2024',
        code: 'FRT 24',
        destination: 'Yazılım Mühendisliği Lisans · 4. sınıf',
        org: 'FIRAT ÜNİVERSİTESİ',
        gate: 'ELAZIĞ',
        status: 'YOLDA',
        live: true,
        details: [
          'Yazılım mühendisliği, veri madenciliği, doğal dil işleme, bilgi sistemleri ve güvenliği ile mobil uygulama geliştirme ağırlıklı dersler.',
        ],
      },
      {
        time: 'EYL 2023',
        code: 'MTU 23',
        destination: 'Yazılım Mühendisliği Lisans · 1. sınıf',
        org: 'MALATYA TURGUT ÖZAL ÜNİVERSİTESİ',
        gate: 'MALATYA',
        status: 'AKTARMA',
        details: ['Birinci yılın ardından akademik başarıyla Fırat Üniversitesi’ne geçiş yaptım.'],
      },
    ],
  },
  projects: {
    heading: 'Varışlar',
    sub: 'Yaptığım ve gerçekten yere inen işler. Her birinin yanında kanıtı var.',
    illustrative: 'Görevin temsilî gösterimi, yarışma verisi değildir',
    chartTitle: 'Çapraz doğrulama MSE değeri, düşük olan daha iyi',
    chartBars: ['Ortalamayı tahmin', 'Ridge', 'Gradient boosting', 'İlk yığın', 'Son yığın'],
    items: [
      {
        id: 'signbridge',
        code: 'SBA',
        name: 'SignBridgeAI',
        date: 'EYL 2026',
        claim: 'İşaret dili alfabesini gerçek zamanlı ve tamamen telefonda tanıyor.',
        body:
          'Kameradan işaret dili harflerini tanıyan, tek bir kareyi bile dışarı göndermeyen ve metni ML Kit ile çeviren bir Android uygulaması. El işaretlerini sınıflandıran modeli eğittim, solak kullanıcılarda tanımayı düzelttim, ikon, açılış ekranı ve marka renklerini hazırladım, imzalı Google Play sürümünü çıkardım.',
        stack: 'Kotlin · Jetpack Compose · MediaPipe · TensorFlow Lite · ML Kit',
        link: { href: 'https://github.com/omerdm34/signbridge-ai', label: 'GitHub’da kaynak kod' },
        status: 'İNDİ',
      },
      {
        id: 'datathon',
        code: 'DTN',
        name: 'Datathon 2026',
        date: 'HAZ 2026',
        claim: 'Tahmin hatasını 230’dan 77’ye indirdim.',
        body:
          'Kariyer başarı skorunu tahmin eden bir Kaggle regresyon yarışması. Özellik mühendisliğini kelime ve karakter düzeyinde TF-IDF ile birleştirdim, yedi modeli Ridge meta-öğrenicisiyle yığınladım ve Optuna ile ayarladım. Eğitim ve test verisi arasında zamana bağlı bir kayma olduğunu fark edip liderlik tablosunu çevrimdışı yansıtan ağırlıklı bir doğrulama kurdum.',
        stack: 'Python · scikit-learn · LightGBM · XGBoost · CatBoost · Optuna',
        link: { href: 'https://github.com/omerdm34/datathon-2026', label: 'GitHub’da kaynak kod' },
        status: 'İNDİ',
      },
      {
        id: 'teknofest',
        code: 'TKF',
        name: 'TEKNOFEST 2026 · Trendyol',
        date: 'HAZ 2026',
        claim: 'İnsanların yazdığını kastettikleri ürünle eşleştirmek.',
        body:
          'FiraTech takımı; iki kişi, danışmansız. Anlamsal arama için çok dilli E5 cümle gömme modellerini zor negatif örneklerle ince ayarladım. Günlük gönderim hakkı sınırlı olduğu için çevrimdışı değerlendirme amacıyla elle etiketlenmiş kendi altın veri setimizi oluşturduk.',
        stack: 'Python · PyTorch · Sentence Transformers · çok dilli E5',
        status: 'İNDİ',
      },
      {
        id: 'dcenergy',
        code: 'DCE',
        name: 'DC Energy',
        date: 'AĞU 2026',
        claim: 'Sahibinin koda dokunmadan güncellediği, yayındaki bir firma sitesi.',
        body:
          'Bir elektrik mühendisliği firması için kurumsal site: metin ve görselleri düzenleyen şifreli panel, firmaya e-posta gönderen iletişim formu, hız sınırı, SEO ve baştan sona alan adı, DNS, SSL kurulumu.',
        stack: 'Next.js · Cloudflare Workers · R2',
        link: { href: 'https://dcenergy.com.tr', label: 'dcenergy.com.tr' },
        status: 'YAYINDA',
      },
      {
        id: 'masal',
        code: 'MSL',
        name: 'Masal Bahçesi Anaokulu',
        date: '2026',
        claim: 'Bir anaokulu duyurularını telefondan kendisi yayınlıyor.',
        body:
          'Hızlı bir statik site ve Türkçe yönetim paneli: GitHub API üzerinden commit atan bir Cloudflare Worker, HMAC imzalı oturumlar ve birim testleri. Teknik bilgisi olmayan bir sahip için yapıldı, her gün kullanılıyor.',
        stack: 'Astro · Cloudflare Workers · GitHub API',
        link: { href: 'https://masalbahcesimaras.com', label: 'masalbahcesimaras.com' },
        status: 'YAYINDA',
      },
    ],
    more: {
      heading: 'Panoda ayrıca',
      rows: [
        {
          name: 'A Paso Seguro',
          date: '2026',
          text: 'Gece hayatını daha güvenli yaşamak için Java/Android uygulaması (BM SKA 11). Uluslararası bir öğrenci ekibiyle San Luis Potosí, Meksika için Figma’da tasarlandı.',
        },
      ],
    },
    githubHeading: 'GitHub’daki son güncellemeler',
    githubUpdated: 'güncellendi',
    githubAll: 'Tüm depolar',
  },
  beyond: {
    heading: 'Aktarma',
    sub: 'Bir commit mesajına sığmayan taraflarım.',
    taekwondoTitle: '13 yıl millî sporcu',
    taekwondoText:
      'On yılı aşkın süre ulusal düzeyde taekwondo yarışmalarına katıldım, Türkiye Taekwondo Federasyonu’ndan millî sporcu belgem var. Küçük sporcuların antrenmanlarına ve kulüp yarışmalarının organizasyonuna destek oldum.',
    copTitle: 'COP31 gönüllüsü',
    copText:
      'BM İklim Değişikliği Konferansı’nın gönüllü ekibine seçildim; pek çok ülkeden heyetle birlikte çalışıyorum.',
    droneAlt: 'Dışarıda kendi yaptığı dört pervaneli dronu tutan Ömer',
    travelHeading: 'Son varış noktaları',
    travel: [
      { code: 'VIE', city: 'Viyana', photo: 'vienna', alt: 'Viyana Devlet Operası önündeki terasta Ömer' },
      { code: 'PRG', city: 'Prag', photo: 'prague', alt: 'Arkasında Karl Köprüsü, Prag’da Vltava kıyısında Ömer' },
      { code: 'FCO', city: 'Roma', photo: 'rome', alt: 'Roma’da Kolezyum önünde Ömer' },
    ],
    certsHeading: 'Sertifikalar',
    certs: [
      { name: 'Millî Sporcu Belgesi · Taekwondo', by: 'Gençlik ve Spor Bakanlığı', date: '2023', img: 'national-athlete' },
      { name: 'Code Genius', by: 'TalentCoders · katılım', date: 'NİS 2024', img: 'code-genius' },
      { name: 'Young Executive Academy', by: 'Altı aylık akademi programı', date: '2023–2024', img: 'yea' },
      { name: 'Siber Vatan', by: 'Ulusal siber güvenlik eğitim programı', date: '' },
    ],
    viewCert: 'Sertifikayı gör',
  },
  contact: {
    heading: 'İletişim',
    lede: 'Aklında bir staj, pozisyon ya da proje mi var? Yaz bana, hepsini okuyorum.',
    name: 'Adın',
    email: 'E-posta adresin',
    message: 'Mesajın',
    send: 'Mesajı gönder',
    sending: 'Gönderiliyor…',
    ok: 'Teşekkürler, mesajın yola çıktı. Verdiğin e-posta adresine dönüş yapacağım.',
    error: 'Mesaj gönderilemedi. Doğrudan şu adrese yazabilirsin:',
    invalid: 'Lütfen adını, geçerli bir e-posta adresi ve mesajını yaz.',
    subject: 'Portfolyondan yeni mesaj',
    or: 'Ya da buradan ulaş',
  },
  footer: { built: 'Tasarım ve kod: Ömer Faruk Erdem.', top: 'Başa dön' },
};

export const content: Record<Lang, Content> = { en, tr };

export const links = {
  email: 'omerfarukrdm34@gmail.com',
  github: 'https://github.com/omerdm34',
  linkedin: 'https://www.linkedin.com/in/%C3%B6mer-faruk-erdem-260b302a7/',
  kaggle: 'https://www.kaggle.com/erdemomerr',
  instagram: 'https://www.instagram.com/erdemomerr_/',
  cv: '/cv/Omer-Faruk-Erdem-CV.pdf',
};

export const datathonScores = [230, 85.9, 82.5, 78.25, 77.17];
