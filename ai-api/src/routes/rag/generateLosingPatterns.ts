import { Router } from "express";
import { getLosingPatternCollection } from "../../services/rag/losingPatternCollection";
import { client } from "../../lib/openai";

const router = Router();

router.post("/", async (req, res) => {
    const tradeCollection = await getLosingPatternCollection();

    // 過去の負けトレードを検索
    const result = await tradeCollection.query({
        queryTexts: ["負けトレードの特徴"],
        nResults: 50,
    });

    // LLM に負けパターン抽出を依頼
    const answer = await client.responses.create({
        model: "gpt-4.1-mini",
        input: `
            以下は過去の負けトレードです。
            共通点を分析し、負けパターンを抽出してください。

            【負けトレード】
            ${JSON.stringify(result.documents)}

            以下の JSON 形式で返してください：
            conditions は必ず string の配列で返してください。
            オブジェクトではなく、説明文の文字列にしてください。

            {
                "name": "",
                "description": "",
                "conditions": [],
                "reason": "",
                "notes": ""
            }
        `
    });

    // LLMの出力を取得
    let raw = answer.output_text;

    // コードブロックを除去
    raw = raw.replace(/```json/g, "").replace(/```/g, "").trim();

    // JSONにパース
    const pattern = JSON.parse(raw);

    // Chromaに保存
    await tradeCollection.upsert({
        ids: [`losing_${Date.now()}`],
        documents: [JSON.stringify(pattern)],
    });

    // UIに返す（object のまま返す）
    res.json({ message: "負けパターン辞書を更新しました", pattern });


});

export default router;
