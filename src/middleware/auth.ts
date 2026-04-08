import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Нет токена" });

    try {
        const decoded = jwt.verify(token, "Elite_barbarians69");
        req.user = decoded;6
        next();
    } catch (e) {
        res.status(401).json({ error: "Неверный токен" });
    }
};