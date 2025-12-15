import dotenv from "dotenv"
import { connectDB } from "./connectDB"
import express from "express"
import cors from "cors"
import { router as studentRouter } from "./routes/studentRoutes"
import { router as passportRouter } from "./routes/passportRoutes"
import { router as visaRouter } from "./routes/visaRoutes"
import { router as educationRouter } from "./routes/educationRoutes"

dotenv.config()

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({ origin: /localhost/ }));
app.use(express.json());

app.use("/api/students", studentRouter);
app.use("/api/passports", passportRouter);
app.use("/api/visas", visaRouter);
app.use("/api/education", educationRouter);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

startServer();

export default app
