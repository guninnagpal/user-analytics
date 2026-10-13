# User Analytics Application

A small full-stack app that tracks user interactions on a web page and shows them in a dashboard.

## Tech stack
- **Tracker:** vanilla JavaScript (`localStorage`, `navigator.sendBeacon`)
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Dashboard:** React (Vite)

## Project structure
```
tracker/    tracker.js + demo.html
backend/    Express API
dashboard/  React dashboard
```

## Setup

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env     # set MONGO_URI (local MongoDB or Atlas)
npm start
```
API runs on `http://localhost:5000`.

### 2. Dashboard
```bash
cd dashboard
npm install
cp .env.example .env     # VITE_API_URL should point to the backend
npm run dev
```

### 3. Tracker demo
Open `tracker/demo.html` in the browser (or run `npx serve tracker`) and click around. To track any other page, add:
```html
<script src="tracker.js" data-api="http://localhost:5000"></script>
```

## API
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/events` | Store an event |
| GET | `/api/sessions` | Sessions with event counts |
| GET | `/api/sessions/:id/events` | Ordered events of one session |
| GET | `/api/pages` | Distinct tracked page URLs |
| GET | `/api/heatmap?url=` | Click data for a page |

## Data model (`events` collection)
`session_id, type (page_view | click), url, timestamp, x, y, page_width, page_height`

Indexes: `session_id`, `url`, `{session_id, timestamp}`, `{url, type}`.

## Assumptions and trade-offs
- A session is one browser (id kept in `localStorage`). There is no session timeout.
- Page URL is stored as origin + path, so query strings do not create separate heatmap pages.
- Click coordinates are page coordinates (`pageX/pageY`). The page size is stored with each click and the heatmap draws dots as a percentage, so different screen sizes line up roughly.
- `sendBeacon` sends `text/plain` to avoid a CORS preflight, so the backend parses text bodies as JSON.
- Sessions are computed on the fly with an aggregation. Fine for a small dataset; for large data I would pre-aggregate.
- No authentication on the dashboard or API, and CORS is open, to keep the assignment simple.
- The heatmap shows dots on a grid, not a screenshot of the page.

## Deployment
Backend on Render, dashboard on Vercel, database on MongoDB Atlas.
