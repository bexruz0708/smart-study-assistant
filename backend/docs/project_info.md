# Smart Study Assistant - Loyiha Hujjati

## Umumiy ma'lumot

**Smart Study Assistant** - bu AI yordamida o'rganish platformasi. Foydalanuvchilar PDF/Word hujjatlarini yuklab, ulardagi mavzular haqida AI bilan suhbatlasha oladi, avtomatik testlar va flashkartalar yarata oladi.

Loyiha **diplom ishi** sifatida ishlab chiqilgan. Hozirgi paytda **to'liq tayyor** va internetda **jonli** ishlamoqda.

## Loyiha holati

✅ **Backend - to'liq tayyor**
✅ **Frontend - to'liq tayyor**
✅ **Internetda jonli (deployed)**
✅ **AI funksiyalari ishlamoqda**

## Live URL'lar

- **Frontend (Vercel):** https://smart-study-iota-lilac.vercel.app
- **Backend API (Render):** https://smart-study-assistant-10x4.onrender.com

## Texnologiyalar Stack

### Backend
- **Framework:** Django 5.0.6
- **API:** Django REST Framework 3.15.1
- **Authentication:** JWT (djangorestframework-simplejwt) - 60 daqiqa access, 7 kun refresh
- **Database:** SQLite (dev), PostgreSQL (production)
- **AI Model:** Google Gemini 2.5 Flash
- **Vector Search:** FAISS (Facebook AI Similarity Search)
- **Embeddings:** Gemini text-embedding-004 (768 dimensions)
- **Document Parsing:** pypdf, python-docx
- **PDF Generation:** ReportLab
- **Production Server:** Gunicorn + WhiteNoise

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 5.4.11
- **Styling:** Tailwind CSS 3.4.17
- **State Management:** Zustand 5.0.2
- **HTTP Client:** Axios (with JWT interceptors)
- **Forms:** React Hook Form + Zod validation
- **Routing:** React Router v7
- **Icons:** Lucide React
- **Markdown:** react-markdown + remark-gfm
- **Notifications:** Sonner (toast)
- **i18n:** react-i18next (Uzbek/English/Russian)

### DevOps
- **Backend Hosting:** Render.com (Free tier)
- **Frontend Hosting:** Vercel (Free tier)
- **Database Hosting:** Render PostgreSQL
- **Version Control:** Git + GitHub
- **CI/CD:** Avtomatik deploy GitHub push'dan

## Loyiha Strukturasi
smart-study-assistant/
├── backend/
│   ├── apps/
│   │   ├── users/          # Custom User Model + JWT Auth
│   │   ├── documents/      # PDF/DOCX upload va parsing
│   │   ├── ai_chat/        # RAG chat + Project Info
│   │   ├── quizzes/        # AI Quiz Generator
│   │   └── flashcards/     # AI Flashcards
│   ├── config/
│   │   └── settings/       # base.py, development.py, production.py
│   ├── docs/
│   │   └── project_info.md # Bu fayl - AI uchun
│   ├── requirements.txt
│   └── manage.py
└── frontend/
└── src/
├── api/            # Axios + endpoint functions
├── components/     # UI komponentlar
├── pages/          # Sahifalar (10+ ta)
├── store/          # Zustand stores
├── routes/         # Protected/Public routes
└── i18n/           # Tarjimalar (uz/en/ru)
## Database Modellari

### 1. User (Custom)
Standart Django User o'rniga email-asoslangan custom model.
- `email` (unique, indexed)
- `first_name`, `last_name`
- `is_verified`, `is_active`, `is_staff`
- `date_joined`
- `USERNAME_FIELD = 'email'`

### 2. Document
- `user` (FK)
- `file`, `title`, `file_type` (PDF/DOCX/TXT)
- `extracted_text`, `page_count`, `word_count`
- `status` (PENDING/PROCESSING/COMPLETED/FAILED)

### 3. ChatSession
- `user` (FK), `document` (FK, nullable)
- `session_type` (DOCUMENT / PROJECT_INFO)
- `title`, `is_indexed`

### 4. Message
- `session` (FK)
- `role` (USER / ASSISTANT)
- `content`, `sources` (JSON), `tokens_used`

