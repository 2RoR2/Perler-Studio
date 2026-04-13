# Perler Beads Studio

Perler Beads Studio is a Vue + Node.js web app for planning bead patterns, browsing products, and booking studio sessions.

It now includes:

- A Vue frontend built with Vite
- An Express server that serves the app
- A booking API endpoint at `/api/bookings`
- Render-ready build/start commands and environment variables

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the frontend development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

4. Start the Node web server after building:

```bash
npm start
```

## Render deployment

Create a new **Web Service** on Render and connect this GitHub repository.

Use these settings:

- Build Command: `npm install && npm run build`
- Start Command: `npm start`

Environment variables:

- `APP_NAME=Perler Beads Studio`
- `BOOKING_EMAIL=bookings@perlerbeadsstudio.example`
- `NODE_VERSION=22`

## Credit evidence checklist

Take screenshots of:

- Your GitHub repository
- Your Render dashboard
- Your Render deployment settings
- The live public URL working in the browser
- Your environment variables in Render
- Your service suspended or deleted in Render to demonstrate deactivation

## Project structure

- `src/` contains the Vue frontend
- `server.js` runs the Express backend
- `src/pages/BookingPage.vue` submits bookings to the backend API
- `render.yaml` provides the Render web-service setup
