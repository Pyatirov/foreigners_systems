import dotenv from "dotenv"
import { connectDB } from "@/connectDB.js"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import multer from "multer"
import path from "path"
import fs from "fs"
import { router as studentRouter } from "@/modules/Student/student.routes.js"
import { router as passportRouter } from "@/modules/Passport/passport.routes.js"
import { router as visaRouter } from "@/modules/Visa/visa.routes.js"
import { router as educationRouter } from "@/modules/Education/education.routes.js"
import { router as petitionRouter } from "@/modules/Petition/petition.routes.js"
import { router as medicalReportRouter } from "@/modules/MedicalReports/medicalReport.routes.js"
import { router as migrationCardRouter } from "@/modules/MigrationCard/migrationCard.routes.js"
import { router as arrivalNoticeRouter } from "@/modules/ArrivalNotice/arrivalNotice.routes.js"
import { router as eduAgreementRouter } from "@/modules/EduAgreement/eduAgreement.routes.js"
import { router as termNoticeRouter } from "@/modules/TermNotice/termNotice.routes.js"
import { router as authRouter } from "@/modules/Auth/auth.routes.js"
import { requestLogger } from "@/logger/requestLogger.js"
import { errorHandler } from "@/logger/errorHandler.js"
import { userRouter } from "./modules/User/user.routes.js"

dotenv.config()

const PORT = process.env.PORT || 5000;

const app = express();

// Ensure upload directory exists
const uploadDir = 'uploads/photos';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Created directory: ${uploadDir}`);
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

app.use(cors({
  origin: 'http://localhost:5173', // порт фронтенда
  credentials: true,               // <--- обязательно для cookie
}));
app.use(express.json());
app.use(cookieParser())

app.use(requestLogger)

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

app.use("/api/students", upload.single('photo'), studentRouter);
app.use("/api/passports", passportRouter);
app.use("/api/visas", visaRouter);
app.use("/api/education_documents", educationRouter);
app.use("/api/petitions", petitionRouter);
app.use("/api/medical_reports", medicalReportRouter);
app.use("/api/migration_cards", migrationCardRouter);
app.use("/api/arrival_notifications", arrivalNoticeRouter);
app.use("/api/education_agreements", eduAgreementRouter);
app.use("/api/termination_notifications", termNoticeRouter);
app.use("/api/users", userRouter);
app.use("/auth", authRouter);

// Multer error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

app.use(errorHandler)

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
};

startServer();

export default app
