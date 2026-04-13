# Perler Beads Studio

Perler Beads Studio is a pass-level frontend app for the deployment task. It includes one clean home page with:

- An app title
- A short description
- A simple banner-style visual
- A call-to-action button
- A layout that works in the browser and is ready to deploy on Render

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Render deployment

Create a new **Static Site** on Render and connect this GitHub repository.

Use these settings:

- Build Command: `npm install && npm run build`
- Publish Directory: `dist`

## Pass evidence checklist

Take screenshots of:

- Your GitHub repository
- Your Render dashboard
- Your Render deployment settings
- The live public URL working in the browser

## Project structure

- `src/App.vue` contains the single home page
- `src/styles.css` contains the layout and styling
- `vite.config.js` provides the Vue + Vite setup
