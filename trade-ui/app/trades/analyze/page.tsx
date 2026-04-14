"use client";

import { useState } from "react";
import { analyzeTrades } from "@/src/lib/apiClient";
import { parseAnalysis } from "@/src/lib/parseAnalysis";
import { KpiCard } from "../../components/KpiCard";
import { SimilarCard } from "../../components/SimilarCard";
import { AnalyzePatternCard } from "../../components/AnalyzePatternCard";
import type { Pattern } from "../../components/PatternCard";

export default function AnalyzePage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [open, setOpen] = useState<string | null>(null);

    async function runAnalysis() {
        setLoading(true);
        const data = await analyzeTrades();
        setResult(data);
        setLoading(false);
    }

    function toggle(key: string) {
        setOpen(open === key ? null : key);
    }

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold">トレード分析</h1>

            <button
                onClick={runAnalysis}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 rounded"
            >
                {loading ? "分析中..." : "今日のトレードを分析する"}
            </button>

            {result && (
                <div className="space-y-8">

                    {/* トレードなし */}
                    {!result.summary && (
                        <section className="border p-4 rounded shadow">
                            <h2 className="text-xl font-bold mb-2">本日の結果</h2>
                            <p>
                                今日はトレードログがありませんでした。
                            </p>
                        </section>
                    )}

                    {/* ★ summary（KPIカード） */}
                    {result.summary && (
                        <section>
                            <h2 className="text-xl font-bold mb-2">統計サマリー</h2>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <KpiCard
                                    label="勝率"
                                    value={result.summary.win_rate.toFixed(1)}
                                    unit="%"
                                />
                                <KpiCard
                                    label="総利益"
                                    value={result.summary.total_profit}
                                    unit="円"
                                />
                                <KpiCard
                                    label="トレード数"
                                    value={result.summary.trade_count}
                                />
                            </div>
                        </section>
                    )}

                    {/* ★ similar（類似トレードカード） */}
                    {result.similar && result.similar.length > 0 && (
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold">類似トレード（RAG）</h2>

                            <div className="space-y-4">
                                {result.similar.map((item: any, i: number) => (
                                    <SimilarCard
                                        key={i}
                                        trade={item.trade}
                                        similar={item.similar}
                                        distances={item.distances}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* ★ analysis（アコーディオン） */}
                    {result.summary &&
                        Object.entries(parseAnalysis(result.analysis)).map(([key, value]) => (
                            <section
                                key={key}
                                className="border rounded  shadow"
                            >
                                <button
                                    onClick={() => toggle(key)}
                                    className="w-full text-left px-4 py-3 flex justify-between items-center"
                                >
                                    <span className="text-lg font-bold">
                                        {sectionTitle(key)}
                                    </span>
                                    <span className="text-gray-500">
                                        {open === key ? "▲" : "▼"}
                                    </span>
                                </button>

                                {open === key && (
                                    <div className="px-4 pb-4 whitespace-pre-wrap leading-relaxed">
                                        {value}
                                    </div>
                                )}
                            </section>
                        ))}

                    {/* ★ patterns（勝ち/負けパターン） */}
                    {result.patterns && (
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold">勝ち/負けパターン</h2>

                            {/* 勝ちパターン */}
                            {result.patterns.winning?.map((p: Pattern, i: number) => (
                                <AnalyzePatternCard key={i} pattern={p} type="win" />
                            ))}

                            {/* 負けパターン */}
                            {result.patterns.losing?.map((p: Pattern, i: number) => (
                                <AnalyzePatternCard key={i} pattern={p} type="lose" />
                            ))}
                        </section>
                    )}


                </div>
            )}
        </div>
    );
}

function sectionTitle(key: string) {
    const titles: Record<string, string> = {
        "1": "今日のトレード全体の総評",
        "2": "各トレードごとの勝ち負けの理由",
        "3": "過去の類似トレードとの共通点・相違点",
        "4": "勝ちパターン辞書との一致状況",
        "5": "負けトレードの改善点",
        "6": "勝ちトレードの再現ポイント",
        "7": "今日のトレード全体の改善方針",
        "8": "新しく発見された勝ちパターン",
        "9": "負けパターン辞書との一致状況",
        "10": "避けるべき負けパターンの明確化",
    };

    return titles[key] ?? `セクション ${key}`;
}
