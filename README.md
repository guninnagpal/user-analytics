# User Analytics Application

A small full-stack app that tracks user interactions (page views and clicks) on a web page and shows them in a dashboard with a session journey view and a click heatmap.

Built by **Gunin Nagpal** for the CausalFunnel Full Stack Engineer Intern assignment.
GitHub: [guninnagpal](https://github.com/guninnagpal)

## Tech stack
- **Tracker:** vanilla JavaScript (`localStorage`, `navigator.sendBeacon`)
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Dashboard:** React (Vite)

## Features
- Add one `<script>` tag to any page to track `page_view` and `click` events.
- Every event carries `session_id`, event type, page URL and timestamp. Clicks also carry x/y coordinates.
- **Sessions view:** all sessions with event counts. Click a session to see its ordered user journey.
- **Heatmap view:** pick a tracked page and see where users clicked.

## Project structure
```
tracker/    tracker.js + demo.html
backend/    Express API + Mongoose model
dashboard/  React dashboard
```

## Setup

You need Node.js (v18+) and a MongoDB instance (local, Compass, or Atlas).

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env     # on Windows: copy .env.example .env
npm start
```
Set `MONGO_URI` in `.env`. The API runs on `http://localhost:5000`.

### 2. Dashboard
```bash
cd dashboard
npm install
cp .env.example .env     # VITE_API_URL should point to the backend
npm run dev
```
The dashboard runs on `http://localhost:5173`.

### 3. Tracker demo
Open `tracker/demo.html` in the browser (VS Code Live Server or `npx serve tracker`) and click around. Then refresh the dashboard.

To track any other page, add:
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
```
session_id, type (page_view | click), url, timestamp, x, y, page_width, page_height
```
Indexes: `session_id`, `url`, `{session_id, timestamp}`, `{url, type}`.

## Design decisions
- **`localStorage` for the session id:** simple, no cookie handling, and it stays the same across page loads in one browser.
- **`navigator.sendBeacon`:** events are still delivered when the user closes or leaves the page. `fetch` with `keepalive` is the fallback.
- **Heatmap in percentages:** each click is stored with the page width and height, and dots are drawn as a percentage of that size, so clicks from different screen sizes line up.
- **MongoDB aggregation (`$group`):** the sessions list is computed from events, so there is no separate sessions collection to keep in sync.

## Assumptions and trade-offs
- A session is one browser (id kept in `localStorage`). There is no session timeout.
- The page URL is stored as origin + path, so query strings do not create separate heatmap pages.
- Click coordinates are page coordinates (`pageX/pageY`), so scrolled clicks are placed correctly on the page.
- `sendBeacon` sends `text/plain` to avoid a CORS preflight, so the backend parses text bodies as JSON.
- Sessions are computed on the fly. Fine for a small dataset; for large data I would pre-aggregate.
- No authentication on the dashboard or API, and CORS is open, to keep the assignment simple.
- The heatmap draws dots on a grid, not over a screenshot of the page.

## How I tested
1. Opened `tracker/demo.html`, clicked around, and checked the saved events in MongoDB Compass.
2. Confirmed sessions, the user journey and the heatmap show the data on the dashboard.
3. Opened the demo page from a second browser context and confirmed a separate session is created.

## What I would improve with more time
- Session timeout (for example, 30 minutes of inactivity starts a new session).
- Pagination and a date filter on the sessions list.
- Authentication for the dashboard and API, and rate limiting on `/api/events`.
- Heatmap drawn over a screenshot of the real page.
- Scroll depth and time-on-page tracking.
- Deployment (Render for the backend, Vercel for the dashboard, MongoDB Atlas for the database). Currently runs locally only.
