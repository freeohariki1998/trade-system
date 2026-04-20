"use client";
import { fetchTrades } from "@/src/lib/apiClient";
import { useEffect, useState } from "react";

type Trade = {
    id: number;
    code: string;
    entry_time: string;
    exit_time: string;
    entry_price: string;
    exit_price: string;
    qty: number;
}


export default function DashboardPage() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const run = async () => {
            try {
                const data = await fetchTrades();
                setTrades(data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, []);

    if (loading) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold">分析ダッシュボード</h1>
                <div className="mt-4 text-gray-400">読み込み中...</div>
            </div>
        );
    }

    if (!trades.length) {
        return (
            <div className="p-6">
                <h1 className="text-3xl font-bold">分析ダッシュボード</h1>
                <div className="mt-4 text-gray-400">トレードデータがありません。</div>
            </div>
        )
    }

    // 計算
    const profits = trades.map((t) => {
        const entry = Number(t.entry_price);
        const exit = Number(t.exit_price);
        return (exit - entry) * t.qty;
    })

    const totalProfit = profits.reduce((a, b) => a + b, 0);

    const wins = profits.filter((p) => p > 0);
    const losses = profits.filter((p) => p < 0);

    const winCount = wins.length;
    const lossCount = losses.length;
    const tradeCount = winCount + lossCount;

    const winRate = tradeCount > 0 ? (winCount / tradeCount) * 100 : 0;

    const avgWin = winCount > 0 ? wins.reduce((a, b) => a + b, 0) / winCount : 0;
    const avgLoss = lossCount > 0 ? wins.reduce((a, b) => a + b, 0) / lossCount : 0;

    const grossWin = winCount > 0 ? wins.reduce((a, b) => a + b, 0) : 0;
    const grossLoss = lossCount > 0 ? losses.reduce((a, b) => a + b, 0) : 0;
    const profitFactor = grossLoss !== 0 ? grossWin / Math.abs(grossLoss) : 0;

    const expectedValue =
        tradeCount > 0
            ? (winRate / 100) * avgWin + (1 - winRate / 100) * avgLoss
            : 0;

    let peak = 0;
    let maxDD = 0;
    let cumulative = 0;

    let winStreak = 0;
    let lossStreak = 0;
    let maxWinStreak = 0;
    let maxLossStreak = 0;

    for (const p of profits) {
        cumulative += p;
        peak = Math.max(peak, cumulative);
        maxDD = Math.min(maxDD, cumulative - peak);

        if (p > 0) {
            winStreak++;
            lossStreak = 0;
        } else if (p < 0) {
            lossStreak++;
            winStreak = 0;
        }
        maxWinStreak = Math.max(maxWinStreak, winStreak);
        maxLossStreak = Math.max(maxLossStreak, lossStreak);
    }
    const holdingTimesMs = trades.map((t) => {
        const entry = new Date(t.entry_time).getTime();
        const exit = new Date(t.exit_time).getTime();
        return exit - entry;
    }).filter((ms) => ms > 0);

    const avgHoldMs =
        holdingTimesMs.length > 0
            ? holdingTimesMs.reduce((a, b) => a + b, 0) / holdingTimesMs.length
            : 0;

    const avgHoldMinutes = avgHoldMs / 1000 / 60;

    const dailyPnL: Record<string, number> = {};
    trades.forEach((t, i) => {
        const date = t.entry_time.slice(0, 10);
        dailyPnL[date] = (dailyPnL[date] || 0) + profits[i];
    });

    const dailyList = Object.entries(dailyPnL).sort(
        (a, b) => a[0].localeCompare(b[0])
    );

    const codePnL: Record<string, number> = {};
    trades.forEach((t, i) => {
        codePnL[t.code] = (codePnL[t.code] || 0) + profits[i];
    });

    const codeList = Object.entries(codePnL).sort(
        (a, b) => Math.abs(b[1]) - Math.abs(a[1])
    );

    const cumulativeSeries = profits.reduce<number[]>((acc, p) => {
        const last = acc.length ? acc[acc.length - 1] : 0;
        acc.push(last + p);
        return acc;
    }, []);

    const maxCum = Math.max(...cumulativeSeries, 0);
    const minCum = Math.min(...cumulativeSeries, 0);
    const span = Math.max(maxCum - minCum, 1);

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold">分析ダッシュボード</h1>

            {/* KPI 上段 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                    label="合計損益"
                    value={`${Math.round(totalProfit).toLocaleString()} 円`}
                    highlight={totalProfit}
                />
                <KpiCard
                    label="勝率"
                    value={`${winRate.toFixed(1)} %`}
                />
                <KpiCard
                    label="Profit Factor"
                    value={profitFactor.toFixed(2)}
                />
                <KpiCard
                    label="期待値 / トレード"
                    value={`${Math.round(expectedValue).toLocaleString()} 円`}
                    highlight={expectedValue}
                />
            </div>

            {/* KPI 下段 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <KpiCard
                    label="平均利益"
                    value={`${Math.round(avgWin).toLocaleString()} 円`}
                    highlight={avgWin}
                />
                <KpiCard
                    label="平均損失"
                    value={`${Math.round(avgLoss).toLocaleString()} 円`}
                    highlight={avgLoss}
                />
                <KpiCard
                    label="最大ドローダウン"
                    value={`${Math.round(maxDD).toLocaleString()} 円`}
                    highlight={maxDD}
                />
                <KpiCard
                    label="トレード数"
                    value={`${tradeCount} 回`}
                />
            </div>

            {/* 連勝・連敗・平均保持時間 */}
            <div className="grid grid-cols-3 gap-4">
                <KpiCard
                    label="最大連勝"
                    value={`${maxWinStreak} 回`}
                />
                <KpiCard
                    label="最大連敗"
                    value={`${maxLossStreak} 回`}
                />
                <KpiCard
                    label="平均保持時間"
                    value={`${avgHoldMinutes.toFixed(1)} 分`}
                />
            </div>

            {/* 累積損益（簡易テキストグラフ） */}
            <div className="p-6 bg-gray-800 rounded border border-gray-700 space-y-3">
                <div className="text-lg font-semibold">累積損益（簡易）</div>
                <div className="space-y-1 text-xs text-gray-400">
                    {cumulativeSeries.map((v, i) => {
                        const ratio = (v - minCum) / span;
                        const width = Math.round(ratio * 100);
                        return (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-16 text-right text-gray-500">
                                    {i + 1}
                                </div>
                                <div className="flex-1 bg-gray-900 h-2 rounded overflow-hidden">
                                    <div
                                        className={
                                            "h-2 " +
                                            (v >= 0 ? "bg-green-500" : "bg-red-500")
                                        }
                                        style={{ width: `${width}%` }}
                                    />
                                </div>
                                <div className="w-24 text-right">
                                    {Math.round(v).toLocaleString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 日別損益 */}
            <div className="p-6 bg-gray-800 rounded border border-gray-700 space-y-3">
                <div className="text-lg font-semibold">日別損益</div>
                <div className="space-y-1 text-sm">
                    {dailyList.map(([date, pnl]) => (
                        <div
                            key={date}
                            className="flex justify-between border-b border-gray-700/50 py-1"
                        >
                            <span>{date}</span>
                            <span
                                className={
                                    pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : ""
                                }
                            >
                                {Math.round(pnl).toLocaleString()} 円
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 銘柄別損益ランキング */}
            <div className="p-6 bg-gray-800 rounded border border-gray-700 space-y-3">
                <div className="text-lg font-semibold">銘柄別損益ランキング</div>
                <div className="space-y-1 text-sm">
                    {codeList.map(([code, pnl]) => (
                        <div
                            key={code}
                            className="flex justify-between border-b border-gray-700/50 py-1"
                        >
                            <span>{code}</span>
                            <span
                                className={
                                    pnl > 0 ? "text-green-400" : pnl < 0 ? "text-red-400" : ""
                                }
                            >
                                {Math.round(pnl).toLocaleString()} 円
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function KpiCard({
    label,
    value,
    highlight,
}: {
    label: string;
    value: string | number;
    highlight?: number;
}) {
    const color =
        highlight === undefined
            ? ""
            : highlight > 0
                ? "text-green-400"
                : highlight < 0
                    ? "text-red-400"
                    : "";

    return (
        <div className="p-4 bg-gray-800 rounded border border-gray-700 space-y-1">
            <div className="text-xs text-gray-400">{label}</div>
            <div className={`text-xl font-bold ${color}`}>{value}</div>
        </div>
    );
}