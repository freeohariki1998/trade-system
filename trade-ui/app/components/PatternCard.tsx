"use client";

export type Pattern = {
    name: string;
    description: string;
    conditions: string[];
    reason: string;
    notes: string;
};

export default function PatternCard({
    title,
    pattern,
}: {
    title: string;
    pattern: Pattern;
}) {
    return (
        <div className="border rounded-lg p-5 shadow-sm space-y-4">
            <h2 className="text-xl font-bold">{title}</h2>

            <div>
                <p className="text-gray-500 text-sm">パターン名</p>
                <p className="font-semibold">{pattern.name}</p>
            </div>

            <div>
                <p className="text-gray-500 text-sm">説明</p>
                <p>{pattern.description}</p>
            </div>

            <div>
                <p className="text-gray-500 text-sm">条件</p>
                <ul className="list-disc ml-5">
                    {pattern.conditions.map((c, i) => (
                        <li key={i}>{c}</li>
                    ))}
                </ul>
            </div>

            <div>
                <p className="text-gray-500 text-sm">勝ちやすい理由 / 負けやすい理由</p>
                <p>{pattern.reason}</p>
            </div>

            <div>
                <p className="text-gray-500 text-sm">注意点 / 対策</p>
                <p>{pattern.notes}</p>
            </div>
        </div>
    );
}
