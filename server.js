import express from "express";
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";
import pg from "pg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pg;

const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);
const appName = process.env.APP_NAME || "Perler Beads Studio";
const bookingEmail = process.env.BOOKING_EMAIL || "studio@example.com";
const databaseUrl = process.env.DATABASE_URL || "";
const publicAppUrl = process.env.PUBLIC_APP_URL || `http://localhost:${port}`;
const smtpHost = process.env.SMTP_HOST || "";
const smtpPort = Number.parseInt(process.env.SMTP_PORT || "587", 10);
const smtpUser = process.env.SMTP_USER || "";
const smtpPass = process.env.SMTP_PASS || "";
const smtpFrom = process.env.SMTP_FROM || smtpUser || bookingEmail;
const smtpSecure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
const bookings = [];
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const capitalizedNamePolicy = /^[A-Z][A-Za-z' -]*$/;
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false }
    })
  : null;
const mailTransport = smtpHost && smtpUser && smtpPass
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    })
  : null;

async function initializeDatabase() {
  if (!pool) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      booking_date DATE NOT NULL,
      session TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMPTZ NOT NULL,
      used_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function findUserByEmail(email) {
  if (!pool) {
    return null;
  }

  const result = await pool.query(
    `
      SELECT id, name, email, password, created_at AS "createdAt"
      FROM users
      WHERE email = $1
      LIMIT 1
    `,
    [email]
  );

  return result.rows[0] || null;
}

async function createUserAccount({ name, email, password }) {
  if (!pool) {
    throw new Error("Database connection is required for account storage.");
  }

  const result = await pool.query(
    `
      INSERT INTO users (id, name, email, password)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, created_at AS "createdAt"
    `,
    [
      `USR-${Date.now().toString(36).toUpperCase()}`,
      String(name).trim(),
      String(email).trim().toLowerCase(),
      String(password)
    ]
  );

  return result.rows[0];
}

function isStrongPassword(password) {
  return passwordPolicy.test(String(password || ""));
}

function isCapitalizedName(name) {
  return capitalizedNamePolicy.test(String(name || "").trim());
}

function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function createPasswordResetToken(user) {
  if (!pool) {
    throw new Error("Database connection is required for password recovery.");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await pool.query(
    `
      INSERT INTO password_reset_tokens (id, user_id, email, token_hash, expires_at)
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      `RST-${Date.now().toString(36).toUpperCase()}`,
      user.id,
      user.email,
      tokenHash,
      expiresAt.toISOString()
    ]
  );

  return {
    rawToken,
    expiresAt
  };
}

async function findValidResetToken(rawToken) {
  if (!pool) {
    return null;
  }

  const result = await pool.query(
    `
      SELECT id, user_id AS "userId", email, expires_at AS "expiresAt", used_at AS "usedAt"
      FROM password_reset_tokens
      WHERE token_hash = $1
      LIMIT 1
    `,
    [hashResetToken(rawToken)]
  );

  const tokenRecord = result.rows[0];

  if (!tokenRecord) {
    return null;
  }

  if (tokenRecord.usedAt) {
    return null;
  }

  if (new Date(tokenRecord.expiresAt).getTime() < Date.now()) {
    return null;
  }

  return tokenRecord;
}

async function markResetTokenUsed(tokenId) {
  if (!pool) {
    return;
  }

  await pool.query(
    `
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE id = $1
    `,
    [tokenId]
  );
}

async function updateUserPassword(userId, password) {
  if (!pool) {
    throw new Error("Database connection is required for password updates.");
  }

  await pool.query(
    `
      UPDATE users
      SET password = $2
      WHERE id = $1
    `,
    [userId, String(password)]
  );
}

async function sendPasswordResetEmail({ email, token }) {
  if (!mailTransport) {
    throw new Error("SMTP is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.");
  }

  const resetUrl = `${publicAppUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await mailTransport.sendMail({
    from: smtpFrom,
    to: email,
    subject: `${appName} password reset`,
    text: `Reset your password using this link: ${resetUrl}`,
    html: `
      <p>Use the link below to reset your password for ${appName}.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 30 minutes.</p>
    `
  });
}

async function getBookingCount() {
  if (!pool) {
    return bookings.length;
  }

  const result = await pool.query("SELECT COUNT(*)::int AS count FROM bookings");
  return result.rows[0]?.count || 0;
}

async function listBookings() {
  if (!pool) {
    return bookings
      .slice()
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 12);
  }

  const result = await pool.query(`
    SELECT
      id,
      name,
      email,
      booking_date AS "date",
      session,
      notes,
      created_at AS "createdAt"
    FROM bookings
    ORDER BY created_at DESC
    LIMIT 12
  `);

  return result.rows;
}

async function saveBooking(booking) {
  if (!pool) {
    bookings.push(booking);
    return booking;
  }

  const result = await pool.query(
    `
      INSERT INTO bookings (id, name, email, booking_date, session, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        name,
        email,
        booking_date AS "date",
        session,
        notes,
        created_at AS "createdAt"
    `,
    [booking.id, booking.name, booking.email, booking.date, booking.session, booking.notes]
  );

  return result.rows[0];
}

app.use(express.json());

app.get("/api/health", async (_request, response) => {
  try {
    response.json({
      ok: true,
      appName,
      bookingEmail,
      timestamp: new Date().toISOString(),
      bookingCount: await getBookingCount(),
      database: pool ? "postgres" : "memory"
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Health check failed."
    });
  }
});

app.get("/api/bookings", async (_request, response) => {
  try {
    response.json({
      ok: true,
      bookings: await listBookings(),
      database: pool ? "postgres" : "memory"
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not load bookings."
    });
  }
});

app.post("/api/signup", async (request, response) => {
  const { name, email, password } = request.body || {};

  if (!name || !email || !password) {
    response.status(400).json({
      ok: false,
      message: "Please fill in name, email, and password before signing up."
    });
    return;
  }

  if (!pool) {
    response.status(503).json({
      ok: false,
      message: "Database is not connected, so accounts cannot be created yet."
    });
    return;
  }

  if (!isCapitalizedName(name)) {
    response.status(400).json({
      ok: false,
      message: "Name must start with a capital letter."
    });
    return;
  }

  if (!isStrongPassword(password)) {
    response.status(400).json({
      ok: false,
      message:
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character."
    });
    return;
  }

  try {
    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await findUserByEmail(normalizedEmail);

    if (existingUser) {
      response.status(409).json({
        ok: false,
        message: "An account with this email already exists."
      });
      return;
    }

    const user = await createUserAccount({
      name,
      email: normalizedEmail,
      password
    });

    response.status(201).json({
      ok: true,
      message: "Account created successfully.",
      user
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not create account."
    });
  }
});

app.post("/api/login", async (request, response) => {
  const { email, password } = request.body || {};

  if (!email || !password) {
    response.status(400).json({
      ok: false,
      message: "Please enter your email and password."
    });
    return;
  }

  if (!pool) {
    response.status(503).json({
      ok: false,
      message: "Database is not connected, so login is unavailable right now."
    });
    return;
  }

  try {
    const user = await findUserByEmail(String(email).trim().toLowerCase());

    if (!user || user.password !== String(password)) {
      response.status(401).json({
        ok: false,
        message: "Incorrect email or password."
      });
      return;
    }

    response.json({
      ok: true,
      message: "Logged in successfully.",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not log in."
    });
  }
});

app.post("/api/forgot-password", async (request, response) => {
  const email = String(request.body?.email || "").trim().toLowerCase();

  if (!email) {
    response.status(400).json({
      ok: false,
      message: "Please enter your email."
    });
    return;
  }

  if (!pool) {
    response.status(503).json({
      ok: false,
      message: "Database is not connected, so password recovery is unavailable right now."
    });
    return;
  }

  try {
    const user = await findUserByEmail(email);

    if (!user) {
      response.status(404).json({
        ok: false,
        message: "No account was found for that email."
      });
      return;
    }

    const { rawToken } = await createPasswordResetToken(user);
    await sendPasswordResetEmail({
      email,
      token: rawToken
    });

    response.json({
      ok: true,
      message: `Password reset instructions were sent to ${email}.`
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not start password recovery."
    });
  }
});

app.get("/api/reset-password/validate", async (request, response) => {
  const token = String(request.query.token || "");

  if (!token) {
    response.status(400).json({
      ok: false,
      message: "Missing reset token."
    });
    return;
  }

  try {
    const tokenRecord = await findValidResetToken(token);

    if (!tokenRecord) {
      response.status(400).json({
        ok: false,
        message: "This reset link is invalid or has expired."
      });
      return;
    }

    response.json({
      ok: true,
      email: tokenRecord.email
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not validate reset token."
    });
  }
});

app.post("/api/reset-password", async (request, response) => {
  const token = String(request.body?.token || "");
  const password = String(request.body?.password || "");

  if (!token || !password) {
    response.status(400).json({
      ok: false,
      message: "Reset token and new password are required."
    });
    return;
  }

  if (!isStrongPassword(password)) {
    response.status(400).json({
      ok: false,
      message:
        "Password must be at least 8 characters and include an uppercase letter, lowercase letter, number, and special character."
    });
    return;
  }

  try {
    const tokenRecord = await findValidResetToken(token);

    if (!tokenRecord) {
      response.status(400).json({
        ok: false,
        message: "This reset link is invalid or has expired."
      });
      return;
    }

    await updateUserPassword(tokenRecord.userId, password);
    await markResetTokenUsed(tokenRecord.id);

    response.json({
      ok: true,
      message: "Password reset successfully. You can now log in with your new password."
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not reset password."
    });
  }
});

app.post("/api/bookings", async (request, response) => {
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

  try {
    const savedBooking = await saveBooking(booking);

    response.status(201).json({
      ok: true,
      message: `Booking received for ${savedBooking.session}.`,
      booking: savedBooking,
      contactEmail: bookingEmail,
      database: pool ? "postgres" : "memory"
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not save booking."
    });
  }
});

const distPath = path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (_request, response) => {
  response.sendFile(path.join(distPath, "index.html"));
});

initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`${appName} server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
