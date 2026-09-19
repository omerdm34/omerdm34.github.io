---
title: 'Pikseller değil, el noktaları: işaret dili harfleri telefonda'
description: '9,5 MB’lık bir görüntü modelini neden her karede 63 sayı okuyan 235 KB’lık bir modelle değiştirdiğim ve titreyen bir sınıflandırıcıyı yazı yazılabilir hâle getiren küçük kurallar.'
date: 2026-09-19
code: SBA
project: signbridge-ai
tags: ['Android', 'MediaPipe', 'TensorFlow Lite', 'Cihaz üstü ML']
---

SignBridgeAI, Amerikan İşaret Dili harflerini bir Android telefonda metne çeviriyor. Kamera karesi cihazdan hiç çıkmıyor. Bu yazı işe yarayan iki kararla ilgili: modelin neye baktığı ve uygulamanın modelin cevaplarıyla ne yaptığı.

## İlk sürüm yanlış şeye bakıyordu

İlk modelim kamera görüntüsünü doğrudan sınıflandırıyordu: dondurulmuş bir MobileNetV2 ve üstünde küçük bir katman, ASL Alphabet veri setinin 128 × 128 görüntüleriyle eğitildi. Dışa aktarılan TensorFlow Lite dosyası 28 sınıf için 9,5 MB’tı. Asıl sorun neye baktığıydı. Bir görüntü modeli karenin tamamını görür. Veri setindeki arka planlar, ışık ve ten rengi de öğrendiklerinin bir parçası olur ve bunların hiçbiri harf değildir.

Parmak alfabesinde bir harf, bir el şeklidir. Arka plan, ten rengi ve kameraya uzaklık gürültüdür. Bu yüzden modele piksel vermeyi bıraktım.

## 16.384 piksel yerine 21 nokta

Google’ın MediaPipe el algılayıcısı zor görüntü problemini zaten çözüyor: bir eli bulup 21 üç boyutlu nokta döndürüyor. Bunlar bilek ve her parmaktaki dört eklem. Girdi olarak bu noktaları kullanıyorum, görüntüyü atıyorum.

Ham noktalar yine de istemediğim şeyler taşıyor: elin karede nerede durduğu ve kameraya ne kadar yakın olduğu. İki satır ikisini de kaldırıyor:

```kotlin
// Bileğe göre: el karenin herhangi bir yerinde olabilir.
val x = raw[i][0] - wristX
val y = raw[i][1] - wristY
val z = raw[i][2] - wristZ

// En büyük koordinata böl: yakın ve uzak eller aynı görünür.
features[k] = x / maxAbs   // 21 nokta × (x, y, z) = 63 sayı
```

Sonuç, her karede −1 ile 1 arasında 63 sayı. Işık, arka plan ya da ten rengi, el algılamayı bozmadıkça bu sayılara hiç yansımıyor.

Aynı fonksiyon iki yerde çalışıyor: eğitim setini hazırlarken Python’da, uygulamanın içinde Kotlin’de. İkisinin birebir aynı olması gerekiyor. Farklı bir sıra ya da unutulmuş bir ölçekleme adımı hiçbir şeyi çökertmez, model yalnızca sessizce kötüleşir. Bu yüzden iki sürüm de aynı adımları aynı sırayla izliyor: bileği çıkar, en büyük mutlak değeri bul, böl.

## Önemsenmeyecek kadar küçük bir model

El algılayıcıyı her sınıf için en fazla 1.000 görüntü üzerinde çalıştırdım. Eli bulduğu her yerde (bu 21.147 kez oldu) 63 sayıyı ve etiketi kaydettim. Üstteki sınıflandırıcı bilerek sıradan: batch normalization ve dropout içeren üç yoğun katman (256 → 128 → 64). Katmanlı (stratified) 80/20 bölmeyle ve erken durdurmayla eğitildi.

