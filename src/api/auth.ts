import express, { Request, Response } from "express";
import { hashPass } from "../utils/hashPass";
import prisma from "../db";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

const router = express.Router();

router.post("/login", async function (params) {});
router.post("/logout", async function (params) {});

router.post(
  "/register",
  async function (req: Request<{}, {}, RegisterBody>, res: Response) {
    try {
      const { username, email, password } = req.body;
      if (!email || !password || !username)
        throw new Error("Email or password error1");
      if (email) {
      } // есть ли такой пользователь в бд
      const hashedPass = await hashPass(password);
      const newUser = prisma.user.create({
        data: { username, email, password: hashedPass },
      });
      return res.status(200).json({ text: newUser });
    } catch (e) {
      return res.status(400).json({ error: e });
    }
  },
);

export default router;
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET_KEY = "Elite_barbarians69";

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) return res.status(404).json({ error: "Пользователь не найден" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: "Неверный пароль" });

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: "1d" });
        
        res.json({ message: "Успешный вход", token });
    } catch (e) {
        res.status(500).json({ error: e });
    }
});
