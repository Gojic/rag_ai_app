# rag_ai_app

# 📚 RAG AI App

Backend for a **Retrieval-Augmented Generation (RAG)** application — built with **Node.js + TypeScript**, **MySQL/Sequelize**, and **AWS S3 (or compatible)** for file storage, with an architecture ready for an AI layer (LangChain + Qdrant + OpenAI embeddings).

## 🚀 Tech Stack

- **Node.js** + **TypeScript** – core backend stack
- **Express** – HTTP API
- **Sequelize ORM** + **MySQL** – relational database and migrations
- **AWS S3** (or MinIO compatible) – document storage
- **Multer + multer-s3** – file upload directly to S3
- **dotenv** – environment configuration
- (Planned) **LangChain**
- **Qdrant**, **OpenAI embeddings/LLM** – AI/RAG layer
- **Docker Compose** – local development and production deploy
- **Jest** – unit and integration tests

## 🗂 Project Structure

```
src/
app.ts                  # main app entry point
controllers/            # Express controllers
middleware/             # Multer/S3 upload middleware
models/                 # Sequelize models (e.g. Document)
migrations/             # Sequelize migrations
routes/                 # Express routes
services/               # business logic
db/                     # database connection
```

## ⚡ Core Features (MVP)

- **Authentication (done):** user registration/login with JWT tokens
- **Document upload (done):**
  - `POST /documents` accepts PDF/Text files (20 MB limit)
  - files are stored in S3, metadata (name, MIME type, size, status) stored in MySQL
- **Document listing/details (done):**
  - `GET /documents` — list with statuses
  - `GET /documents/:id` — details of a single document
- **Ingest & AI layer (done):**
  - Worker to parse, chunk, embed, and insert vectors into Qdrant
  - `POST /ingest/:documentId` — start processing
  - `POST /rag/query` — semantic question answering with citations

## 🛠 Environment Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/<your-username>/rag_ai_app.git
   cd rag_ai_app

   ```

2. Install dependencies:
   npm install
3. Create .env file:
   PORT=3000

   DB_USER=root
   DB_PASS=your_db_password
   DB_NAME=rag_db
   DB_HOST=127.0.0.1
   DB_DIALECT=mysql
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   S3_BUCKET_NAME=rag-documents

4. Run database migrations:
   npx sequelize-cli db:migrate

5.Start the development server:
npm run dev
for docker compose:
`docker compose -f docker-compose.dev.yml --profile dev up --build qdrant app-dev worker-dev`

6. For testing:
   Create the test database inside the MySQL container:
   `docker compose exec db mysql -uroot -p -e "CREATE DATABASE IF NOT EXISTS rag_db_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`
   Verify that the database was created:
   `docker compose exec db mysql -uroot -p -e "SHOW DATABASES;"`
   Run test migrations:
   `npx dotenv-cli -e .env.test -- sequelize-cli db:migrate --env test`
   Run the Jest test suite:
   `npx dotenv-cli -e .env.test -- jest --runInBand`

## 🏗 Roadmap / Phases

### Phase A – Core Backend (**done**)

- **Node.js + TypeScript skeleton**
- **JWT authentication**
- **Document upload to S3 with metadata in MySQL**
- **Docker Compose** (api + mysql + qdrant placeholder)
- **Initial tests and README**

### Phase B – AI/RAG Layer (**done**)

- **PDF/DOCX/MD/TXT parsing**
- **Text chunking** (~900 tokens + overlap)
- **OpenAI embeddings → Qdrant vector store**
- **POST `/ingest/:documentId`**
- **POST `/rag/query` with citations**

### Phase C – Pro (**planned**)

- **Render, Railway ili AWS** Plan to deploy the RAG backend system to a live environment with an integrated Swagger / OpenAPI documentation or web interface (Swagger UI, Redoc, Postman web workspace) for real-time API testing. (**done**)
- **Swagger** (**done**)
- **Conversational RAG** (chat history & summarization)
- **Hybrid search** (BM25 + Qdrant)
- **RBAC, API keys**
- **Observability:** `/metrics`, structured logging
- **GitHub Actions for CI/CD**

## 🧪 Quick Test (when routes are complete)

### Upload a PDF:

curl -F "file=@docs/example.pdf" -F "collectionId=COL_1" \
 http://localhost:3000/documents

Query (planned):
curl -X POST -H "Content-Type: application/json" \
 -d '{"collectionId":"COL_1","question":"What are the main process steps?"}' \
 http://localhost:3000/rag/query

##💡 Goal of the project
To demonstrate the ability to build a production-ready RAG backend — from classic REST APIs with SQL storage and S3 file handling to an AI layer with vector search and LLM integration.
