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
        <div className="p-4 shadow rounded border  space-y-4">

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
                    {similar.map((doc, i) => (
                        <div
                            key={i}
                            className="p-3 rounded border  relative"
                        >
                            {/* 距離 */}
                            <div className="absolute top-2 right-2 text-xs text-gray-500">
                                距離: {distances[i].toFixed(3)}
                            </div>

                            <div className="font-semibold mb-1">
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
                                    value={`${doc.wick_upper_strength} / ${doc.wick_lower_strength}`}
                                />
                                <KV label="チョッピー" value={doc.is_choppy ? "あり" : "なし"} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function KV({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex justify-between">
            <span className="text-gray-500">{label}</span>
            <span className="font-medium">{value}</span>
        </div>
    );
}

function TradeMiniView({ trade }: { trade: any }) {
    return (
        <div className="p-2  rounded text-sm space-y-1">
            <KV label="コード" value={trade.code} />
            <KV label="方向" value={trade.side} />
            <KV label="エントリー" value={trade.entry_price} />
            <KV label="イグジット" value={trade.exit_price} />
            <KV label="数量" value={trade.qty} />
            <KV label="トレンド" value={trade.trend_5min} />
            <KV label="波の位置" value={trade.wave_position} />
        </div>
    );
}
