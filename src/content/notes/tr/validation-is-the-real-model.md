---
title: 'Asıl model doğrulama: Datathon 2026’da 230’dan 77’ye'
description: 'Kurduğum en işe yarar şeyin bir model değil bir skor olduğu bir regresyon yarışması: hataları test setinin tarttığı gibi tartan bir skor.'
date: 2026-09-19
code: DTN
project: datathon-2026
tags: ['Python', 'scikit-learn', 'Yığınlama', 'Doğrulama']
---

Datathon 2026 bir Kaggle regresyon göreviydi: sayılar, kategoriler ve serbest metin bir mentor yorumundan oluşan 45 sütuna bakarak 10.000 öğrenci için 0–100 arası bir “kariyer başarı skoru” tahmin etmek. Metrik ortalama kare hataydı (MSE). Herkes için ortalamayı tahmin etmek **230,6** veriyordu. Son yığınım çapraz doğrulamada **77,17**’ye indi.

Bu yazı, geri kalan her şeyi mümkün kılan kısımla ilgili: hangi skora inanacağıma karar vermek.

## Uyuşmayan iki sinyal

Liderlik tablosuna gönderim hakkı azdı ve oradaki skorlar ilk çapraz doğrulama sonuçlarımla uyuşmuyordu. Çevrimdışı sayınız ile çevrimiçi sayınız uyuşmadığında her karar bir tahmine dönüşür ve gürültüye göre ayar yapmaya başlarsınız.

Bu yüzden daha fazla model kurmadan önce eğitim ve test dosyalarını sütun sütun karşılaştırdım.

## Test seti başka bir zamanda yaşıyordu

Tek bir sütun durumun çoğunu açıkladı: `application_year`.

| Yıl | Eğitim satırı | Test satırı |
|---|---:|---:|
| 2019 | 1.289 | 403 |
| 2022 | 1.293 | 881 |
| 2024 | 1.319 | 1.994 |
| 2025 | 1.191 | 2.197 |
| 2026 | 997 | 2.029 |

Eğitim verisi 2019–2026 arasına neredeyse eşit dağılmıştı. Test seti ise ağırlıklı olarak yeniydi: **testin %62’si 2024–2026’dan geliyordu, eğitimde bu oran %35’ti.** Hedef de zamanla kaymıştı: ortalama skor 2019’da 77,9, 2026’da 74,2’ydi.

Rastgele K-katlı doğrulama hatayı yıllara eğitimdeki oranlarla dağıtır. Liderlik tablosu ise testteki oranlarla. Eski öğrencilerde iyi, yenilerde kötü olan bir model çevrimdışında iyi görünür, çevrimiçinde puan kaybeder.

## Hataları test seti gibi tartan bir skor

Eğitim için rastgele katları korudum ama her modeli ikinci bir sayıyla değerlendirdim. Hatayı her yıl için ayrı hesaplayıp her yılı test setindeki payıyla ağırlıklandırdım:

```python
test_w = test['application_year'].value_counts(normalize=True).to_dict()

def lb_like(oof):
    per_year = (pd.DataFrame({'yr': year_train, 'e': (y - oof) ** 2})
                  .groupby('yr')['e'].mean())
    return sum(test_w.get(yr, 0) * per_year[yr] for yr in per_year.index)
```

Ek gönderim gerektirmiyor ve test setinden her yılda kaç satır olduğu dışında hiçbir şey kullanmıyor. Bundan sonra her betik iki skoru yan yana yazdırdı. Hiperparametre araması da (Optuna, LightGBM için 40, CatBoost için 20 deneme) yıla göre ağırlıklı olanı iyileştirdi.

## Cevabı sızdırmadan özellikler

Güvenebildiğim bir skor olunca gerisi düzenli bir işti.

