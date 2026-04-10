import { Router } from "express";
import { buildTradeData } from "../../services/trades/buildTradeData";
import { analyzeSummary } from "../../services/trades/analyzeSummary";
import { analyzePatterns } from "../../services/trades/analyzePatterns";
import { RawTrade } from "../../types/rawTrade";
import { client } from "../../lib/openai";
import { getPairedTrades } from "../../services/trades/pairTrades";

const router = Router();


router.post("/", async (req, res) => {
  const rawTrades = await getPairedTrades(); // ★ DB から ENTRY/SELL をペアリング

  const trades = await Promise.all(rawTrades.map(t => buildTradeData(t)));

  const summary = analyzeSummary(trades);
  const patterns = analyzePatterns(trades);

    // LLM に自然言語でまとめさせる
  const answer = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
      あなたは「ブレイクの質」「チャートの綺麗さ」「出来高の連続性」「波の位置」を重視するトレーダーです。
      以下の Trade データをもとに、あなたのロジックに沿って勝ち負けの理由を分析してください。

      【トレードデータ】
      ${JSON.stringify(trades)}
      `

  });

  res.json({
    summary,
    patterns,
    analysis: answer.output_text
  });

  // res.json({ summary, patterns, trades });
});

// router.post("/", async (req, res) => {
//   const rawTrades: RawTrade[] = req.body.trades;

//   if (!rawTrades) {
//     return res.status(400).json({ error: "trades が必要です" });
//   }

//   // 加工済み Trade を生成
//   const trades = await Promise.all(rawTrades.map(t => buildTradeData(t)));

//   // 基本統計
//   const summary = analyzeSummary(trades);

//   // 勝ちパターン / 負けパターン抽出
//   const patterns = analyzePatterns(trades);



// res.json({
//     summary,
//     patterns,
//     trades, // ← これ入れておくとデバッグしやすい
//   });
// });

export default router;
