# Smart Study Assistant - Loyiha Haqida

## Loyiha nomi
Smart Study Assistant - AI yordamida o'rganish platformasi

## Maqsad
Talabalar uchun AI yordamchi yaratish, ular yuklagan o'quv materiallari (PDF, Word) asosida:
- AI bilan suhbat qilish
- Avtomatik test yaratish
- Flashkartalar tuzish
- O'rganish jarayonini tezlashtirish

## Muallif
Bexruz Shakarov - Universitet talabasi (2-kurs)

## Texnologiyalar Stack

### Backend
- **Framework:** Django 5.0.6
- **API:** Django REST Framework 3.15.1
- **Authentication:** JWT (djangorestframework-simplejwt 5.3.1)
- **Til:** Python 3.12.8
- **Sintaksis:** Object-Oriented Programming (OOP)

### Database
- **Development:** SQLite 3 (lokal ishlash uchun)
- **Production:** PostgreSQL 15 (kelajakda server uchun)
- **ORM:** Django ORM (SQL yozmasdan ishlash imkoniyati)

### AI va Machine Learning
- **LLM (Language Model):** Google Gemini 1.5 Flash (bepul, tez)
- **Embedding Model:** Sentence Transformers (paraphrase-multilingual-MiniLM-L12-v2)
- **Vector Database:** FAISS (Facebook AI Similarity Search)
- **RAG Framework:** LangChain 0.2.5
- **Document Parsing:** pypdf 4.2.0, python-docx 1.1.2

### Frontend (kelayotgan bosqich)
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **HTTP Client:** Axios

### DevOps
- **Containerization:** Docker + Docker Compose
- **Version Control:** Git + GitHub
- **API Testing:** REST Client (VS Code)

## Loyiha Arxitekturasi

### Folder Structure (Senior-level)
smart-study-assistant/
├── backend/
│   ├── apps/                    # Barcha Django app'lar
│   │   ├── users/              # Foydalanuvchilar
│   │   ├── documents/          # Hujjatlar
│   │   ├── ai_chat/            # AI suhbat
│   │   ├── quizzes/            # Testlar (kelayotgan)
│   │   └── flashcards/         # Flashkartalar (kelayotgan)
│   ├── core/                    # Umumiy yordamchi kod
│   ├── config/
│   │   └── settings/
│   │       ├── base.py         # Umumiy sozlamalar
│   │       ├── development.py  # Lokal
│   │       └── production.py   # Server
│   ├── manage.py
│   └── .env                     # Maxfiy sozlamalar
└── frontend/                    # React app (kelayotgan)
### Settings Architecture
Loyihada **3 qismli settings** ishlatildi (Senior best practice):
- `base.py` - umumiy
- `development.py` - lokal (DEBUG=True, SQLite)
- `production.py` - server (DEBUG=False, PostgreSQL, SSL)

## Database Modellari

### 1. User (Custom)
**Fayl:** `apps/users/models.py`

Standart Django User'dan farqli — **email bilan login** qiladi (username yo'q):
- `email` (unique, indexed)
- `first_name`, `last_name`
- `avatar` (ImageField)
- `is_active`, `is_staff`, `is_verified`
- `date_joined`

**Maxsus:** `AbstractBaseUser + PermissionsMixin` dan meros olingan, parol PBKDF2-SHA256 bilan HASH qilinadi.

### 2. Document
**Fayl:** `apps/documents/models.py`

Foydalanuvchi yuklagan fayllar:
- `user` (ForeignKey - User)
- `title`, `file`
- `file_type` (PDF, DOCX, TXT)
- `file_size`, `page_count`, `word_count`
- `extracted_text` - PDF/Word'dan ajratilgan matn
- `status` (PENDING, PROCESSING, COMPLETED, FAILED)

**Indekslar:** `(user, -created_at)` va `(status)` - tezkor qidirish uchun.

### 3. ChatSession
**Fayl:** `apps/ai_chat/models.py`

