import type { Lang } from './content';

export type CaseStudy = {
  slug: 'signbridge-ai' | 'datathon-2026' | 'dc-energy' | 'masal-bahcesi';
  homeId: 'signbridge' | 'datathon' | 'dcenergy' | 'masal';
  code: string;
  name: string;
  date: string;
  status: string;
  title: string;
  description: string;
  lede: string;
  facts: { k: string; v: string }[];
  problem: string[];
  steps: { title: string; text: string }[];
  results: { value: string; label: string }[];
  resultsNote?: string;
  learned: string[];
  stack: string[];
  links: { href: string; label: string }[];
};

type Ui = {
  back: string;
  caseStudy: string;
  problem: string;
  approach: string;
  results: string;
  learned: string;
  stack: string;
  gallery: string;
  next: string;
  readCase: string;
  models: string;
  modelCol: string;
  mseCol: string;
};

export const caseUi: Record<Lang, Ui> = {
  en: {
    back: 'Back to the board',
    caseStudy: 'Case study',
    problem: 'The problem',
    approach: 'How I built it',
    results: 'Results',
    learned: 'What I learned',
    stack: 'Stack',
    gallery: 'Screens',
    next: 'Next case study',
    readCase: 'Read the case study',
    models: 'Model log',
    modelCol: 'Model',
    mseCol: 'Out-of-fold MSE',
  },
  tr: {
    back: 'Panoya dön',
    caseStudy: 'Proje detayı',
    problem: 'Problem',
    approach: 'Nasıl yaptım',
    results: 'Sonuçlar',
    learned: 'Neler öğrendim',
    stack: 'Teknolojiler',
    gallery: 'Ekranlar',
    next: 'Sıradaki proje',
    readCase: 'Proje detayını oku',
    models: 'Model kaydı',
    modelCol: 'Model',
    mseCol: 'Çapraz doğrulama MSE',
  },
};

export const datathonModels = [
  { name: 'Predict the mean', nameTr: 'Ortalamayı tahmin', mse: 230 },
  { name: 'Extra Trees', nameTr: 'Extra Trees', mse: 94.8 },
  { name: 'MLP', nameTr: 'MLP', mse: 90.1 },
  { name: 'Ridge', nameTr: 'Ridge', mse: 85.9 },
  { name: 'HistGradientBoosting', nameTr: 'HistGradientBoosting', mse: 82.5 },
  { name: 'First blend (MLP + HGB)', nameTr: 'İlk harman (MLP + HGB)', mse: 81.2 },
  { name: 'Stack, 5 models + Ridge meta', nameTr: 'Yığın, 5 model + Ridge meta', mse: 78.25 },
  { name: 'Final stack', nameTr: 'Son yığın', mse: 77.17 },
];