Dışa aktarılan model **235 KB**, görüntü modelinden yaklaşık 40 kat küçük. Telefondaki ağır iş artık MediaPipe’ın el algılayıcısında. Üstteki sınıflandırıcı birkaç küçük matris çarpımından ibaret.

Bir doğruluk oranı yayımlamadım. Test bölmem eğitimle aynı veri setinden geliyor, bu yüzden modeli olduğundan iyi gösterirdi. Dürüst bir sayı için başka insanların başka odalarda kaydettiği işaretler lazım. Toplamak istediğim bir sonraki şey de bu.

## Bir sınıflandırıcı klavye değildir

Her karede cevap veren bir model `A A A S A A E E E` gibi bir akış üretir. Söylediği her şeyi yazmak anlamsız bir metin verir. Bu yüzden model ile metin kutusu arasında uygulama duruyor:

```kotlin
if (confidence >= 0.85f && label == lastLabel) stableCount++ else stableCount = 1

// Üç sabit kareden sonra harfi kabul et, sonra elin değişmesini bekle.
if (stableCount >= 3 && (!waitingForRelease || label != lastAdded)) {
    append(label)
    lastAdded = label
    waitingForRelease = true
}
if (label == "NO_HAND") { waitingForRelease = false; lastAdded = "" }
```

Buradan üç kural çıkıyor:

- **Yalnızca emin olunan harfler.** Güven %85’in altındaysa hiçbir şey yazılmıyor.
- **Yalnızca sabit harfler.** Aynı cevabın üç kare üst üste sürmesi gerekiyor. Böylece el bir şekilden diğerine geçerken çıkan tek karelik titremeler eleniyor.
- **Bir poz, bir harf.** Bir harf kabul edildikten sonra aynı şekli tutmak onu tekrar yazmıyor. Çift harf yazmak için eli kadrajdan çıkarıp geri getirmek gerekiyor.

Güven değeri ekrandaki ipuçlarını da belirliyor. %65’in altında uygulama daha iyi ışık ya da kadraj istiyor. %65 ile %85 arasında “neredeyse oldu, sabit tut” diyor. Amaç, bir şeyin *neden* yazılmadığını bilen kullanıcının aynı işareti tekrarlayıp vazgeçmek yerine girdiyi düzeltebilmesi.

## Sol eller ters okunuyordu

Eğitim görüntüleri çoğunlukla sağ el. Solak biri aynı harfi aynadaki görüntüsü olarak yapıyor. Model bunu nadiren görmüştü, bu yüzden sol eller yanlış okunuyordu.

Aynalanmış kopyalarla yeniden eğitmek işe yarardı. Ama MediaPipe hangi eli gördüğünü zaten söylüyor, bu yüzden çözüm normalizasyon adımında tek bir dal oldu:

```kotlin
val x = if (isLeftHand) wristX - raw[i][0] else raw[i][0] - wristX
```

Sol el, modelin tanıdığı geometriye çevriliyor. Yeni veri yok, yeni model yok ve her karede aynı şekilde çalışıyor.

## Buradan öğrendiklerim

- **Temsil, modelden daha önemliydi.** Pikselden el noktalarına geçmek, küçücük bir ağın işi görmesini sağladı ve modeli, boyutun artık soru olmadığı kadar küçülttü.
- **Hataların çoğu ağda değil, etkileşimdeydi.** Çift harfler, sol eller ve kötü ışık, hepsi sınıflandırıcının dışında çözüldü.
- **Tekrarlanan ön işleme bir sözleşmedir.** Eğitim kodu ile uygulama kodunun uyuşması gerekiyorsa adımları aynı ve aynı sırada tutun, birindeki her değişikliği ikisinde birden yapılmış sayın.

Model ve eğitim kodu [GitHub’da](https://github.com/omerdm34/signbridge-ai). Ürün tarafı (çeviri, seslendirme, Play sürümü) [proje detayında](/tr/projects/signbridge-ai/).