AI bilan suhbat sessiyalari:
- `user`, `document`
- `session_type` (DOCUMENT, PROJECT_INFO) - 2 rejim
- `is_indexed` - FAISS bazasida indekslanganmi
- `title`

### 4. Message
**Fayl:** `apps/ai_chat/models.py`

Suhbatdagi xabarlar:
- `session` (ForeignKey)
- `role` (USER, ASSISTANT)
- `content` - matn
- `sources` (JSONField) - qaysi PDF qismlaridan foydalanilgan
- `tokens_used` - AI token soni

## API Endpoints (REST API)

Barcha API'lar `/api/v1/` prefiksi bilan boshlanadi (versioning).

### Authentication (`/api/v1/auth/`)
- `POST /register/` - Ro'yxatdan o'tish
- `POST /login/` - Kirish (email + parol)
- `POST /logout/` - Chiqish (token blacklist)
- `POST /token/refresh/` - Access token yangilash
- `GET/PATCH /profile/` - Profil ko'rish/tahrirlash
- `POST /change-password/` - Parol o'zgartirish

### Documents (`/api/v1/documents/`)
- `GET /` - Hujjatlar ro'yxati
- `POST /` - Yangi PDF/Word yuklash
- `GET /{id}/` - Bitta hujjat
- `DELETE /{id}/` - O'chirish
- `POST /{id}/reprocess/` - Qayta parse qilish

### AI Chat (`/api/v1/chat/`)
- `GET /sessions/` - Sessiyalar ro'yxati
- `POST /sessions/` - Yangi suhbat
- `GET /sessions/{id}/` - Bitta suhbat (xabarlar bilan)
- `POST /sessions/{id}/ask/` - PDF haqida savol berish
- `POST /project-info/ask/` - **Loyiha haqida savol berish**

## RAG (Retrieval-Augmented Generation) Tizimi

Loyihaning **eng muhim qismi**. Quyidagicha ishlaydi:

### Indekslash bosqichi (1 marta):
1. PDF/Word yuklanadi
2. `pypdf` orqali matn ajratiladi
3. Matn 500 so'zlik **chunks**'larga bo'linadi
4. Har bir chunk **Sentence Transformer** orqali **vector**'ga aylantirildi (384 o'lchamli)
5. Vectorlar **FAISS** indeksiga saqlanadi

### Savol berish bosqichi (har safar):
1. Foydalanuvchi savol beradi
2. Savol ham vectorga aylantirildi
3. FAISS bazadan **eng yaqin 3 ta chunk** topiladi (semantic search)
4. Chunks + savol **Gemini AI**'ga yuboriladi
5. AI faqat shu kontekst asosida javob beradi

### Afzalliklari:
- ChatGPT'dan farqli — **aniq sizning hujjatingizdan** javob
- Galyutsinatsiya kam (AI uydirma qilmaydi)
- Tezlik (FAISS millisekundda qidiradi)
- Bepul (Gemini bepul, FAISS bepul, Sentence Transformers bepul)

## Xavfsizlik

### Authentication
- **JWT** tokenlar (access: 60 daqiqa, refresh: 7 kun)
- **Token rotation** - har refresh'da yangi token
- **Blacklist** - logout'da tokenni bekor qilish
- Parollar **PBKDF2-SHA256** bilan HASH qilinadi

### Authorization
- Har bir foydalanuvchi **faqat o'z** hujjatlarini ko'radi
- Document ID orqali boshqalarning hujjatiga kirish — **mumkin emas**

### Configuration
- Maxfiy ma'lumotlar (`.env` faylida)
- `.gitignore` orqali GitHub'ga chiqmasligi
- 3 qismli settings (development/production)

### Production qo'shimchalari
- HTTPS majburiy (`SECURE_SSL_REDIRECT`)
- HSTS (1 yil)
- Secure Cookies
- CORS faqat ishonchli domenlar uchun

## Performance Optimizatsiya

### Database
- Indekslar (`db_index`, `Meta.indexes`)
- ForeignKey'larda `select_related` (kelayotgan bosqichda)
- Pagination (PAGE_SIZE=20)