### 5. Quiz + Question + QuizAttempt
- AI yordamida yaratilgan testlar
- 4 ta variantli savollar (A/B/C/D)
- Foydalanuvchi javoblari va natijalar

### 6. FlashcardDeck + Flashcard
- AI yordamida yaratilgan kartochkalar
- Front/Back format
- Review statistics (correct/incorrect count)

## API Endpoints

Barcha endpoint'lar `/api/v1/` ostida.

### Authentication
- `POST /auth/register/` - Ro'yxatdan o'tish
- `POST /auth/login/` - Kirish (JWT qaytaradi)
- `POST /auth/logout/` - Chiqish (refresh token blacklist)
- `POST /auth/token/refresh/` - Token yangilash
- `GET/PATCH /auth/profile/` - Profil
- `POST /auth/change-password/` - Parol o'zgartirish

### Documents
- `GET/POST /documents/` - Ro'yxat / Yuklash
- `GET/DELETE /documents/{id}/` - Detail / O'chirish
- `POST /documents/{id}/reprocess/` - Qayta parse

### AI Chat (RAG)
- `GET/POST /chat/sessions/` - Sessiyalar
- `GET/DELETE /chat/sessions/{id}/` - Detail
- `POST /chat/sessions/{id}/ask/` - PDF haqida savol
- `POST /chat/project-info/ask/` - **Loyiha haqida savol** ⭐
- `GET /chat/sessions/{id}/messages/` - Xabarlar

### Quizzes (AI)
- `GET/POST /quizzes/` - Ro'yxat
- `POST /quizzes/generate/` - AI bilan yaratish
- `POST /quizzes/{id}/submit/` - Javoblarni yuborish
- `GET /quizzes/attempts/` - Urinishlar tarixi
- `GET /quizzes/attempts/{id}/pdf/` - PDF eksport

### Flashcards (AI)
- `GET/POST /flashcards/` - Ro'yxat
- `POST /flashcards/generate/` - AI bilan yaratish
- `POST /flashcards/cards/{id}/review/` - Karta ko'rilgan

## RAG (Retrieval Augmented Generation)

RAG - AI'ning umumiy bilimi bilan emas, **foydalanuvchi hujjatlari** asosida javob berishini ta'minlovchi texnologiya.

### Ishlash jarayoni:

1. **Document Upload** - foydalanuvchi PDF yuklaydi
2. **Text Extraction** - `pypdf` bilan matn ajratiladi
3. **Chunking** - matn 500 so'zli bo'laklarga bo'linadi (50 so'z overlap bilan)
4. **Embedding** - har bir chunk Gemini text-embedding-004 orqali 768-dimensional vektor'ga aylantiriladi
5. **Indexing** - vektorlar FAISS indeksiga saqlanadi
6. **Question** - foydalanuvchi savol beradi
7. **Search** - savol ham vektor'ga aylantiriladi, FAISS eng yaqin 3 ta chunk'ni topadi
8. **Prompt** - Gemini'ga "kontekst + savol" yuboriladi
9. **Answer** - Gemini faqat kontekst asosida javob beradi

### Project Info Chat (maxsus)

Bu sahifa - loyihaning o'zi haqida savollarga javob berish uchun maxsus tayyorlangan. Diplom himoyasida professor istalgan texnik savolni berishi mumkin, AI loyihaning hujjati (bu fayl) asosida professional javob beradi.

## Frontend Sahifalari (10+ ta)

1. **Landing/Login** - Chiroyli auth sahifa (gradient design)
2. **Register** - Parol kuchi indikatori bilan
3. **Dashboard** - Statistika kartochkalari, so'nggi hujjatlar
4. **Documents** - Drag & drop upload, qidiruv, grid view
5. **AI Chat** - ChatGPT'ga o'xshash interface, sources accordion
6. **Project Info Chat** - Tavsiya etilgan savollar bilan ⭐
7. **Quizzes** - AI bilan test yaratish, ishlash, natija
8. **Quiz Detail** - Bosqichma-bosqich test, PDF eksport
9. **Flashcards** - 3D flip animatsiya, "Bildim/Bilmadim"
10. **Profile** - Ma'lumot va parol o'zgartirish, tab'lar bilan

