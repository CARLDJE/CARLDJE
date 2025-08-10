# Kalori Sayar

Basit, tek sayfalık bir uygulama: günlük kalori takibi, BKI ve TDEE (günlük kalori ihtiyacı) hesaplama.

## Çalıştırma

Statik bir site. Herhangi bir sunucu ile servis edebilirsiniz.

- Python basit sunucu:

```bash
python3 -m http.server 5173 --directory ./
```

Ardından tarayıcıda `http://localhost:5173/kalori-sayar/` adresini açın (Workspace köküne göre).

- Node ile (opsiyonel):

```bash
npx serve -l 5173 .
```

## Özellikler
- Günlük kalori ekleme/silme, son 7 gün mini grafik (localStorage).
- BKI hesaplama ve kategori/ideal kilo aralığı.
- TDEE hesaplama (Mifflin-St Jeor) ve basit hedef önerileri.

Not: Tüm veriler tarayıcıda localStorage'da tutulur.