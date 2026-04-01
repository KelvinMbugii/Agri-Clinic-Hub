# 🌿 Agri-Clinic Hub - Deployment Guide

Welcome to the **Agri-Clinic Hub**, an enterprise-grade AI solution for agricultural disease detection and management. Follow these steps to deploy the application to local or production environments.

## 🏗 Project Architecture
- **Frontend:** React (Vite) + Tailwind CSS
- **Backend:** Node.js (Express) + MongoDB
- **AI Engine:** Google Gemini (LLM) + Pinecone (Vector RAG) + Redis (Session Cache)
- **Computer Vision:** Python-based Disease Prediction Service

---

## 🛠 Prerequisites
- Node.js v18+ & npm/pnpm
- MongoDB (Local or Atlas)
- Redis (Local or Upstash)
- Python 3.9+ (for the CV service)

---

## 🚀 Deployment Steps

### 1. Backend Setup (`/server`)
1.  **Configure Environment:**
    - Copy `.env.example` to `.env`
    - Populate `GEMINI_API_KEY`, `PINECONE_API_KEY`, and `MONGODB_URI`.
    - Set `REDIS_URL` or `UPSTASH_REDIS_REST_URL`.
2.  **Install Dependencies:** `npm install`
3.  **Start Server:** `npm start` (Standard) or `npm run dev` (Development)

### 2. Frontend Setup (`/client`)
1.  **Configure Environment:**
    - Set `VITE_API_BASE_URL` in `.env` if different from `http://localhost:5000`.
2.  **Install Dependencies:** `npm install`
3.  **Build for Production:** `npm run build`
4.  **Preview:** `npm run preview`

### 3. AI Service (Python)
To run the image-based disease detection model:
1. Navigate to the `ai-services` directory.
2. Activate the virtual environment and run the FastAPI server:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```

### 4. AI Knowledge Ingestion
- Use the **Admin Dashboard** to upload PDFs or raw knowledge snippets.
- Ensure the Pinecone index is active with **3072 dimensions** (for Gemini embeddings).

---

## 🛡 Security & Best Practices
- **Secrets:** Never commit the `.env` file. Use the `.env.example` as a template.
- **Tone:** The AI Assistant is pre-configured to act as a **Professional Agricultural Extension Officer**.
- **Safety:** Always include the provided safety warnings for any chemical treatments mentioned in the AI responses.

---

## 📞 Support
For technical issues regarding the RAG pipeline or Pinecone integration, consult the Internal Knowledge Base (KIs).
