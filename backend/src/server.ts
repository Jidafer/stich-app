import express, { Request, Response } from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRouter from "./api/auth";
import messageRouter from "./api/message";
import { registerChatHandlers } from "./socket/chatSocket";

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors({ 
    origin: "http://localhost:5173", 
    credentials: true 
}));

// API Роуты
app.use("/api/auth", authRouter);
app.use("/api/posts", messageRouter);

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok" });
});

// Создаем сервер
const httpServer = http.createServer(app);

// Настраиваем Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    }
});

// ПОДКЛЮЧАЕМ ЛОГИКУ ЧАТА
registerChatHandlers(io);

httpServer.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
