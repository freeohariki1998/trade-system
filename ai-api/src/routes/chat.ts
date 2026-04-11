import { Router } from "express";
import { client } from "../lib/openai";
const router = Router();

// ブラウザで確認したい用（GET）
router.get("/", (req, res) => {
  res.send("GET OK: Hello from /api/chat");
});

// AIを呼び出すAPI
// 参考サイト:https://developers.openai.com/api/docs/guides/text
router.post("/", async (req, res) => {
    // クライアントからmessageを取得して、stringに変換
  const message: unknown = req.body?.message;
  const userContent = typeof message === "string" ? message : "";

  const completion = await client.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      { role: "developer", content: "You are a helpful assistant." },
      { role: "user", content: userContent },
    ],
  });

  res.json({ content: completion.choices[0]?.message?.content ?? "" });
});

export default router;
