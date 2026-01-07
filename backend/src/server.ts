import dotenv from "dotenv"
import { connectDB } from "./connectDB"
import express from "express"
import cors from "cors"
import { router as studentRouter } from "./routes/studentRoutes"
import { router as passportRouter } from "./routes/passportRoutes"
import { router as visaRouter } from "./routes/visaRoutes"
import { router as educationRouter } from "./routes/educationRoutes"
import { router as petitionRouter } from "./routes/petitionRoutes"
import { router as medicalReportRouter } from "./routes/medicalReportRoutes"
import { router as migrationCardRouter } from "./routes/migrationCardRoutes"
import { router as arrivalNoticeRouter } from "./routes/arrivalNoticeRoutes"
import { router as eduAgreementRouter } from "./routes/eduAgreementRoutes"
import { router as termNoticeRouter } from "./routes/termNoticeRoutes"
import { router as authRouter } from "./routes/auth.routes"

dotenv.config()

const PORT = process.env.PORT || 5000;

const app = express();

app.use(cors({ origin: /localhost/ }));
app.use(express.json());

app.use("/api/students", studentRouter);
app.use("/api/passports", passportRouter);
app.use("/api/visas", visaRouter);
app.use("/api/education_documents", educationRouter);
app.use("/api/petitions", petitionRouter);
app.use("/api/medical_reports", medicalReportRouter);
app.use("/api/migration_cards", migrationCardRouter);
app.use("/api/arrival_notifications", arrivalNoticeRouter);
app.use("/api/education_agreements", eduAgreementRouter);
app.use("/api/termination_notifications", termNoticeRouter);
app.use("/api/auth", authRouter);

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

startServer();

export default app
