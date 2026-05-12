# 🎓 Smart Study Assistant

> AI-powered learning platform with RAG, automatic quizzes, and flashcards

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://smart-study-iota-lilac.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Python](https://img.shields.io/badge/python-3.12-blue)](https://python.org)
[![Django](https://img.shields.io/badge/django-5.0-green)](https://djangoproject.com)
[![React](https://img.shields.io/badge/react-18-blue)](https://react.dev)
[![Status](https://img.shields.io/badge/status-active-success)](https://smart-study-iota-lilac.vercel.app)

## 🌐 Live Demo

🚀 **Try it now:** [smart-study-iota-lilac.vercel.app](https://smart-study-iota-lilac.vercel.app)

📡 **API:** [smart-study-assistant-10x4.onrender.com](https://smart-study-assistant-10x4.onrender.com)

## ✨ Features

- 🔐 **Email-based Authentication** — JWT with refresh tokens
- 📚 **Document Upload** — PDF, DOCX, TXT with drag & drop (max 10MB)
- 💬 **AI Chat (RAG)** — Chat with your documents using Google Gemini
- 🎯 **Auto Quiz Generation** — AI creates 5-20 multiple-choice questions
- 🎴 **Smart Flashcards** — AI-generated cards with 3D flip animation
- 🎓 **Project Info Chat** — AI assistant about the project itself
- 🌍 **Multi-language** — Uzbek, English, Russian
- 🌙 **Dark Mode** — Beautiful UI with theme switcher
- 📱 **Mobile Responsive** — Works perfectly on all devices

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 5.0.6 + Django REST Framework 3.15.1
- **Authentication:** JWT (djangorestframework-simplejwt)
- **Database:** PostgreSQL 16 (production), SQLite (development)
- **AI Model:** Google Gemini 2.5 Flash
- **Embeddings:** Gemini text-embedding-004 (768-dim)
- **Vector Search:** FAISS (Facebook AI Similarity Search)
- **PDF Generation:** ReportLab
- **Production Server:** Gunicorn + WhiteNoise

### Frontend
- **Framework:** React 18.3.1 + Vite 5.4.11
- **Styling:** Tailwind CSS 3.4.17
- **State Management:** Zustand 5.0.2
- **HTTP Client:** Axios with JWT interceptors
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router v7
- **Icons:** Lucide React
- **i18n:** react-i18next (3 languages)

### DevOps
- **Backend Hosting:** Render.com
- **Frontend Hosting:** Vercel
- **Database:** Render PostgreSQL
- **CI/CD:** GitHub Actions (auto-deploy)

## 📐 Architecture

\`\`\`
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Frontend   │ ──────> │   Backend    │ ──────> │   Gemini AI  │
│ (React+Vite) │  HTTPS  │  (Django)    │   API   │   2.5 Flash  │
│   Vercel     │         │   Render     │         │              │
└──────────────┘         └──────┬───────┘         └──────────────┘
                                │
                    ┌───────────┴────────────┐
                    │                        │
              ┌─────▼─────┐         ┌────────▼────────┐
              │PostgreSQL │         │  FAISS Index    │
              │  Render   │         │  (Vector Store) │
              └───────────┘         └─────────────────┘
\`\`\`

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 20+
- Google Gemini API Key

### Backend Setup

\`\`\`bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\\Scripts\\activate    # Windows

pip install -r requirements.txt

# Copy env file
cp .env.example .env
# Add your GEMINI_API_KEY

python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
\`\`\`

### Frontend Setup

\`\`\`bash
cd frontend
npm install

# Set API URL in .env
echo "VITE_API_URL=http://127.0.0.1:8000/api/v1" > .env

npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173)

### Docker (Optional)

\`\`\`bash
docker-compose up --build
\`\`\`

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## 📁 Project Structure

\`\`\`
smart-study-assistant/
├── backend/                    # Django backend
│   ├── apps/
│   │   ├── users/             # Custom User Model + Auth
│   │   ├── documents/         # Document upload & parsing
│   │   ├── ai_chat/           # RAG chat + Project Info
│   │   ├── quizzes/           # AI Quiz Generator
│   │   └── flashcards/        # AI Flashcards
│   ├── config/                # Django settings (split)
│   ├── docs/                  # Project documentation
│   ├── requirements.txt
│   └── manage.py
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/              # Axios + API functions
│   │   ├── components/       # Reusable components
│   │   ├── pages/            # Route pages (10+)
│   │   ├── store/            # Zustand state
│   │   ├── routes/           # Route protection
│   │   └── i18n/             # Translations
│   └── vite.config.js
│
├── docker-compose.yml
├── .gitignore
└── README.md
\`\`\`

## 🔑 Environment Variables

### Backend (.env)
\`\`\`env
SECRET_KEY=your-secret-key
DEBUG=True
GEMINI_API_KEY=your-gemini-api-key
DATABASE_URL=postgres://user:pass@localhost:5432/db
FRONTEND_URL=http://localhost:5173
ALLOWED_HOSTS=localhost,127.0.0.1
\`\`\`

### Frontend (.env)
\`\`\`env
VITE_API_URL=http://127.0.0.1:8000/api/v1
\`\`\`

## 📚 API Documentation

Main endpoints under \`/api/v1/\`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`/auth/register/\` | POST | Create new account |
| \`/auth/login/\` | POST | Login (returns JWT) |
| \`/auth/profile/\` | GET/PATCH | User profile |
| \`/documents/\` | GET/POST | List/Upload documents |
| \`/chat/sessions/\` | GET/POST | Chat sessions |
| \`/chat/sessions/{id}/ask/\` | POST | Ask AI about document |
| \`/chat/project-info/ask/\` | POST | Project info chat ⭐ |
| \`/quizzes/generate/\` | POST | Generate AI quiz |
| \`/quizzes/{id}/submit/\` | POST | Submit quiz answers |
| \`/flashcards/generate/\` | POST | Generate flashcards |

## 🎓 Academic Context

This project was developed as a graduation thesis demonstrating:

- ✅ Modern full-stack web development
- ✅ AI/ML integration (RAG, Vector Search, LLM)
- ✅ Production deployment (CI/CD, cloud hosting)
- ✅ Clean architecture (separation of concerns)
- ✅ Security best practices (JWT, CORS, HTTPS)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit changes (\`git commit -m 'Add AmazingFeature'\`)
4. Push to branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See \`LICENSE\` for more information.

## 👥 Authors

**Kamronbek Yusupov** - Co-developer
**Bexruz Shakarov** - Co-developer

- GitHub: [@bexruz0708](https://github.com/bexruz0708)
- Email: bexruzshakarov7@gmail.com

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) — AI model
- [FAISS](https://github.com/facebookresearch/faiss) — Vector search
- [Django](https://djangoproject.com) — Web framework
- [React](https://react.dev) — UI library
- [Lucide Icons](https://lucide.dev/) — Beautiful icons

---

⭐ **If this project helped you, please give it a star!** ⭐

Built with ❤️ in 2026
