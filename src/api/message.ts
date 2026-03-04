import { Router } from "express";
import prisma from "../db";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
    const posts = await prisma.post.findMany({ include: { author: true } });
    res.json(posts);
});

router.post("/", authMiddleware, async (req: any, res) => {
    const { title, content } = req.body;
    const newPost = await prisma.post.create({
        data: {
            title,
            content,
            authorId: req.user.userId 
        }
    });
    res.json(newPost);
});

router.delete("/:id", authMiddleware, async (req, res) => {
    await prisma.post.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Удалено" });
});

export default router;