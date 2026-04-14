import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { storeProducts } from "./src/data/studio.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { Pool } = pg;

const app = express();
const port = Number.parseInt(process.env.PORT || "3000", 10);
const appName = process.env.APP_NAME || "Perler Beads Studio";
const bookingEmail = process.env.BOOKING_EMAIL || "studio@example.com";
const databaseUrl = process.env.DATABASE_URL || "";
const bookings = [];
const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const capitalizedNamePolicy = /^[A-Z][A-Za-z' -]*$/;
const productCatalog = new Map(storeProducts.map((product) => [product.id, product]));
const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost") ? false : { rejectUnauthorized: false }
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
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, product_id)
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

async function findUserById(id) {
  if (!pool) {
    return null;
  }

  const result = await pool.query(
    `
      SELECT id, name, email, created_at AS "createdAt"
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return result.rows[0] || null;
}

function isStrongPassword(password) {
  return passwordPolicy.test(String(password || ""));
}

function isCapitalizedName(name) {
  return capitalizedNamePolicy.test(String(name || "").trim());
}

async function listCartItems(userId) {
  if (!pool) {
    throw new Error("Database connection is required for cart storage.");
  }

  const result = await pool.query(
    `
      SELECT product_id AS "productId", quantity
      FROM cart_items
      WHERE user_id = $1 AND quantity > 0
      ORDER BY updated_at DESC
    `,
    [userId]
  );

  return result.rows
    .map((row) => {
      const product = productCatalog.get(row.productId);

      if (!product) {
        return null;
      }

      return {
        ...product,
        quantity: row.quantity,
        lineTotalCents: product.priceCents * row.quantity
      };
    })
    .filter(Boolean);
}

async function setCartItemQuantity(userId, productId, quantity) {
  if (!pool) {
    throw new Error("Database connection is required for cart storage.");
  }

  if (quantity <= 0) {
    await pool.query(
      `
        DELETE FROM cart_items
        WHERE user_id = $1 AND product_id = $2
      `,
      [userId, productId]
    );
    return;
  }

  await pool.query(
    `
      INSERT INTO cart_items (id, user_id, product_id, quantity, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (user_id, product_id)
      DO UPDATE SET
        quantity = EXCLUDED.quantity,
        updated_at = NOW()
    `,
    [`CRT-${Date.now().toString(36).toUpperCase()}-${productId}`, userId, productId, quantity]
  );
}

async function clearCartItems(userId) {
  if (!pool) {
    throw new Error("Database connection is required for cart storage.");
  }

  await pool.query(
    `
      DELETE FROM cart_items
      WHERE user_id = $1
    `,
    [userId]
  );
}

async function listUsersForAdmin() {
  if (!pool) {
    throw new Error("Database connection is required for admin data.");
  }

  const result = await pool.query(`
    SELECT
      id,
      name,
      email,
      created_at AS "createdAt"
    FROM users
    ORDER BY created_at DESC
    LIMIT 50
  `);

  return result.rows;
}

async function listCartItemsForAdmin() {
  if (!pool) {
    throw new Error("Database connection is required for admin data.");
  }

  const result = await pool.query(`
    SELECT
      id,
      user_id AS "userId",
      product_id AS "productId",
      quantity,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM cart_items
    ORDER BY updated_at DESC
    LIMIT 100
  `);

  return result.rows;
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

app.get("/api/admin/data", async (_request, response) => {
  if (!pool) {
    response.status(503).json({
      ok: false,
      message: "Database is not connected, so admin data is unavailable right now."
    });
    return;
  }

  try {
    const [users, bookingsData, cartItems] = await Promise.all([
      listUsersForAdmin(),
      listBookings(),
      listCartItemsForAdmin()
    ]);

    response.json({
      ok: true,
      database: "postgres",
      users,
      bookings: bookingsData,
      cartItems
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not load admin data."
    });
  }
});

app.get("/api/cart", async (request, response) => {
  const userId = String(request.query.userId || "");

  if (!userId) {
    response.status(400).json({
      ok: false,
      message: "Missing userId."
    });
    return;
  }

  if (!pool) {
    response.status(503).json({
      ok: false,
      message: "Database is not connected, so cart storage is unavailable right now."
    });
    return;
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      response.status(404).json({
        ok: false,
        message: "User account not found."
      });
      return;
    }

    response.json({
      ok: true,
      items: await listCartItems(userId),
      database: "postgres"
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not load cart."
    });
  }
});

app.put("/api/cart/items/:productId", async (request, response) => {
  const productId = String(request.params.productId || "");
  const userId = String(request.body?.userId || "");
  const quantity = Number.parseInt(String(request.body?.quantity ?? ""), 10);

  if (!userId || !productId || Number.isNaN(quantity) || quantity < 0) {
    response.status(400).json({
      ok: false,
      message: "userId, productId, and a valid quantity are required."
    });
    return;
  }

  if (!pool) {
    response.status(503).json({
      ok: false,
      message: "Database is not connected, so cart storage is unavailable right now."
    });
    return;
  }

  if (!productCatalog.has(productId)) {
    response.status(400).json({
      ok: false,
      message: "Unknown store product."
    });
    return;
  }

  try {
    const user = await findUserById(userId);

    if (!user) {
      response.status(404).json({
        ok: false,
        message: "User account not found."
      });
      return;
    }

    await setCartItemQuantity(userId, productId, quantity);

    response.json({
      ok: true,
      items: await listCartItems(userId),
      database: "postgres"
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not update cart."
    });
  }
});

app.delete("/api/cart/items/:productId", async (request, response) => {
  const productId = String(request.params.productId || "");
  const userId = String(request.query.userId || "");

  if (!userId || !productId) {
    response.status(400).json({
      ok: false,
      message: "userId and productId are required."
    });
    return;
  }

  if (!pool) {
    response.status(503).json({
      ok: false,
      message: "Database is not connected, so cart storage is unavailable right now."
    });
    return;
  }

  try {
    await setCartItemQuantity(userId, productId, 0);

    response.json({
      ok: true,
      items: await listCartItems(userId),
      database: "postgres"
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not remove cart item."
    });
  }
});

app.delete("/api/cart", async (request, response) => {
  const userId = String(request.query.userId || "");

  if (!userId) {
    response.status(400).json({
      ok: false,
      message: "Missing userId."
    });
    return;
  }

  if (!pool) {
    response.status(503).json({
      ok: false,
      message: "Database is not connected, so cart storage is unavailable right now."
    });
    return;
  }

  try {
    await clearCartItems(userId);

    response.json({
      ok: true,
      items: [],
      database: "postgres"
    });
  } catch (error) {
    response.status(500).json({
      ok: false,
      message: error instanceof Error ? error.message : "Could not clear cart."
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