- **Sayılar:** beceri gruplarının ortalamaları (teknik, mühendislik, sosyal beceriler, mülakatlar, profil), eksik alan sayısı ve sevdiğim bir özellik: öğrencinin hedeflediği role uyan becerideki puanı (backend geliştirici için backend puanı, veri analisti için SQL) ve bunun kendi ortalamasından farkı. Eksik değerleri medyanla doldurdum ama yanına bir işaret sütunu da ekledim, çünkü bir alanın boş olması başlı başına sinyal taşıyordu.
- **Kategoriler:** doğrusal modeller için one-hot, ağaçlar için hedef kodlama. Yarışmalarda sızıntı genelde hedef kodlamadan olur: bir satırın kendi skoru kendi kategorisini kodlamaya yardım ederse doğrulama gerçekte olduğundan iyi görünür. scikit-learn’ün içeride çapraz uydurma yapan `TargetEncoder`’ını kullandım, böylece her satır kendini görmeden kodlanıyor.
- **Metin:** mentor yorumları üzerinde kelime (1–2 gram) ve karakter (2–5 gram) TF-IDF, truncated SVD ile 120 boyuta sıkıştırıldı. Yanına olumlu ve olumsuz Türkçe ifadelerin basit sayımları eklendi.

Tüm tahminler 0–100 aralığına kırpıldı. Hedef bu aralığın dışına çıkamıyor ve kare hata her taşmayı cezalandırıyor.

## Yığınlama: takım en iyi oyuncusunu geçiyor

Farklı türde modelleri aynı beş katta eğittim, her birinin kat dışı tahminlerini sakladım ve bu tahminlerin üstüne bir Ridge regresyonu oturttum:

| Model | Kat dışı MSE |
|---|---:|
| Extra Trees | 94,8 |
| MLP | 90,1 |
| Ridge | 85,9 |
| HistGradientBoosting, A ayarı | 82,9 |
| HistGradientBoosting, B ayarı | 82,5 |
| **Beşinin yığını, üstte Ridge** | **78,25** |

En iyi tek model 82,5 aldı, aynı beş modelin yığını 78,25. Bu ancak modeller *farklı* hatalar yaptığı için işe yarıyor. Doğrusal model ile ağaçlar farklı öğrencilerde yanılıyor ve üst model hangisine ne kadar güveneceğini öğreniyor. LightGBM, XGBoost ve CatBoost’u ekleyince yığın 77,17’ye indi.

Son sürüm her gradient boosting modelini üç farklı seed ile çalıştırıp ortaladı ve kategorileri ham hâliyle okuyan bir CatBoost ekledi. Buradaki amaç daha düşük bir ortalamadan çok daha düşük varyanstı: çalıştırmadan çalıştırmaya daha az değişen tahminler. Liderlik tablosu küçük ve gürültülüyken önemli olan da bu.

## Yazmaya değer bir çıkmaz

Mentor yorumlarını gömmek için Türkçe bir transformer olan BERTurk’ü denedim. GPU gerektirmesi sorun değildi, hiçbir şeyi iyileştirmemesi sorundu. Yalnızca metni kullanan bir model 148 civarında bir MSE’de tıkandı ve TF-IDF bu sinyali zaten yakalıyordu. Bıraktım. Her adımı ölçülen skoru başlığında yazılı ayrı bir betikte tutmak, bunu batık maliyet tartışmasına değil kolay bir karara çevirdi.

## Buradan öğrendiklerim

- **Asıl model doğrulama tasarımı.** Çevrimdışı skorum test seti gibi davranmaya başlayınca özellik, model ve hiperparametre seçmek sıradan bir mühendislik işine döndü.
- **Yalnızca eğitim setine değil, test setine de bakın.** Yıl kaymasını bulmak için etiket gerekmedi, iki dosyada birer `value_counts()` yetti.
- **Çeşitlilik tek güçlü modeli geçer.** Yığın, içindeki en iyi modeli dört MSE puanından fazla geçti.
- **Skoru dosyanın içine yazın.** Her betik ürettiği sayılarla başlıyor, bu yüzden hangi fikrin işe yaradığını ve hangisinin yaramadığını hâlâ görebiliyorum.

Tüm betikler [GitHub’da](https://github.com/omerdm34/datathon-2026). Model kaydının tamamı [proje detayında](/tr/projects/datathon-2026/).
