import express, { Request, Response } from "express";
import { CredentialsProvider } from "../CredentialsProvider";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
    username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = {
            username
        };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function registerAuthRoutes(app: express.Application, credentialsProvider: CredentialsProvider) {
    app.post("/auth/register", (req: Request, res: Response) => {
        void (async () => {
            const { username, password } = req.body;
            if (typeof username !== "string" || typeof password !== "string") {
                return res.status(400).send({
                    error: "Bad request",
                    message: "Missing username or password",
                });
            }
            const success = await credentialsProvider.registerUser(username, password);
            if (!success) {
                return res.status(409).send({
                    error: "Conflict",
                    message: "Username already taken",
                });
            }
            const token = await generateAuthToken(username, req.app.locals.JWT_SECRET);
            res.status(201).json({ token });
        })();
    });


    app.post("/auth/login", (req: Request, res: Response) => {
        void (async () => {
            const { username, password } = req.body;

            if (typeof username !== "string" || typeof password !== "string") {
                return res.status(400).send({
                    error: "Bad request",
                    message: "Missing username or password",
                });
            }
            
            const isValid = await credentialsProvider.verifyPassword(username, password);

            if (!isValid) {
                return res.status(401).send({
                    error: "Unauthorized",
                    message: "Incorrect username or password",
                });
            }

            const token = await generateAuthToken(username, req.app.locals.JWT_SECRET);
            res.json({ token });
        })();
    });
}
