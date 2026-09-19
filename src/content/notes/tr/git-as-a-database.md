---
title: 'Veritabanı olarak Git: bir anaokulu için tek şifreli içerik paneli'
description: 'Bir Cloudflare Worker, GitHub API ve imzalı bir çerezin, tek kullanıcısının giremediği bir içerik yönetim sisteminin yerini nasıl aldığı.'
date: 2026-09-19
code: MSL
project: masal-bahcesi
tags: ['Cloudflare Workers', 'GitHub API', 'Astro', 'Güvenlik']
---

Küçük bir anaokulunun sitesinde her hafta haber olması gerekiyordu: kayıt tarihleri, tatiller, gelecek cuma bir kutlama. Bunları paylaşan kişi okulu telefondan yönetiyor ve kod yazmıyor. Site statik, Astro ile Markdown dosyalarından derleniyor. Hızlı ve ücretsiz barındırılabilmesinin sebebi de bu. Soru şuydu: geliştirici olmayan biri bir Markdown dosyasını nasıl ekler?

## Başkası için yapılmış bir araç

İlk cevabım Git tabanlı bir içerik yönetim sistemiydi: sizin yerinize depoya Markdown commit eden bir web editörü. Kâğıt üstünde idealdi. Pratikte yöneticinin bir GitHub hesabına, gizli bir depoya davete, o davetin kabulüne, benim depoya kurmam gereken bir uygulamaya, bir hesap seçicide doğru hesabı seçmeye ve İngilizce bir arayüze ihtiyacı vardı.

Yönetici üç kez takıldı. Her seferinde sebep o zincirin farklı bir halkasıydı, hiçbirinde yönetici değil. Asıl bulgu buydu. Sorun kılavuzda değildi. Araç geliştiriciler için tasarlanmıştı ve her fazladan hesap, bozulacak yeni bir yerdi.

## Depo kalsın, önündeki her şey gitsin

Statik sitenin değişmesi gerekmiyordu. İçerik zaten Git’teydi ve her push zaten Cloudflare’de bir derlemeyi tetikliyordu. Kaldırılması gereken, yöneticiyle depo arasındaki hesap zinciriydi.

Böylece panel sitenin bir parçası oldu: tek adres, tek şifre, tek form. Tamamı Türkçe ve telefona göre. Arkasında bir Cloudflare Worker üç işlem sunuyor: *listele*, *kaydet* ve *sil*. Her birini bir GitHub API çağrısına çeviriyor:

```js
// Kaydet = içerik klasörüne bir Markdown dosyası yaz.
const path = `src/content/announcements/${slug(title)}.md`;

// Var olan bir dosyanın üzerine yazmak için güncel SHA değeri gerekiyor.
const existing = await github(`contents/${path}?ref=main`);
const sha = existing.ok ? (await existing.json()).sha : undefined;

await github(`contents/${path}`, {
  method: 'PUT',
  body: JSON.stringify({
    message: `Panel: ${title}`,
    content: base64(frontmatter + body),
    branch: 'main',
    ...(sha && { sha }),
  }),
});
```

Yazma yolunun tamamı bu commit. Cloudflare onu görüyor, siteyi yeniden derliyor ve duyuru birkaç dakika sonra yayında. Yedeklenecek bir veritabanı, yama gerektiren bir sunucu yok. Yöneticinin yaptığı her değişiklik okunabilir mesajlı bir commit. Sitenin geçmişi kendi denetim kaydı, her hata da bir revert uzağında.

## Oturum deposu olmayan bir oturum

Bir panelin girişe, girişin de genelde oturumları tutacak bir yere ihtiyacı var. Bir Worker istekler arasında hiçbir şey hatırlamıyor ve yalnızca bunun için veritabanı eklemek istemedim. Bunun yerine çerez kendi kanıtını taşıyor:

```js
// çerez değeri = "<bitiş>.<HMAC-SHA256(şifre, bitiş)>"
async function issue(password) {
  const expiry = Date.now() + 60 * DAY;
  return `${expiry}.${await hmac(password, String(expiry))}`;
}

async function isValid(cookie, password) {
  const [expiry, sig] = cookie.split('.');
  if (Number(expiry) < Date.now()) return false;
  return constantTimeEqual(sig, await hmac(password, expiry));
}
```

