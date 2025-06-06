import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/validRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { CredentialsProvider } from "./CredentialsProvider";
import { verifyAuthToken } from "./middleware/authMiddleware";

dotenv.config();
const mongoClient = connectMongo();
const credentialsProvider = new CredentialsProvider(mongoClient);

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const app = express();

app.use(express.json());
app.use(express.static(STATIC_DIR));
const uploadDir = process.env.IMAGE_UPLOAD_DIR || "uploads";
app.use("/uploads", express.static(uploadDir));
app.use("/api/*", verifyAuthToken);

const jwtSecret = process.env.JWT_SECRET;
if(!jwtSecret){
    throw new Error('Missing JWT_SECRET in .env')
}

app.locals.JWT_SECRET = jwtSecret;

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

const imageProvider = new ImageProvider(mongoClient);
registerImageRoutes(app, imageProvider);
registerAuthRoutes(app, credentialsProvider);

Object.values(ValidRoutes).forEach(route => {
    app.get(route, (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "..", STATIC_DIR, "index.html"));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
