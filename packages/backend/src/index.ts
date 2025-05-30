// backend/src/index.ts
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/validRoutes";

dotenv.config();

const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const app = express();
app.use(express.static(STATIC_DIR));

app.get("/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

Object.values(ValidRoutes).forEach(route => {
    app.get(route, (req: Request, res: Response) => {
        res.sendFile(path.join(__dirname, "..", STATIC_DIR, "index.html"));
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
