import { Router } from "express";
import { getWinningPatternCollection } from "../../services/rag/winningPatternCollection";
import { client } from "../../lib/openai";

const router = Router();

router.post("/", async (req, res) => {
    const tradeCollection = await getWinningPatternCollection();

    // 過去の勝ちトレードを検索
    const result = await tradeCollection.query({
        queryTexts: ["強い勝ちトレードの特徴"],
        nResults: 50,
    });

    // LLM に勝ちパターン抽出を依頼
    const answer = await client.responses.create({
        model: "gpt-4.1-mini",
        input: `
            以下は過去の勝ちトレードです。
            共通点を分析し、勝ちパターンを抽出してください。

            【勝ちトレード】
            ${JSON.stringify(result.documents)}

            以下を出力してください：
            1. 勝ちパターンの名前
            2. パターンの説明
            3. そのパターンの条件（数値ベース）
            4. そのパターンが勝ちやすい理由
            5. そのパターンの注意点
                `
    });

    const pattern = answer.output_text;

    // パターン辞書に保存
    await tradeCollection.upsert({
        ids: [`pattern_${Date.now()}`],
        documents: [pattern],
    });

    res.json({ message: "勝ちパターン辞書を更新しました", pattern });
});

export default router;
