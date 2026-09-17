import type { Lang } from './content';

export type CaseStudy = {
  slug: 'signbridge-ai' | 'datathon-2026';
  homeId: 'signbridge' | 'datathon';
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
];

export const caseStudies: Record<Lang, CaseStudy[]> = { en, tr };
