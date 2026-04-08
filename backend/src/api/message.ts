import { Router, Request, Response } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";
interface AuthRequest extends Request {
    user?: {
        userId: number;
    };
}

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const posts = await prisma.post.findMany({ 
            include: { 
                author: {
                    select: { username: true } 
                } 
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(posts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка при получении постов" });
    }
});

router.post("/", authMiddleware, async (req: AuthRequest, res: Response) => {
    const { title, content } = req.body;
    
    if (!title) {
        return res.status(400).json({ error: "Заголовок обязателен" });
    }

    try {
        const newPost = await prisma.post.create({
            data: {
                title,
                content,
                authorId: req.user!.userId 
            },
            include: { author: true }
        });
        res.json(newPost);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка при создании поста" });
    }
});


router.put("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const post = await prisma.post.findUnique({ where: { id: Number(id) } });

        if (!post) {
            return res.status(404).json({ error: "Пост не найден" });
        }

        if (post.authorId !== req.user!.userId) {
            return res.status(403).json({ error: "Нет прав на редактирование этого сообщения" });
        }

        const updatedPost = await prisma.post.update({
            where: { id: Number(id) },
            data: { title, content }
        });
        res.json(updatedPost);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка при обновлении" });
    }
});


router.delete("/:id", authMiddleware, async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    try {
        const post = await prisma.post.findUnique({ where: { id: Number(id) } });

        if (!post) {
            return res.status(404).json({ error: "Пост не найден" });
        }

        if (post.authorId !== req.user!.userId) {
            return res.status(403).json({ error: "Нет прав на удаление" });
        }

        await prisma.post.delete({ where: { id: Number(id) } });
        res.json({ message: "Успешно удалено" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Ошибка при удалении" });
    }
});

export default router;