const en: CaseStudy[] = [
  {
    slug: 'signbridge-ai',
    homeId: 'signbridge',
    code: 'SBA',
    name: 'SignBridgeAI',
    date: 'SEP 2026',
    status: 'LANDED',
    title: 'SignBridgeAI · Case study · Ömer Faruk Erdem',
    description:
      'How I built an Android app that recognizes the ASL alphabet in real time, entirely on the phone, with MediaPipe hand landmarks and a TensorFlow Lite classifier.',
    lede:
      'An Android app that turns sign-language letters into text, a Turkish translation and speech, without a single camera frame leaving the phone.',
    facts: [
      { k: 'Platform', v: 'Android (Kotlin, Jetpack Compose)' },
      { k: 'Role', v: 'Solo: model, app, design, release' },
      { k: 'Timeline', v: 'Aug – Sep 2026' },
    ],
    problem: [
      'People who sign often have to rely on someone else to be understood. Most recognition demos send video to a server, which is slow, needs a connection and means a stranger’s camera feed leaves the device.',
      'I wanted recognition that works offline, answers instantly and collects nothing, on an ordinary phone.',
    ],
    steps: [
      {
        title: 'Landmarks instead of pixels',
        text: 'Instead of classifying raw images, the app runs Google’s MediaPipe hand landmarker and keeps only 21 points of the hand. Each point is made relative to the wrist and scaled, so the input is 63 numbers that do not care about skin tone, background or distance to the camera.',
      },
      {
        title: 'A small model that fits a phone',
        text: 'I extracted landmarks from the ASL Alphabet dataset (A–Z plus space and delete) and trained a compact dense network (256 → 128 → 64 with batch normalisation and dropout) in TensorFlow, then converted it to TensorFlow Lite.',
      },
      {
        title: 'Only confident, steady letters',
        text: 'A letter is added only when confidence is at least 85% and the same prediction holds for three frames in a row; the app then waits for the hand to change so one pose does not type a letter twice. Below 65% it tells the user to fix lighting or framing.',
      },
      {
        title: 'Left-handed signers',
        text: 'The model was trained on right hands, so left-handed users were misread. MediaPipe reports handedness; for a left hand I mirror the x coordinates before classification, which fixed recognition without retraining.',
      },
      {
        title: 'From text to voice',
        text: 'Recognized words go through ML Kit’s on-device translation (English ↔ Turkish) and Android text-to-speech. A text mode lets people type when the camera is not practical.',
      },
      {
        title: 'Shipping it',
        text: 'I designed the icon, splash screen and brand palette, wrote the store listing in English and Turkish and a privacy policy, and prepared the signed Google Play release.',
      },
    ],
    results: [
      { value: '0', label: 'camera frames sent off the device' },
      { value: '63', label: 'numbers per frame fed to the model' },
      { value: '28', label: 'classes: A–Z, space and delete' },
    ],
    learned: [
      'Choosing the right input representation mattered more than model size: landmarks made a tiny network robust.',
      'Most real-world errors came from interaction details (repeated letters, left hands, poor light), not from the classifier.',
      'Shipping is its own project: signing, store assets, privacy policy and two languages took as much care as the model.',
    ],
    stack: ['Kotlin', 'Jetpack Compose', 'CameraX', 'MediaPipe Tasks', 'TensorFlow / TensorFlow Lite', 'ML Kit Translation', 'Python'],
    links: [{ href: 'https://github.com/omerdm34/signbridge-ai', label: 'Model and training code on GitHub' }],
  },
  {
    slug: 'datathon-2026',
    homeId: 'datathon',
    code: 'DTN',
    name: 'Datathon 2026',
    date: 'JUN 2026',
    status: 'LANDED',
    title: 'Datathon 2026 · Case study · Ömer Faruk Erdem',
    description:
      'A Kaggle regression competition where stacking seven models and a validation scheme built around a time shift cut the error from 230 to 77.',
    lede:
      'A Kaggle regression competition: predict a 0–100 career success score from numbers, categories and free-text comments. I cut the error from 230 to 77.',
    facts: [
      { k: 'Competition', v: 'Kaggle · Datathon 2026' },
      { k: 'Metric', v: 'Mean squared error (MSE)' },
      { k: 'Timeline', v: 'Jun 2026' },
    ],
    problem: [
      'Each student record mixed numeric fields, categories and a free-text comment. Simply predicting the average score gave an MSE of about 230.',
      'The leaderboard allowed few submissions and its scores did not match my first cross-validation numbers, so I could not trust either signal on its own.',
    ],
    steps: [
      {
        title: 'Features from every column',
        text: 'Engineered numeric and categorical features, then turned the free-text comments into word- and character-level TF-IDF vectors compressed with truncated SVD.',
      },
      {
        title: 'A baseline worth beating',
        text: 'A blend of an MLP and HistGradientBoosting reached an out-of-fold MSE of 81.2 and became the bar every later idea had to clear.',
      },
      {
        title: 'Stacking',
        text: 'Trained diverse models (Ridge, HistGradientBoosting, LightGBM, XGBoost, CatBoost, MLP, Extra Trees) on the same folds and combined their out-of-fold predictions with a Ridge meta-learner.',
      },
      {
        title: 'Finding the time shift',
        text: 'Comparing training and test distributions showed a shift over time. I built a weighted validation scheme around it that reproduced the leaderboard’s behaviour offline.',
      },
      {
        title: 'Tuning and variance',
        text: 'Tuned the strongest models with Optuna and averaged gradient-boosting runs over several seeds to make the final stack less noisy.',
      },
    ],
    results: [
      { value: '230 → 77', label: 'out-of-fold MSE, from the mean baseline to the final stack' },
      { value: '7', label: 'models in the final stack' },
      { value: '−66%', label: 'error compared with predicting the mean' },
    ],
    resultsNote: 'Numbers are the out-of-fold scores recorded in the scripts on GitHub.',
    learned: [
      'Validation design is the real model: once offline scores tracked the leaderboard, every other decision got easier.',
      'Diversity beats a single strong model; the stack improved on its best member.',
      'Keeping one script per step, with its measured score in the header, made it obvious which ideas actually helped.',
    ],
    stack: ['Python', 'pandas', 'scikit-learn', 'LightGBM', 'XGBoost', 'CatBoost', 'Optuna'],
    links: [{ href: 'https://github.com/omerdm34/datathon-2026', label: 'All scripts on GitHub' }],
  },
  {
    slug: 'dc-energy',
    homeId: 'dcenergy',
    code: 'DCE',
    name: 'DC Energy',
    date: 'AUG 2026',
    status: 'LIVE',
    title: 'DC Energy · Case study · Ömer Faruk Erdem',
    description:
      'How I built a live corporate site for an electrical contracting firm, with a panel the firm uses to edit its own content, running on free Cloudflare tiers.',
    lede:
      'A corporate website for an electrical contracting firm in Elazığ, with a panel the firm uses to change its own texts, products and projects. It runs on free tiers; the domain is the only bill.',
    facts: [
      { k: 'Client', v: 'Electrical contracting firm, Elazığ' },
      { k: 'Role', v: 'Solo: design, development, hosting, domain and email' },
      { k: 'Timeline', v: 'Aug – Sep 2026' },
    ],
    problem: [
      'The firm had no website, and its content was going to keep changing: new projects, new products, rewritten services. If every edit had to come back to me, the site would be out of date within a month.',
      'The brief also had a hard limit: no running costs beyond the domain. A panel that saves content usually means a server with a disk, and a server means a monthly bill.',
    ],
    steps: [
      {
        title: 'Content as data',
        text: 'Every page reads from six JSON documents: site settings, home, about, services, products and projects. The panel edits them with plain forms, uploads images with type and size checks, and collects contact-form messages in an inbox.',
      },
      {
        title: 'One place that knows where files live',
        text: 'A single storage module decides where content goes: Cloudflare R2 in production, the local disk in development. Reads fall back to the content bundled in the build, so the first deploy was complete even while the bucket was still empty.',
      },
      {
        title: 'From a server to free hosting',
        text: 'My first plan was a small VPS because the panel writes files. Checking it against the no-running-costs rule, I moved the app to Cloudflare Workers with the OpenNext adapter and R2. Thanks to the storage module the switch touched one file, and the VPS path still works.',
      },
      {
        title: 'A panel that is safe to leave online',
        text: 'Sessions are signed JWTs in HttpOnly cookies, the contact form is validated with Zod, and both the login and the form sit behind Cloudflare rate-limiting rules.',
      },
      {
        title: 'Working around a bundler limit',
        text: 'Cloudflare’s email module could not be bundled into the Next.js build, so contact notifications go through a small separate Worker linked to the site by a service binding, with no public address of its own. The firm’s own address forwards to its inbox and sends DKIM-signed mail.',
      },
      {
        title: 'Launch and handover',
        text: 'Domain, DNS, SSL, a www-to-root redirect, Search Console with a sitemap and a Google Business Profile. Every account is registered to the firm, not to me, so the site does not depend on me to keep running.',
      },
    ],
    results: [
      { value: '€0', label: 'monthly hosting; the domain is the only cost' },
      { value: '6', label: 'content sections the firm edits without me' },
      { value: '0', label: 'code changes needed when the firm updates its content' },
    ],
    learned: [
      'Put the swap point in one file: the storage module turned a hosting decision from a rewrite into a change of configuration.',
      'Check a plan against the brief, not against habit. I first reached for a server; the client’s cost rule pointed to a better design.',
      'Build-time settings are baked in for good: a local environment file once put a localhost address into the production build, so each environment now has its own file.',
      'Copy is part of the product. The first draft followed a template for a different kind of firm; once I had their real projects, I rewrote the services around what they actually do.',
    ],
    stack: ['Next.js (App Router)', 'TypeScript', 'Tailwind CSS', 'Motion', 'Cloudflare Workers', 'OpenNext', 'R2', 'jose', 'Zod'],
    links: [{ href: 'https://dcenergy.com.tr', label: 'dcenergy.com.tr' }],
  },
  {
    slug: 'masal-bahcesi',
    homeId: 'masal',
    code: 'MSL',
    name: 'Masal Bahçesi Preschool',
    date: 'AUG 2026',
    status: 'LIVE',
    title: 'Masal Bahçesi Preschool · Case study · Ömer Faruk Erdem',
    description:
      'How I built a fast site for a small preschool and a one-password panel that lets a non-technical owner publish announcements from a phone.',
    lede:
      'A website for a small private preschool in Kahramanmaraş, and a one-password panel the owner uses to publish announcements and events without help. No developer in the loop, no monthly bill.',
    facts: [
      { k: 'Client', v: 'Private preschool, Kahramanmaraş' },
      { k: 'Role', v: 'Solo: design, development, hosting, SEO and handover' },
      { k: 'Timeline', v: 'Aug 2026' },
    ],
    problem: [
      'The school needed to post announcements and events every week: enrolment periods, holidays, celebrations. The owner is not technical and runs the school from a phone.',
      'I first connected a Git-based CMS. It needed a GitHub account, a repository invitation, an app installation, an account switcher and an English interface. The owner got stuck three times, and each time the fault was in that chain, not with the owner.',
    ],
    steps: [
      {
        title: 'A fast static site',
        text: 'Ten content pages built with Astro and Tailwind. I measured the palette from the school’s logo and kept two versions of every brand colour: the bright one for decoration, and a darker one that passes 4.5:1 contrast on light tints, on cream and under white text.',
      },
      {
        title: 'A panel built for one person',
        text: 'I replaced the CMS with a panel inside the site: one address, one password, one form, all in Turkish and made for a phone. It lists, adds and deletes announcements and events, with an optional poster.',
      },
      {
        title: 'Git as the database',
        text: 'When the form is sent, a Cloudflare Worker writes a Markdown file and the image to the repository through the GitHub API. That commit triggers the build, and the site updates in a few minutes. There is no database or server to maintain, and every edit is in the history.',
      },
      {
        title: 'Security without friction',
        text: 'The password check runs in constant time, sessions are HMAC-signed HttpOnly, Secure, SameSite=Strict cookies that last 60 days, so the owner is not asked to log in on every visit, failed attempts are slowed down, and the GitHub token can only write to this one repository.',
      },
      {
        title: 'Photos that do not slow the site down',
        text: 'Posters are resized in the browser before upload, and a build step shrinks anything still too large. I set its limits by measuring the existing images, so it never touched a photo that was already fine.',
      },
      {
        title: 'One address, tested',
        text: 'The site answered on four addresses (http or https, with or without www). A Worker now sends them all to one. The local dev server ignores the Host header, so a manual check would have been misleading; I covered the redirect with its own unit tests.',
      },
    ],
    results: [
      { value: '7', label: 'announcements and events the owner has published without help since handover' },
      { value: '23', label: 'unit tests for the redirect and the panel API' },
      { value: '€0', label: 'monthly hosting; the domain is the only cost' },
    ],
    resultsNote: 'The count comes from the repository history, where every panel edit is a commit; test posts are excluded.',
    learned: [
      'When a user keeps getting stuck, look at the tool before the person. Removing the chain of accounts mattered more than any feature.',
      'Local tools can lie: the dev server ignored the Host header, so only unit tests could prove the redirect.',
      'Honesty is part of the design. I left out a poster whose photos were stock images, because parents would have taken them for the school’s own children.',
    ],
    stack: ['Astro', 'Tailwind CSS', 'Cloudflare Workers', 'GitHub API', 'sharp', 'Node test runner'],
    links: [{ href: 'https://masalbahcesimaras.com', label: 'masalbahcesimaras.com' }],
  },
];

