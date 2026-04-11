import { Router } from "express";
import { buildTradeData } from "../../services/trades/buildTradeData";
import { analyzeSummary } from "../../services/trades/analyzeSummary";
import { analyzePatterns } from "../../services/trades/analyzePatterns";
import { RawTrade } from "../../types/rawTrade";
import { Trade } from "../../types/trade";
import { client } from "../../lib/openai";
import { getPairedTrades } from "../../services/trades/pairTrades";
import { getTradeCollection } from "../../services/rag/chromaClient"
import { getWinningPatternCollection } from "../../services/rag/winningPatternCollection";
import { getLosingPatternCollection } from "../../services/rag/losingPatternCollection";

const router = Router();
type SimilarItem = {
  doc: any;
  distance: number | null;
};
router.post("/", async (req, res) => {
  const rawTrades = await getPairedTrades(); // ★ DB から ENTRY/SELL をペアリング

  const trades = await Promise.all(rawTrades.map(t => buildTradeData(t)));
  console.log("trades after build:", trades);

  const winningTrades = trades.filter(t => isWinningTrade(t));
  const losingTrades = trades.filter(t => !isWinningTrade(t));

  // ★ 勝ちトレードを Chroma に保存
  const tradeCollection = await getTradeCollection();
  await tradeCollection.upsert({
    ids: winningTrades.map(t => `win_${t.code}_${t.entry_price}_${t.exit_price}`),
    documents: winningTrades.map(t => toEmbeddingQuery(t)),
  });

  // ★ 負けトレードを負けパターン辞書に保存
  const losingPatternCollection = await getLosingPatternCollection();
  await losingPatternCollection.upsert({
    ids: losingTrades.map(t => `lose_${t.code}_${t.entry_time}`),
    documents: losingTrades.map(t => toEmbeddingQuery(t)),
  });

  // 過去の類似トレード検索
  const collection = await getTradeCollection();

  const similarAll: any[] = [];
  for (const trade of trades) {
    const query = toEmbeddingQuery(trade);

    const result = await collection.query({
      queryTexts: [query],
      nResults: 5,
    });

    const docs = result.documents[0] ?? [];
    const distances = result.distances[0] ?? [];

    const filtered = docs
      .map((doc, i): SimilarItem => {
        const d = distances[i] ?? null;
        return { doc, distance: d };
      })
      .filter(
        (item): item is SimilarItem & { distance: number } =>
          item.distance !== null && item.distance < 0.25
      );

    similarAll.push({
      trade,
      similar: filtered.map(f => f.doc),
      distances: filtered.map(f => f.distance),
    });
  }

  const patternCollection = await getWinningPatternCollection();

  const patternMatch = await patternCollection.query({
    queryTexts: trades.map(t => toEmbeddingQuery(t)),
    nResults: 1,
  });


  const losingPatternMatch = await losingPatternCollection.query({
    queryTexts: trades.map(t => toEmbeddingQuery(t)),
    nResults: 1,
  });



  const summary = analyzeSummary(trades);
  const patterns = analyzePatterns(trades);

  // LLM に自然言語でまとめさせる
  const answer = await client.responses.create({
    model: "gpt-4.1-mini",
    input: `
      あなたは「ブレイクの質」「チャートの綺麗さ」「出来高の連続性」「波の位置」を最重要視するトレーダーです。
      また、以下の基準でトレードを評価します：

      - ブレイクの質：出来高の伴った明確な抜けか、騙しのブレイクか
      - チャートの綺麗さ：連続性、飛び飛び、ノイズ、チョッピーさ
      - 出来高の連続性：5分足の出来高が継続しているか、単発か
      - 波の位置：上昇波のどこで入ったか（初動・中盤・後半）
      - ヒゲの強さ：上ヒゲ・下ヒゲの圧力
      - トレンド：5分足の方向性と強さ
      - 市場の強さ：指数や全体の流れとの整合性

      【今日のトレード（加工済みデータ）】
      ${JSON.stringify(trades)}

      【今日のトレードの統計サマリー】
      ${JSON.stringify(summary)}

      【今日のトレードの勝ち/負けパターン分析】
      ${JSON.stringify(patterns)}

      【各トレードに対する過去の類似トレード（RAG検索結果）】
      ${JSON.stringify(similarAll)}

      【勝ちパターン辞書との一致（パターンマッチ結果）】
      ${JSON.stringify(patternMatch)}

      【負けパターン辞書との一致】
      ${JSON.stringify(losingPatternMatch)}

      上記すべてを踏まえて、以下を出力してください：

      1. 今日のトレード全体の総評（あなたのロジックに基づく）
      2. 各トレードごとの勝ち負けの理由（あなたのロジックに基づく）
      3. 過去の類似トレードとの共通点・相違点（RAG結果を参照）
      4. 勝ちパターン辞書との一致状況と、その意味
      5. 負けトレードの改善点（具体的に、明日から実行できる形で）
      6. 勝ちトレードの再現ポイント（具体的に）
      7. 今日のトレード全体の改善方針（あなたのロジックに基づく）
      8. 新しく発見された可能性のある勝ちパターン（あれば）
      9. 負けパターン辞書との一致状況と、その意味
      10. 避けるべき負けパターンの明確化

    `
  });


  res.json({
    summary,
    patterns,
    similar: similarAll,
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
function toEmbeddingQuery(t: Trade) {
  return JSON.stringify({
    code: t.code,


    // 重み付け

    breakout_quality: t.breakout_quality * 10,
    breakout_comment: `breakout quality is ${t.breakout_quality}, representing breakout strength`,
    // 重要ロジック
    candle_quality: t.candle_quality,
    volume_quality: t.volume_quality,
    wave_position: t.wave_position,

    // 補助的に重要な特徴
    is_choppy: t.is_choppy,
    wick_upper_strength: t.wick_upper_strength,
    wick_lower_strength: t.wick_lower_strength,
    trend_5min: t.trend_5min,
    consecutive_green: t.consecutive_green,
    consecutive_red: t.consecutive_red,

    // 市場環境
    market_strength: t.market_strength,
  });
}

function isWinningTrade(t: Trade) {
  const profit = (t.exit_price - t.entry_price) * t.qty;
  return profit > 0;
}


export default router;