### UI/UX xususiyatlari
- **Dark mode** - to'liq qo'llab-quvvatlanadi
- **Multi-language** - O'zbekcha, English, Русский
- **Responsive** - mobil qurilmalar uchun moslangan
- **Animations** - Framer Motion + Tailwind animations
- **Toast notifications** - Sonner bilan
- **Form validation** - React Hook Form + Zod

## Xavfsizlik

- **JWT Authentication** - access (60 min) + refresh (7 days)
- **Token Refresh** - frontend axios interceptor avtomatik yangilaydi
- **Token Blacklist** - logout'da refresh token bloklanadi
- **Password Hashing** - Django PBKDF2 (default)
- **CORS** - faqat ruxsat etilgan domenlar
- **HTTPS** - Vercel va Render avtomatik
- **CSRF Protection** - Django default
- **SQL Injection** - Django ORM oldini oladi
- **XSS Protection** - React JSX avtomatik escape qiladi

## Production Deploy

### Backend (Render.com)
- **Service Type:** Web Service (Free tier)
- **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- **Start Command:** `gunicorn config.wsgi:application --workers 1 --timeout 180`
- **Environment Variables:**
  - `SECRET_KEY`
  - `DATABASE_URL` (PostgreSQL)
  - `GEMINI_API_KEY`
  - `ALLOWED_HOSTS`
  - `CORS_ALLOWED_ORIGINS`
- **Auto-deploy** GitHub push'dan

