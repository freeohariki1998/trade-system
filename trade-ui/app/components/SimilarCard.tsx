export function SimilarCard({
    trade,
    similar,
    distances,
}: {
    trade: any;
    similar: any[];
    distances: number[];
}) {
    return (
        <div className="p-4 shadow rounded border space-y-4">

            {/* 今日のトレード */}
            <div>
                <h3 className="text-lg font-bold mb-2">今日のトレード</h3>
                <TradeMiniView trade={trade} />
            </div>

            {/* 類似トレード */}
            <div>
                <h4 className="text-md font-semibold mb-2">類似トレード</h4>

                {similar.length === 0 && (
                    <p className="text-gray-500 text-sm">類似トレードは見つかりませんでした。</p>
                )}

                <div className="space-y-3">
                    {similar.map((doc, i) => {
                        const distance = distances[i];
                        const similarity = Math.round((1 - distance) * 100);

                        return (
                            <div
                                key={i}
                                className="p-3 rounded border bg-gray-900/5 relative"
                            >
                                {/* 類似度バッジ */}
                                <div className="absolute top-2 right-2 text-xs px-2 py-1 bg-gray-900/20 border rounded shadow-sm text-gray-300">
                                    類似度 {similarity}%
                                </div>

                                {/* コード */}
                                <div className="font-semibold mb-2 text-gray-200">
                                    コード: {doc.code}
                                </div>

                                <div className="grid grid-cols-2 gap-y-1 text-sm">
                                    <KV label="ブレイク強度" value={doc.breakout_quality} />
                                    <KV label="ローソク品質" value={doc.candle_quality} />
                                    <KV label="出来高品質" value={doc.volume_quality} />
                                    <KV label="波の位置" value={doc.wave_position} />
                                    <KV label="トレンド" value={doc.trend_5min} />
                                    <KV
                                        label="上ヒゲ/下ヒゲ"
                                        value={`${doc.wick_upper_strength ?? 0} / ${doc.wick_lower_strength ?? 0}`}
                                    />
                                    <KV label="チョッピー" value={doc.is_choppy ? "あり" : "なし"} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function KV({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-400">{label}</span>
            <span className="font-medium text-gray-200">{value}</span>
        </div>
    );
}

function TradeMiniView({ trade }: { trade: any }) {
    const profit = (trade.exit_price - trade.entry_price) * trade.qty;
    const profitColor = profit >= 0 ? "text-green-400" : "text-red-400";

    return (
        <div className="p-2 bg-gray-900/5 rounded text-sm space-y-1">
            <KV label="コード" value={trade.code} />
            <KV label="方向" value={trade.side} />
            <KV label="エントリー" value={trade.entry_price} />
            <KV label="イグジット" value={trade.exit_price} />
            <KV label="数量" value={trade.qty} />
            <KV label="トレンド" value={trade.trend_5min} />
            <KV label="波の位置" value={trade.wave_position} />

            {/* 損益（緑/赤） */}
            <div className="flex justify-between">
                <span className="text-gray-400">損益</span>
                <span className={`font-bold ${profitColor}`}>
                    {profit}
                </span>
            </div>
        </div>
    );
}
