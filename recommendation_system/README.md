# Neural Collaborative Filtering Recommendation System

Bu proje, React tabanlı film/dizi keşif uygulaması için Neural Collaborative Filtering (NCF) kullanarak kişiselleştirilmiş öneri sistemi sağlar.

## 🎯 Özellikler

- **5 Yıldızlı Puanlama Sistemi**: Kullanıcılar içerikleri 1-5 yıldız arasında puanlayabilir
- **Neural Collaborative Filtering**: TensorFlow/Keras ile geliştirilmiş derin öğrenme modeli
- **Gerçek Zamanlı Öneriler**: Kullanıcı davranışına dayalı kişiselleştirilmiş öneriler
- **Veri Dışa Aktarma**: Puanlama verilerini JSON formatında dışa aktarma
- **REST API**: Python Flask sunucusu ile öneri servisi
- **Jupyter Notebook**: Adım adım model eğitimi ve analiz

## 📁 Proje Yapısı

```
recommendation_system/
├── ncf_model.py                 # Ana NCF model sınıfı
├── train_model.py              # Model eğitim scripti
├── recommendation_server.py    # Flask API sunucusu
├── NCF_Training_Notebook.ipynb # Jupyter notebook
├── requirements.txt            # Python bağımlılıkları
└── README.md                   # Bu dosya
```

## 🚀 Kurulum

### 1. Python Ortamını Hazırlayın

```bash
# Sanal ortam oluşturun
python -m venv ncf_env

# Sanal ortamı aktifleştirin
# Windows:
ncf_env\Scripts\activate
# macOS/Linux:
source ncf_env/bin/activate

# Bağımlılıkları yükleyin
pip install -r requirements.txt
```

### 2. React Uygulamasından Veri Toplayın

1. React uygulamasında içerikleri puanlayın
2. "AI Engine" sekmesinde "Export Data" butonuna tıklayın
3. İndirilen `ratings.json` dosyasını bu klasöre kopyalayın

## 📊 Model Eğitimi

### Jupyter Notebook ile (Önerilen)

```bash
jupyter notebook NCF_Training_Notebook.ipynb
```

Notebook'u açın ve hücreleri sırayla çalıştırın. Notebook şunları içerir:
- Veri keşfi ve görselleştirme
- Model mimarisi açıklaması
- Eğitim süreci
- Performans değerlendirmesi
- Örnek öneriler

### Komut Satırı ile

```bash
python train_model.py --data ratings.json --output ncf_model.h5 --epochs 100
```

Parametreler:
- `--data`: Puanlama verisi JSON dosyası
- `--output`: Çıktı model dosyası
- `--epochs`: Eğitim epoch sayısı
- `--batch_size`: Batch boyutu
- `--embedding_size`: Embedding vektör boyutu

## 🌐 API Sunucusu

### Sunucuyu Başlatın

```bash
python recommendation_server.py --model ncf_model.h5 --port 5000
```

### API Endpoints

#### 1. Sağlık Kontrolü
```http
GET /health
```

#### 2. Kullanıcı Önerileri
```http
POST /recommend
Content-Type: application/json

{
  "userId": "user_123",
  "numRecommendations": 10
}
```

#### 3. Puanlama Tahmini
```http
POST /predict
Content-Type: application/json

{
  "userId": "user_123",
  "itemId": 456
}
```

#### 4. Model Yeniden Eğitimi
```http
POST /train
Content-Type: application/json

{
  "ratings": [
    {"userId": "user_1", "itemId": 1, "rating": 5, "timestamp": 1234567890, "contentType": "movie"}
  ]
}
```

## 🧠 Model Mimarisi

Neural Collaborative Filtering modeli şu katmanlardan oluşur:

1. **Embedding Katmanları**: Kullanıcı ve içerik ID'lerini dense vektörlere dönüştürür
2. **Concatenation**: Kullanıcı ve içerik vektörlerini birleştirir
3. **Dense Katmanlar**: Gizli katmanlar (varsayılan: 128, 64 nöron)
4. **Dropout**: Overfitting'i önlemek için
5. **Çıkış Katmanı**: 1-5 arası puanlama tahmini

```python
# Model parametreleri
embedding_size = 50      # Embedding vektör boyutu
hidden_units = [128, 64] # Gizli katman boyutları
dropout_rate = 0.2       # Dropout oranı
learning_rate = 0.001    # Öğrenme oranı
```

## 📈 Performans Metrikleri

Model performansı şu metriklerle değerlendirilir:
- **MSE (Mean Squared Error)**: Ortalama kare hata
- **MAE (Mean Absolute Error)**: Ortalama mutlak hata
- **RMSE (Root Mean Squared Error)**: Kök ortalama kare hata

Tipik performans değerleri:
- RMSE: 0.8-1.2 (iyi performans)
- MAE: 0.6-0.9 (iyi performans)

## 🔧 React Entegrasyonu

### Frontend'de API Kullanımı

```javascript
// Kullanıcı önerileri al
const getRecommendations = async (userId) => {
  const response = await fetch('http://localhost:5000/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, numRecommendations: 10 })
  });
  return response.json();
};

// Puanlama tahmini
const predictRating = async (userId, itemId) => {
  const response = await fetch('http://localhost:5000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId })
  });
  return response.json();
};
```

## 📝 Veri Formatı

### Puanlama Verisi (ratings.json)
```json
{
  "ratings": [
    {
      "userId": "user_123",
      "itemId": 456,
      "rating": 4,
      "timestamp": 1234567890,
      "contentType": "movie"
    }
  ],
  "users": ["user_123", "user_456"],
  "items": [456, 789, 123]
}
```

## 🎛️ Hiperparametre Ayarlama

Model performansını artırmak için şu parametreleri ayarlayabilirsiniz:

```python
# Model mimarisi
embedding_size = 50        # 32-128 arası deneyin
hidden_units = [128, 64]   # Katman sayısı ve boyutları
dropout_rate = 0.2         # 0.1-0.5 arası

# Eğitim parametreleri
learning_rate = 0.001      # 0.0001-0.01 arası
batch_size = 256           # 64-512 arası
epochs = 100               # Early stopping ile
```

## 🚨 Sorun Giderme

### Yaygın Hatalar

1. **"Model not loaded" hatası**
   - Model dosyasının doğru yolda olduğundan emin olun
   - Encoder dosyalarının da mevcut olduğunu kontrol edin

2. **"User/Item not found" hatası**
   - Yeni kullanıcılar için varsayılan öneriler döndürülür
   - Model yeniden eğitilerek yeni kullanıcılar eklenebilir

3. **Düşük performans**
   - Daha fazla veri toplayın (minimum 20 kullanıcı, 15 içerik)
   - Hiperparametreleri ayarlayın
   - Embedding boyutunu artırın

### Performans İyileştirme

1. **Veri Kalitesi**
   - Daha fazla kullanıcı puanlaması toplayın
   - Puanlama dağılımının dengeli olmasını sağlayın

2. **Model Karmaşıklığı**
   - Daha derin ağlar deneyin
   - Regularization teknikleri ekleyin

3. **Özellik Mühendisliği**
   - İçerik türü, tür, yıl gibi ek özellikler ekleyin
   - Kullanıcı demografik bilgileri dahil edin

## 📚 Ek Kaynaklar

- [Neural Collaborative Filtering Paper](https://arxiv.org/abs/1708.05031)
- [TensorFlow Recommenders](https://www.tensorflow.org/recommenders)
- [Collaborative Filtering Guide](https://developers.google.com/machine-learning/recommendation)

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.