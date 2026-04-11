import { Router } from "express";
import { client } from "../lib/openai";
import multer from "multer"
import { ChromaClient } from "chromadb";

const router = Router();

const chroma = new ChromaClient({
    host: "localhost",
    port: 8000,
    ssl: false
  });

router.post("/", async (req, res) => {
    // リクエストに質問が含まれているかチェック
    const { question } = req.body;
    if (!question) {
        return res.status(400).json({ error: "question が必要です" });
    }
    // PDFアップロード時に作成したコレクションを取得
    const collection = await chroma.getOrCreateCollection({name: "pdf_chunks"});
    
    // 質問文をベクトルに変換
    const queryEmbedding = await client.embeddings.create({
        model: "text-embedding-3-small",
        input: question,
    });
    // 念のためundefinedチェック
    const vector = queryEmbedding.data?.[0]?.embedding;
    if (!vector) return;
    
    // Chromaに保存されているPDFのチャンクから
    // 質問embeddingに最も近いものを検索
    const results = await collection.query({
        queryEmbeddings: [vector],
        nResults: 3,
    });

    // 検索結果を使ってLLMに回答させる
    const answer = await client.responses.create({
        model: "gpt-4.1-mini",
        input: `
    以下の情報を使って質問に答えてください。
    
    【検索結果】
    ${results.documents.flat().join("\n")}
    
    【質問】
    ${question}
    `,
      });
    
      res.json({ answer: answer.output_text });
})

export default router;