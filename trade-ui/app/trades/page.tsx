"use client";
export const fetchCache = "force-no-store";

import { useEffect, useState } from "react";
import { fetchTrades } from "@/src/lib/apiClient";

type Trade = {
    id: string | number;
    code: string;
    qty: number;
    entry_price: number;
    exit_price: number;
    entry_time: string;
    exit_time: string;
};


export default function TradeListPage() {
    const [trades, setTrades] = useState<Trade[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterDate, setFilterDate] = useState("");
    const [filterCode, setFilterCode] = useState("");

    useEffect(() => {
        fetchTrades().then((data) => {
            setTrades(data);
            setLoading(false);
        });
    }, []);

    if (loading) return <div>読み込み中...</div>;
    // nullや0円のデータははじく、
    const validTrades = trades.filter(t => {
        if (!t.entry_time || t.entry_price == null || t.exit_price == null || t.qty == null) {
            return false;
        }
        const profit = (t.exit_price - t.entry_price) * t.qty;
        return Number.isFinite(profit) && profit !== 0;
    });

    const filteredTrades = validTrades.filter(t => {
        const date = t.entry_time.slice(0, 10);
        const mactchDate = filterDate ? date === filterDate : true;
        const matchCode = filterCode ? t.code.includes(filterCode) : true;
        return matchCode && mactchDate;
    })

    // 日付ごとにグルーピング
    const grouped = filteredTrades.reduce<Record<string, Trade[]>>((acc, t) => {
        const date = t.entry_time.slice(0, 10);
        acc[date] = acc[date] || [];
        acc[date].push(t);
        return acc;
    }, {});
    // トータル収支
    const totalProfit = filteredTrades.reduce((sum, t) => {
        return sum + (t.exit_price - t.entry_price) * t.qty;
    }, 0);

    //　各トレードの損益の計算
    const profits = filteredTrades.map(
        (t) => (Number(t.exit_price) - Number(t.entry_price)) * t.qty
    );
    // 勝ちトレード数
    const wins = profits.filter(p => p > 0).length;
    // 負けトレード数
    const losses = profits.filter(p => p < 0).length;
    // 勝率
    const winRate = wins + losses > 0
        ? (wins / (wins + losses)) * 100
        : 0;

    // 平均利益
    const avgWin = wins > 0
        ? profits.filter(p => p > 0).reduce((a, b) => a + b, 0) / wins
        : 0;
    // 平均損失
    const avgLoss = losses > 0
        ? profits.filter(p => p < 0).reduce((a, b) => a + b, 0) / losses
        : 0;

    // 勝ちトレードの合計 ÷ 負けトレードの絶対値合計
    const grossWin = profits.filter(p => p > 0).reduce((a, b) => a + b, 0);
    const grossLoss = profits.filter(p => p < 0).reduce((a, b) => a + b, 0);
    const profitFactor = grossLoss !== 0 ? grossWin / Math.abs(grossLoss) : 0;


    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold">トレード一覧</h1>
            <div className="text-3xl font-bold">
                合計損益:
                <span className={totalProfit > 0 ? "text-green-400" : "text-red-400"}>
                    {Math.round(totalProfit).toLocaleString()} 円
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-lg">
                <div>
                    勝率:
                    <span className="font-bold">
                        {winRate.toFixed(1)}%
                    </span>
                </div>

                <div>
                    平均利益:
                    <span className="font-bold text-green-400">
                        {Math.round(avgWin).toLocaleString()} 円
                    </span>
                </div>

                <div>
                    平均損失:
                    <span className="font-bold text-red-400">
                        {Math.round(avgLoss).toLocaleString()} 円
                    </span>
                </div>

                <div>
                    トレード数:
                    <span className="font-bold">
                        {wins + losses} 回
                    </span>
                </div>

                <div>
                    Profit Factor:
                    <span className="font-bold">
                        {profitFactor.toFixed(1)}
                    </span>
                </div>
            </div>
            <div className="flex gap-4 items-end">
                <div>
                    <label className="block text-sm text-gray-400">日付で絞り込み</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="px-2 py-1 bg-gray-800 border border-gray-600 rounded"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400">銘柄コードで絞り込み</label>
                    <input
                        type="text"
                        placeholder="例: 1234"
                        value={filterCode}
                        onChange={(e) => setFilterCode(e.target.value)}
                        className="px-2 py-1 bg-gray-800 border border-gray-600 rounded"
                    />
                </div>

            </div>

            {Object.entries(grouped).map(([date, list]) => {
                list.sort((a, b) => new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime());
                const totalDailyProfit = list.reduce((sum, t) => {
                    return sum + (Number(t.exit_price) - Number(t.entry_price)) * t.qty;
                }, 0);
                return (
                    <div key={date} className="space-y-2">
                        <h2 className="text-xl font-semibold flex items-center gap-3">
                            {date}
                            <span className={totalDailyProfit > 0 ? "text-green-400" : "text-red-400"}>
                                {Math.round(totalDailyProfit).toLocaleString()} 円
                            </span>
                        </h2>


                        <div className="divide-y divide-gray-700/50 border border-gray-700/50 rounded">
                            {list.map((t) => {
                                const profit = (t.exit_price - t.entry_price) * t.qty;
                                const color = profit > 0 ? "text-green-400" : "text-red-400";

                                const entryTime = new Date(t.entry_time).toLocaleTimeString("ja-JP", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });
                                const exitTime = new Date(t.exit_time).toLocaleTimeString("ja-JP", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                });

                                return (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between px-3 py-2 hover:bg-gray-800/40"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="font-semibold">{t.code}</span>
                                            <span className="text-gray-400">{entryTime} → {exitTime}</span>
                                            <span className={`font-bold ${color}`}>
                                                {Math.round(profit).toLocaleString()} 円
                                            </span>
                                        </div>

                                        <div className="flex gap-2">
                                            <a
                                                href={`/trades/analyze?code=${t.code}&date=${date}`}
                                                className="px-2 py-1 border rounded text-sm"
                                            >
                                                類似検索
                                            </a>
                                            <a
                                                href={`/trades/${t.id}`}
                                                className="px-2 py-1 border rounded text-sm"
                                            >
                                                詳細
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );



}
