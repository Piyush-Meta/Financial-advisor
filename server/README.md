# Financial Advisor Server

This backend provides REST endpoints for the AI-powered financial advisor app.

## Install

cd server
npm install

## Environment

Copy `.env.example` to `.env` and set:

- `MONGO_URI`
- `OPENAI_API_KEY`
- `PORT`

## Run

npm run dev

## Endpoints

- `GET /` - health check
- `POST /api/ai/chat` - send chat prompt to OpenAI
- `GET /api/budget/:userId` - load budget data
- `POST /api/budget` - save budget data
- `POST /api/users/profile` - create a user profile
- `GET /api/users/:id` - fetch user profile
