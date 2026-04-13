import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);
const appName = process.env.APP_NAME || "Perler Beads Studio";
const bookingEmail = process.env.BOOKING_EMAIL || "studio@example.com";
const bookings = [];

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    appName,
    bookingEmail,
    timestamp: new Date().toISOString(),
    bookingCount: bookings.length
  });
});

app.post("/api/bookings", (request, response) => {
  const { name, email, date, session, notes = "" } = request.body || {};

  if (!name || !email || !date || !session) {
    response.status(400).json({
      ok: false,
      message: "Please fill in name, email, date, and session before booking."
    });
    return;
  }

  const booking = {
    id: `BK-${Date.now().toString(36).toUpperCase()}`,
    name: String(name).trim(),
    email: String(email).trim().toLowerCase(),
    date,
    session: String(session).trim(),
    notes: String(notes).trim(),
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);

  response.status(201).json({
    ok: true,
    message: `Booking received for ${booking.session}.`,
    booking,
    contactEmail: bookingEmail
  });
});

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (_request, response) => {
  response.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  console.log(`${appName} server is running on port ${port}`);
});