const tr: CaseStudy[] = [
  {
    ...en[0],
    date: 'EYL 2026',
    status: 'İNDİ',
    title: 'SignBridgeAI · Proje detayı · Ömer Faruk Erdem',
    description:
      'MediaPipe el noktaları ve TensorFlow Lite sınıflandırıcıyla işaret dili alfabesini tamamen telefonda, gerçek zamanlı tanıyan Android uygulamasını nasıl yaptığım.',
    lede:
      'İşaret dili harflerini metne, Türkçe çeviriye ve sese dönüştüren bir Android uygulaması. Tek bir kamera karesi bile telefondan çıkmıyor.',
    facts: [
      { k: 'Platform', v: 'Android (Kotlin, Jetpack Compose)' },
      { k: 'Rolüm', v: 'Tek başıma: model, uygulama, tasarım, yayın' },
      { k: 'Süre', v: 'Ağustos – Eylül 2026' },
    ],
    problem: [
      'İşaret dili kullananlar anlaşılmak için çoğu zaman başka birine ihtiyaç duyuyor. Tanıma demolarının çoğu görüntüyü sunucuya gönderiyor; bu yavaş, internet istiyor ve kişinin kamera görüntüsü cihazdan çıkıyor.',
      'Sıradan bir telefonda, internetsiz çalışan, anında cevap veren ve hiçbir veri toplamayan bir tanıma istedim.',
    ],
    steps: [
      {
        title: 'Pikseller yerine el noktaları',
        text: 'Uygulama ham görüntüyü sınıflandırmak yerine Google’ın MediaPipe el algılayıcısını çalıştırıyor ve elin yalnızca 21 noktasını tutuyor. Her nokta bileğe göre konumlandırılıp ölçekleniyor; böylece model ten renginden, arka plandan ve kameraya uzaklıktan etkilenmeyen 63 sayı alıyor.',
      },
      {
        title: 'Telefona sığan küçük bir model',
        text: 'ASL Alphabet veri setinden (A–Z, boşluk ve silme) el noktalarını çıkardım, TensorFlow’da batch normalization ve dropout içeren küçük bir yoğun ağ (256 → 128 → 64) eğittim ve TensorFlow Lite’a dönüştürdüm.',
      },
      {
        title: 'Yalnızca emin ve sabit harfler',
        text: 'Bir harf ancak güven en az %85 olduğunda ve aynı tahmin üç kare üst üste sürdüğünde ekleniyor; ardından uygulama elin değişmesini bekliyor, böylece tek bir poz iki kez harf yazmıyor. Güven %65’in altındaysa kullanıcıya ışığı veya kadrajı düzeltmesini söylüyor.',
      },
      {
        title: 'Solak kullanıcılar',
        text: 'Model sağ elle eğitildiği için solak kullanıcılar yanlış okunuyordu. MediaPipe hangi el olduğunu bildiriyor; sol elde sınıflandırmadan önce x koordinatlarını aynalıyorum. Modeli yeniden eğitmeden sorun çözüldü.',
      },
      {
        title: 'Metinden sese',
        text: 'Tanınan kelimeler ML Kit’in cihaz üstü çevirisinden (İngilizce ↔ Türkçe) ve Android’in metinden konuşma motorundan geçiyor. Kameranın uygun olmadığı durumlar için yazarak kullanılabilen bir metin modu da var.',
      },
      {
        title: 'Yayına hazırlamak',
        text: 'İkonu, açılış ekranını ve marka renklerini tasarladım, mağaza metnini İngilizce ve Türkçe, gizlilik politikasını da yazdım, imzalı Google Play sürümünü hazırladım.',
      },
    ],
    results: [
      { value: '0', label: 'cihazdan dışarı gönderilen kamera karesi' },
      { value: '63', label: 'her karede modele giren sayı' },
      { value: '28', label: 'sınıf: A–Z, boşluk ve silme' },
    ],
    learned: [
      'Doğru girdi temsilini seçmek model büyüklüğünden daha önemliydi: el noktaları küçücük bir ağı dayanıklı yaptı.',
      'Gerçek kullanımdaki hataların çoğu sınıflandırıcıdan değil, etkileşim ayrıntılarından geldi: tekrarlanan harfler, sol el, kötü ışık.',
      'Yayına çıkmak başlı başına bir proje: imzalama, mağaza görselleri, gizlilik politikası ve iki dil en az model kadar özen istedi.',
    ],
    links: [{ href: 'https://github.com/omerdm34/signbridge-ai', label: 'GitHub’da model ve eğitim kodu' }],
  },
  {
    ...en[1],
    date: 'HAZ 2026',
    status: 'İNDİ',
    title: 'Datathon 2026 · Proje detayı · Ömer Faruk Erdem',
    description:
      'Yedi modeli yığınlayıp zamana bağlı kaymaya göre bir doğrulama kurarak hatayı 230’dan 77’ye indirdiğim Kaggle regresyon yarışması.',
    lede:
      'Bir Kaggle regresyon yarışması: sayısal alanlar, kategoriler ve serbest metin yorumlarından 0–100 arası bir kariyer başarı skoru tahmin etmek. Hatayı 230’dan 77’ye indirdim.',
    facts: [
      { k: 'Yarışma', v: 'Kaggle · Datathon 2026' },
      { k: 'Metrik', v: 'Ortalama kare hata (MSE)' },
      { k: 'Süre', v: 'Haziran 2026' },
    ],
    problem: [
      'Her öğrenci kaydında sayısal alanlar, kategoriler ve serbest metin bir yorum vardı. Sadece ortalama skoru tahmin etmek yaklaşık 230 MSE veriyordu.',
      'Liderlik tablosuna gönderim hakkı azdı ve oradaki skorlar ilk çapraz doğrulama sonuçlarımla uyuşmuyordu; iki sinyale de tek başına güvenemiyordum.',
    ],
    steps: [
      {
        title: 'Her sütundan özellik',
        text: 'Sayısal ve kategorik özellikler ürettim, serbest metin yorumları kelime ve karakter düzeyinde TF-IDF vektörlerine çevirip truncated SVD ile sıkıştırdım.',
      },
      {
        title: 'Geçilmeye değer bir temel',
        text: 'MLP ve HistGradientBoosting harmanı 81,2 çapraz doğrulama MSE değerine ulaştı ve sonraki her fikrin geçmesi gereken çizgi oldu.',
      },
      {
        title: 'Yığınlama',
        text: 'Farklı modelleri (Ridge, HistGradientBoosting, LightGBM, XGBoost, CatBoost, MLP, Extra Trees) aynı katlarda eğittim ve kat dışı tahminlerini bir Ridge meta-öğrenicisiyle birleştirdim.',
      },
      {
        title: 'Zaman kaymasını bulmak',
        text: 'Eğitim ve test dağılımlarını karşılaştırınca zamana bağlı bir kayma çıktı. Buna göre liderlik tablosunun davranışını çevrimdışı yansıtan ağırlıklı bir doğrulama kurdum.',
      },
      {
        title: 'Ayar ve varyans',
        text: 'En güçlü modelleri Optuna ile ayarladım, gradient boosting modellerini birkaç farklı seed ile çalıştırıp ortalayarak son yığını daha kararlı hale getirdim.',
      },
    ],
    results: [
      { value: '230 → 77', label: 'çapraz doğrulama MSE, ortalama tahmininden son yığına' },
      { value: '7', label: 'son yığındaki model sayısı' },
      { value: '−%66', label: 'ortalamayı tahmin etmeye göre hata' },
    ],
    resultsNote: 'Sayılar, GitHub’daki betiklerde kayıtlı çapraz doğrulama skorlarıdır.',
    learned: [
      'Asıl model doğrulama tasarımıymış: çevrimdışı skorlar liderlik tablosunu takip etmeye başlayınca diğer tüm kararlar kolaylaştı.',
      'Çeşitlilik tek güçlü modeli geçiyor; yığın, içindeki en iyi modelden daha iyi sonuç verdi.',
      'Her adımı ölçülen skoruyla ayrı bir betikte tutmak, hangi fikrin gerçekten işe yaradığını açıkça gösterdi.',
    ],
    links: [{ href: 'https://github.com/omerdm34/datathon-2026', label: 'Tüm betikler GitHub’da' }],
  },
  {
    ...en[2],
    date: 'AĞU 2026',
    status: 'YAYINDA',
    title: 'DC Energy · Proje detayı · Ömer Faruk Erdem',
    description:
      'Bir elektrik taahhüt firması için, içeriğini firmanın kendisinin düzenlediği bir panelle birlikte ücretsiz Cloudflare katmanlarında çalışan kurumsal siteyi nasıl yaptığım.',
    lede:
      'Elazığ’da bir elektrik taahhüt firması için kurumsal bir site ve firmanın kendi metinlerini, ürünlerini ve projelerini değiştirdiği bir panel. Ücretsiz katmanlarda çalışıyor; tek masraf alan adı.',
    facts: [
      { k: 'Müşteri', v: 'Elektrik taahhüt firması, Elazığ' },
      { k: 'Rolüm', v: 'Tek başıma: tasarım, geliştirme, barındırma, alan adı ve e-posta' },
      { k: 'Süre', v: 'Ağustos – Eylül 2026' },
    ],
    problem: [
      'Firmanın sitesi yoktu ve içeriği sürekli değişecekti: yeni projeler, yeni ürünler, yeniden yazılan hizmetler. Her düzenleme bana dönseydi site bir ay içinde eskirdi.',
      'İşin kesin bir sınırı da vardı: alan adı dışında sürekli masraf yok. İçerik kaydeden bir panel genelde diski olan bir sunucu, sunucu da aylık fatura demek.',
    ],
    steps: [
      {
        title: 'İçerik veri olarak',
        text: 'Her sayfa altı JSON belgesinden okuyor: site ayarları, ana sayfa, kurumsal, hizmetler, ürünler ve projeler. Panel bunları sade formlarla düzenliyor, görselleri tür ve boyut kontrolüyle yüklüyor, iletişim formundan gelen mesajları bir gelen kutusunda topluyor.',
      },
      {
        title: 'Dosyaların yerini bilen tek bir nokta',
        text: 'İçeriğin nereye yazılacağına tek bir depolama modülü karar veriyor: üretimde Cloudflare R2, geliştirmede yerel disk. Okumalar derlemeye gömülü içeriğe geri düşüyor; bu sayede kova henüz boşken bile ilk yayın eksiksiz açıldı.',
      },
      {
        title: 'Sunucudan ücretsiz barındırmaya',
        text: 'Panel dosya yazdığı için ilk planım küçük bir VPS’ti. Bunu “sürekli masraf yok” kuralıyla karşılaştırınca uygulamayı OpenNext adaptörüyle Cloudflare Workers’a ve R2’ye taşıdım. Depolama modülü sayesinde geçiş tek dosyayı etkiledi; VPS yolu hâlâ çalışıyor.',
      },
      {
        title: 'Açık bırakılabilecek bir panel',
        text: 'Oturumlar HttpOnly çerezlerde imzalı JWT, iletişim formu Zod ile doğrulanıyor; hem giriş hem form Cloudflare hız sınırlama kurallarının arkasında.',
      },
      {
        title: 'Derleyici sınırını aşmak',
        text: 'Cloudflare’in e-posta modülü Next.js derlemesine paketlenemiyordu. Bu yüzden iletişim bildirimleri, siteye service binding ile bağlı ve kendine ait genel adresi olmayan küçük ayrı bir Worker’dan gidiyor. Firmanın kendi adresi gelen kutusuna yönleniyor ve DKIM imzalı e-posta gönderiyor.',
      },
      {
        title: 'Yayın ve teslim',
        text: 'Alan adı, DNS, SSL, www’dan köke yönlendirme, site haritasıyla Search Console ve Google İşletme Profili. Bütün hesaplar benim değil firmanın adına; site ayakta kalmak için bana bağımlı değil.',
      },
    ],
    results: [
      { value: '0 €', label: 'aylık barındırma; tek masraf alan adı' },
      { value: '6', label: 'firmanın bana ihtiyaç duymadan düzenlediği içerik bölümü' },
      { value: '0', label: 'firma içeriğini güncellerken gereken kod değişikliği' },
    ],
    learned: [
      'Değişim noktasını tek dosyaya koy: depolama modülü, barındırma kararını baştan yazmaktan bir yapılandırma değişikliğine çevirdi.',
      'Planı alışkanlığa göre değil işin tanımına göre sına. İlk aklıma gelen sunucuydu; müşterinin masraf kuralı daha iyi bir tasarıma götürdü.',
      'Derleme anındaki ayarlar kalıcı olarak gömülür: bir yerel ortam dosyası bir keresinde üretim derlemesine localhost adresi yazdırdı; artık her ortamın kendi dosyası var.',
      'Metin de ürünün parçası. İlk taslak başka türde bir firmanın şablonunu izliyordu; gerçek projeleri gelince hizmetleri firmanın asıl yaptığı işe göre yeniden yazdım.',
    ],
    links: [{ href: 'https://dcenergy.com.tr', label: 'dcenergy.com.tr' }],
  },
  {
    ...en[3],
    name: 'Masal Bahçesi Anaokulu',
    date: 'AĞU 2026',
    status: 'YAYINDA',
    title: 'Masal Bahçesi Anaokulu · Proje detayı · Ömer Faruk Erdem',
    description:
      'Küçük bir anaokulu için hızlı bir site ve teknik olmayan bir yöneticinin telefonundan duyuru yayınlamasını sağlayan tek şifreli paneli nasıl yaptığım.',
    lede:
      'Kahramanmaraş’ta küçük bir özel anaokulu için bir site ve okul yöneticisinin duyuru ve etkinlikleri kendisinin yayınladığı tek şifreli bir panel. Arada geliştirici yok, aylık fatura yok.',
    facts: [
      { k: 'Müşteri', v: 'Özel anaokulu, Kahramanmaraş' },
      { k: 'Rolüm', v: 'Tek başıma: tasarım, geliştirme, barındırma, SEO ve teslim' },
      { k: 'Süre', v: 'Ağustos 2026' },
    ],
    problem: [
      'Okulun her hafta duyuru ve etkinlik paylaşması gerekiyordu: kayıt dönemleri, tatiller, kutlamalar. Yönetici teknik biri değil ve okulu telefonundan yönetiyor.',
      'İlk olarak Git tabanlı bir içerik yönetim sistemi bağladım. GitHub hesabı, depo daveti, uygulama kurulumu, hesap seçici ve İngilizce bir arayüz istiyordu. Yönetici üç kez takıldı ve her seferinde sorun onda değil, o zincirdeydi.',
    ],
    steps: [
      {
        title: 'Hızlı, statik bir site',
        text: 'Astro ve Tailwind ile on içerik sayfası. Paleti okulun logosundan ölçerek çıkardım ve her marka renginin iki hâlini tuttum: süs için parlak olanı, açık tonlarda, krem zeminde ve beyaz yazının altında 4.5:1 kontrastı geçen koyu olanı.',
      },
      {
        title: 'Tek kişi için yapılmış bir panel',
        text: 'Yönetim sistemini sitenin içindeki bir panelle değiştirdim: tek adres, tek şifre, tek form; tamamı Türkçe ve telefon için tasarlandı. Duyuru ve etkinlikleri listeliyor, ekliyor, siliyor; isteğe bağlı afiş de eklenebiliyor.',
      },
      {
        title: 'Veritabanı olarak Git',
        text: 'Form gönderilince bir Cloudflare Worker, GitHub API üzerinden depoya bir Markdown dosyası ve görseli yazıyor. Bu commit derlemeyi tetikliyor ve site birkaç dakikada güncelleniyor. Bakımı gereken bir veritabanı ya da sunucu yok, her düzenleme geçmişte duruyor.',
      },
      {
        title: 'Zahmetsiz güvenlik',
        text: 'Şifre kontrolü sabit sürede çalışıyor; oturumlar HMAC imzalı, HttpOnly, Secure ve SameSite=Strict çerezlerde ve 60 gün sürüyor, böylece her girişte şifre sorulmuyor. Hatalı denemeler yavaşlatılıyor ve GitHub anahtarı yalnızca bu tek depoya yazabiliyor.',
      },
      {
        title: 'Siteyi yavaşlatmayan fotoğraflar',
        text: 'Afişler yüklenmeden önce tarayıcıda küçültülüyor, hâlâ büyük kalanları da bir derleme adımı sıkıştırıyor. Sınırlarını mevcut görselleri ölçerek belirledim; zaten iyi olan hiçbir fotoğrafa dokunmadı.',
      },
      {
        title: 'Tek adres, testli',
        text: 'Site dört adresten açılıyordu (http ya da https, www’lu ya da www’suz). Artık bir Worker hepsini tek adrese topluyor. Yerel geliştirme sunucusu Host başlığını yok saydığı için elle yapılan kontrol yanıltıcı olurdu; yönlendirmeyi kendi birim testleriyle doğruladım.',
      },
    ],
    results: [
      { value: '7', label: 'teslimden bu yana yöneticinin kendisinin yayınladığı duyuru ve etkinlik' },
      { value: '23', label: 'yönlendirme ve panel API’si için birim testi' },
      { value: '0 €', label: 'aylık barındırma; tek masraf alan adı' },
    ],
    resultsNote: 'Sayı, her panel düzenlemesinin bir commit olduğu depo geçmişinden alındı; deneme kayıtları hariç.',
    learned: [
      'Bir kullanıcı sürekli takılıyorsa önce kişiye değil araca bak. Hesap zincirini ortadan kaldırmak her özellikten daha önemliydi.',
      'Yerel araçlar yanıltabilir: geliştirme sunucusu Host başlığını yok sayıyordu, yönlendirmeyi ancak birim testleri kanıtlayabildi.',
      'Dürüstlük tasarımın parçası. Fotoğrafları stok görsel olan bir afişi siteye koymadım; veliler onları okulun kendi çocukları sanardı.',
    ],
    links: [{ href: 'https://masalbahcesimaras.com', label: 'masalbahcesimaras.com' }],
  },
];

export const caseStudies: Record<Lang, CaseStudy[]> = { en, tr };
