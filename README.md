# 🎬 Project Bolt: AI-Based Movie & TV Recommendation System

Project Bolt is an AI-powered recommendation engine designed to analyze user ratings of movies and TV series to generate personalized viewing suggestions. It combines deep learning models with real-time API integrations for accurate and engaging recommendations.

---

## 🚀 Features

- 📊 **User Profiling**: Automatically detects genres, years, and types the user prefers.
- 🧠 **Neural Collaborative Filtering (NCF)**: Advanced model for personalized recommendations.
- 📦 **TMDB API Integration**: Enriches content with genres, titles, years, and ratings.
- 📺 **React + Tailwind Frontend**: Clean and fast UI to display recommendations.
- 🌐 **API-ready** backend for real-time inference.

---

## 🛠️ Technologies

| Layer        | Tech Stack                            |
|--------------|----------------------------------------|
| Frontend     | React, TypeScript, TailwindCSS         |
| Backend API  | Python, FastAPI or Flask               |
| ML Model     | TensorFlow/Keras (NCF)                 |
| Data Source  | TMDB API (https://www.themoviedb.org/) |

---

## 📁 Project Structure

```bash
project/
├── recommendation_system/
│   ├── train_model.py          # Trains NCF model
│   ├── ncf_model.py            # Defines model architecture
│   ├── recommendation_server.py # API backend (Flask/FastAPI)
│   ├── NCF_Training_Notebook.ipynb
├── src/                        # React Frontend
│   ├── App.tsx
│   ├── hooks/                  # Custom hooks for profile + recommendations
│   ├── services/               # TMDB API service
├── index.html
├── package.json
```

---

## 📦 Installation

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/project-bolt.git
cd project-bolt
```

### 2. Install dependencies

#### Frontend
```bash
cd project
npm install
```

#### Backend / ML
```bash
cd project/recommendation_system
pip install -r requirements.txt
```

---

## ⚙️ Environment Setup

Create a `.env` file with your TMDB credentials:

```bash
VITE_TMDB_API_KEY=your_api_key
VITE_TMDB_ACCESS_TOKEN=your_access_token
```

---

## 🧠 Train Your Model

Convert your ratings into the correct format and run:

```bash
python train_model.py --data ratings.json --output my_model.h5
```

---

## 🧪 Run the App

### Backend
```bash
python recommendation_server.py
```

### Frontend
```bash
npm run dev
```

---

## 🤝 Contributing

PRs and suggestions are welcome. Let's build smarter recommendation systems together!

---

## 📜 License

MIT © Solo.Han
