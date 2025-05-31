import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/validRoutes";
import { connectMongo } from "./connectMongo";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";

dotenv.config();
const mongoClient = connectMongo();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";
const app = express();

app.use(express.json());
app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

const imageProvider = new ImageProvider(mongoClient);
registerImageRoutes(app, imageProvider);

Object.values(ValidRoutes).forEach(route => {
    app.get(route, (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "..", STATIC_DIR, "index.html"));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