### Frontend (Vercel)
- **Framework Preset:** Vite
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_URL` (Render backend URL)
- **vercel.json** - SPA routing uchun rewrites
- **Auto-deploy** GitHub push'dan

### Database (PostgreSQL)
- Render-managed PostgreSQL (Free tier)
- 1 GB storage, 90 kun retention
- Automatic backups

## Performance Optimizations

- **FAISS** - million vektorlar orasidan millisekundlarda qidiruv
- **Singleton Pattern** - Embedding model bir marta yuklanadi
- **WhiteNoise** - static files samarali yetkaziladi
- **PostgreSQL Connection Pool** - `conn_max_age=600`
- **Lazy Loading** - frontend route'lari kerakli paytda yuklanadi
- **React Query** - API caching (planned for v2)

## FAQ - Tez-tez beriladigan savollar

### Savol: Bu loyihani o'zing yozdingmi yoki AI'dan foydalandingmi?

**Javob:** AI yordamida (Cursor, Claude). Bu **zamonaviy dasturchi yondashuvi**. Lekin har bir kod qatorini tushunaman va loyihaning butun arxitekturasini bilaman. Buni isbotlash uchun maxsus **Project Info Chat** sahifasini yaratdim - istalgan texnik savolingizga javob bera olaman.

### Savol: Custom User Model nima uchun yaratilgan?

**Javob:** Standart Django User'da `username` maydoni majburiy. Zamonaviy saytlarda esa email bilan login qilinadi. Custom User Model orqali email-asoslangan auth qildim. Bu **Django'ning rasmiy tavsiyasi** (https://docs.djangoproject.com/en/5.0/topics/auth/customizing/#using-a-custom-user-model-when-starting-a-project).

### Savol: JWT vs Session - farqi nima?

**Javob:** 
- **Session** - server'da saqlanadi, har request'da database'ga query
- **JWT** - stateless, server'da hech narsa saqlanmaydi, signature tekshiriladi
- **JWT** mobile apps va SPA'lar uchun yaxshiroq
- Loyihada **JWT** ishlatildi chunki frontend (React) va backend alohida

### Savol: RAG nima va nega ishlatdingiz?

**Javob:** RAG (Retrieval Augmented Generation) - AI'ning umumiy bilimi bilan emas, **mening hujjatlarim** asosida javob berishini ta'minlaydi. Bu:
- Aniq va to'g'ri javoblar
- Manba ko'rsatish imkoniyati (sources)
- Maxfiy/maxsus ma'lumotlar bilan ishlash
- Hallucination'ni kamaytirish (AI o'ylab topilgan ma'lumot bermaydi)

### Savol: FAISS o'rniga ChromaDB ishlatish mumkinmi?

**Javob:** Ha. ChromaDB - bu **vector database**, FAISS esa **library**. Loyihada FAISS'ni tanladim chunki:
- Tezroq (Facebook tomonidan optimallashtirilgan)
- Hech qanday server kerak emas (oddiy fayl)
- Free tier'da yaxshi ishlaydi
- 100K dan kam vektorlar uchun yetarli

Katta loyiha bo'lganida Pinecone yoki ChromaDB tanlardim.

### Savol: Frontend uchun nima ishlatdingiz?

**Javob:** **React 18 + Vite + Tailwind CSS**. State uchun **Zustand** (Redux'dan oddiy va kichikroq). API uchun **Axios + JWT interceptor** (token avtomatik refresh). Forms uchun **React Hook Form + Zod** validation. Icons uchun **Lucide React**.

Zamonaviy stack, **production-ready** va junior dasturchi ham tushunadigan darajada toza.

### Savol: Loyihaning xavfsizlik tomonlari qanday?

**Javob:** Bir necha qatlamli:
1. **Auth** - JWT (HMAC-SHA256 signed)
2. **Password** - PBKDF2 hash
3. **HTTPS** - Render va Vercel avtomatik
4. **CORS** - faqat ruxsat etilgan domenlar
5. **CSRF** - Django default
6. **SQL Injection** - ORM oldini oladi
7. **XSS** - React JSX escape qiladi
8. **Rate Limiting** - DRF throttling (planned)

### Savol: Kelajakda nima qo'shasiz?

**Javob:**
- **WebSockets** (Django Channels) - real-time chat streaming
- **Celery + Redis** - background tasks (PDF parsing katta fayllar uchun)
- **Mobile App** - React Native
- **Voice Input** - savol ovoz bilan berish
- **Video Support** - YouTube transcripts bilan ishlash
- **Collaborative Learning** - bir nechta foydalanuvchi bir hujjatda ishlash
- **Gamification** - ballar, leaderboards
- **OAuth** - Google/Apple bilan login

### Savol: Deploy qaerda?

**Javob:**
- **Frontend:** Vercel.com (https://smart-study-iota-lilac.vercel.app)
- **Backend:** Render.com (https://smart-study-assistant-10x4.onrender.com)
- **Database:** Render PostgreSQL
- **CI/CD:** GitHub push → avtomatik deploy

Ikkalasi ham **bepul tier** ishlatdim. Production'da Tier 1 ($7/oy) kerak bo'lardi.

### Savol: Tabriqlar! Va biror kamchilik bormi?

**Javob:** Albatta, bu **MVP** (Minimum Viable Product). Yaxshilash kerak:
- **Rate limiting** - DDOS himoyasi
- **Monitoring** - Sentry yoki LogRocket
- **Tests** - unit tests va integration tests
- **Caching** - Redis bilan
- **Error tracking** - production'da xatolarni kuzatish
- **Analytics** - foydalanuvchi xatti-harakatini o'rganish
- **A/B Testing** - UX yaxshilash uchun

Lekin **diplom uchun yetarli** va asosiy konseptni isbotlaydi.

## Akademik Konteks

Bu loyiha [Universitet nomi] uchun **diplom ishi** sifatida ishlab chiqilgan. Quyidagilarni namoyish etadi:

- ✅ **Modern web development** (React, Django REST)
- ✅ **AI/ML integration** (RAG, Vector Search, LLM)
- ✅ **Production deployment** (Docker-ready, CI/CD)
- ✅ **Clean architecture** (separation of concerns)
- ✅ **Security best practices** (JWT, CORS, HTTPS)
- ✅ **DevOps** (GitHub, Render, Vercel)

## Muallif

**Bexruz Shakarov**
- GitHub: https://github.com/bexruz0708/smart-study-assistant
- Email: bexruzshakarov7@gmail.com
- University: [Universitet nomi]
- Year: 2026

---

**Smart Study Assistant** - AI yordamida o'rganishni qulayroq, samaraliroq va qiziqarliroq qiluvchi platforma.