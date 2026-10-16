import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

export const pool = new Pool({
  connectionString: databaseUrl,
});

export const connectDB = async (): Promise<void> => {
  try {
    console.log("Connecting to PostgreSQL...");

    const client = await pool.connect();

    try {
      const result = await client.query("SELECT NOW() AS now");

      console.log("PostgreSQL connected");
      console.log("Database time:", result.rows[0].now);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("PostgreSQL connection error:", error);

    process.exit(1);
  }
};