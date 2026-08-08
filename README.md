# AI-Powered Kanban Task Manager

A full-stack MERN Kanban workspace with drag-and-drop task management, AI-assisted task creation, and browser voice input.

## Features

- Five workflow columns: TO DO, IN PROGRESS, PAUSED, SUBMITTED, APPROVED
- Drag and drop powered by `@hello-pangea/dnd`
- MongoDB persistence with Mongoose
- Express REST API for task CRUD
- AI task parsing with the OpenAI Node SDK and `gpt-4o-mini`
- Voice-to-text input using `webkitSpeechRecognition`
- Optimistic status updates with rollback on API failure
- Responsive React + Vite interface with Tailwind CSS and Lucide icons

## Project structure

```text
client/   React/Vite frontend
server/   Express/Mongoose backend
```

## Environment variables

Copy `server/.env.example` to `server/.env` and configure:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_key
```

Never commit your real `.env` file.

## Installation

```bash
npm install
npm --prefix server install
npm --prefix client install
```

Run both applications together:

```bash
npm run dev
```

Or run them separately:

```bash
cd server
npm run dev
```

```bash
cd client
npm run dev
```

The frontend uses `http://localhost:5000/api` by default. For a deployed backend, set `VITE_API_URL` in the frontend environment.

## API

```text
GET     /api/tasks
POST    /api/tasks
PUT     /api/tasks/:id
DELETE  /api/tasks/:id
POST    /api/ai/parse
GET     /api/health
```

## GitHub push guide

```bash
git init
git add .
git commit -m "Build AI-powered Kanban task manager"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git push -u origin main
```

## Notes

The requested Task schema does not include a persisted `department` property. The Department selector is therefore presented in the UI without inventing unsupported database filtering. Add a department field to the schema/API before enabling persistent department filtering.