### AI
- Sentence Transformer **singleton** pattern (bir marta yuklash)
- FAISS indeks **diskka** saqlanadi (qayta hisoblash shart emas)
- Chunks overlap (50 so'z) — kontekst yo'qolmaydi

## Testing

### Backend Testing
- **Pytest** + pytest-django
- Coverage tracking (pytest-cov)
- Factory Boy (mock data)

### API Testing
- VS Code REST Client (`api-tests.http`)
- Manual brauzer test (DRF Browsable API)

## Deployment Plan (10-bosqich)

### Docker
- Multi-stage Dockerfile
- docker-compose.yml (backend, postgres, redis, frontend)
- One-command deployment: `docker-compose up`

### Hosting
- **Backend:** Render yoki Railway (bepul)
- **Frontend:** Vercel (bepul)
- **Database:** Supabase yoki Neon (bepul)

## Loyiha Statistikasi

- **Bosqichlar:** 10 ta
- **Django apps:** 5 ta (users, documents, ai_chat, quizzes, flashcards)
- **Models:** 8 ta
- **API endpoints:** 25+ ta
- **Kod hajmi:** ~3000+ qator (backend)

## Foydalanilgan Pattern'lar

1. **Repository Pattern** - `services.py` (biznes logika ajratilgan)
2. **Singleton Pattern** - EmbeddingService.get_model()
3. **Factory Pattern** - DocumentParser
4. **Strategy Pattern** - file_type bo'yicha parser tanlash
5. **Custom Manager** - UserManager
6. **REST API Best Practices** - URL versioning (v1)

## Foydalanilgan Adabiyotlar

- Django Documentation: https://docs.djangoproject.com/
- DRF Documentation: https://www.django-rest-framework.org/
- LangChain Documentation: https://python.langchain.com/
- Gemini AI: https://ai.google.dev/
- FAISS Documentation: https://faiss.ai/

## Loyihaning kelajagi

### Kelayotgan funksiyalar:
- Voice input (ovozli savol-javob)
- Image OCR (rasm orqali savol)
- Multi-language (rus, ingliz, qoraqalpoq)
- Mobile app (React Native)
- Gamification (ochkolar, darajalar)

## Tez-tez beriladigan savollar (FAQ)

**Savol:** Nega Django va React?
**Javob:** Django - Python'ning eng kuchli web framework'i, REST API uchun ideal. React - eng mashhur frontend kutubxonasi, dinamik UI uchun.

**Savol:** Nega SQLite va PostgreSQL?
**Javob:** SQLite - lokal ishlash uchun yetarli (fayl-asoslangan). PostgreSQL - server uchun (concurrent users, indekslar, advanced features).

**Savol:** Nega Gemini, ChatGPT emas?
**Javob:** Gemini Google'ning bepul AI'si bo'lib, kuniga 1500 request bepul. ChatGPT API - pulli ($20/oy). Talaba uchun Gemini ideal.

**Savol:** Nega FAISS, ChromaDB emas?
**Javob:** ChromaDB Windows'da o'rnatilishi qiyin (C++ kompilyator kerak). FAISS - Facebook tomonidan, juda tez, oson o'rnatiladi, professional ko'rinadi.

**Savol:** RAG nima va nega kerak?
**Javob:** RAG (Retrieval-Augmented Generation) - AI'ga foydalanuvchi hujjati asosida javob berishga imkon beradi. Oddiy ChatGPT umumiy javob beradi, RAG aniq sizning kontekstdan javob beradi.

**Savol:** Custom User Model nima uchun?
**Javob:** Standart Django User'da `username` majburiy. Zamonaviy saytlar (Gmail, Instagram) email bilan login qiladi. Shuning uchun email-asoslangan custom User yaratdim.

**Savol:** JWT vs Session - nega JWT?
**Javob:** JWT stateless - server xotira ishlatmaydi, scale qilish oson. Session - har request'da databazaga murojaat. JWT zamonaviy API'lar uchun standart.