Sunucu hiçbir şey saklamadan bir çerezi doğrulayabiliyor. Şifreyi bilmeyen biri çerez üretemiyor. Çerez `HttpOnly`, `Secure` ve `SameSite=Strict`. İmza anahtarı şifrenin kendisi olduğu için şifreyi değiştirmek, tek satır ek kod olmadan tüm cihazlardaki oturumları kapatıyor. Altmış gün bilerek uzun tutuldu. Paneli ayda bir açan biri her seferinde şifre girmek zorunda kalmamalı.

Göründüğünden daha önemli iki ayrıntı var. İmzayı `===` ile karşılaştırmak ilk farklı karakterde durur. Bu zamanlama, bir tahminin ne kadarının doğru olduğunu sızdırabilir, bu yüzden karşılaştırma sabit sürede yapılıyor. Yanlış şifre ise cevap vermeden önce bir süre bekliyor, bu da tahmin denemelerini yavaşlatıyor. GitHub anahtarı bir Worker gizli değişkeninde duruyor ve ince ayarlı: yalnızca bu tek deponun içeriğine yazabiliyor, başka hiçbir şeye değil.

## Telefon fotoğrafları statik siteyle tanışınca

Başta panelden gelen fotoğraflar depoya yüklendikleri gibi giriyordu. Telefon kamerasından gelen bir fotoğraf birkaç megabayttır ve statik bir site onu her ziyaretçiye, sonsuza dek sunar. Artık iki katman bunu çözüyor. Tarayıcı, görseli yüklemeden önce bir canvas ile küçültüyor: uzun kenar en fazla 1600 piksel, 0,85 kalitede JPEG. Her derlemeden sonra da bir betik hâlâ büyük kalanları sıkıştırıyor.

Betiğin sınırlarını sitedeki mevcut görselleri ölçerek belirledim, böylece zaten iyi olan hiçbir fotoğrafa dokunmayacaktı. Betik depoda değil derleme çıktısında çalışıyor, bu yüzden kalite kaybı derlemeler boyunca asla birikmiyor.

## Beni şaşırtanlar

- **Kapsamlı stiller sonradan üretilen öğelere ulaşmıyor.** Astro, bir bileşenin CSS’ini şablonundaki öğelere bir öznitelik ekleyerek kapsamlıyor. Paneldeki duyuru listesi çalışma anında JavaScript ile oluşturuluyor. Öğeleri o özniteliği hiç almadığı için liste hiç stilsiz göründü. Çözüm tek bir anahtar kelimeydi (`is:global`), yanına da neden kalması gerektiğini açıklayan bir yorum.
- **Deponun artık iki yazarı var.** Panel doğrudan GitHub’a commit ettiği için yerel kopyam ben fark etmeden geride kalıyor. Bir şey push etmeden önce rebase ile pull ediyorum.
- **Anahtarın süresi doluyor.** İnce ayarlı bir anahtarın bitiş tarihi var ve o tarih geçince panel sessizce kaydetmeyi bırakır. Bu tasarımın tek bakım işi bu ve tarihini önceden biliyorum.

Yönlendirme mantığı ve panel API’si için toplam 23 birim testi var. Teslimden bu yana yönetici panelden yedi gerçek duyuru ve etkinlik yayınladı. Her biri okuyabildiğim bir commit.

## Buradan öğrendiklerim

- **Bir kullanıcı sürekli takılıyorsa önce araca bakın.** O hesap zincirini kaldırmak, herhangi bir özelliğin yapabileceğinden fazlasını yaptı.
- **Haftada birkaç kez değişen bir site için Git gayet iyi bir veritabanı.** Geçmiş, inceleme ve geri alma bedava geliyor. Bedeli her değişiklikte birkaç dakikalık gecikme ve bir okulun haber sayfası bununla rahatça yaşayabiliyor.
- **Durumsuz olmak güvensiz olmak demek değil.** İmzalı bir çerez, sabit süreli bir karşılaştırma ve dar yetkili bir anahtar, altyapı eklemeden bu panelin ihtiyacını karşılıyor.

Site [masalbahcesimaras.com](https://masalbahcesimaras.com) adresinde yayında. Renk sisteminden yönlendirme testlerine kadar projenin geri kalanı [proje detayında](/tr/projects/masal-bahcesi/).
