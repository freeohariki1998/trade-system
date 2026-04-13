"use client"

import { useState } from "react";
import { generateWinningPatterns, generateLosingPatterns } from "@/src/lib/apiClient";
import PatternCard, { Pattern } from "./PatternCard";
export default function generatePatterns() {
    const [loading, setLoading] = useState(false);
    const [winning, setWinning] = useState<Pattern | null>(null);
    const [losing, setLosing] = useState<Pattern | null>(null);


    async function generatePatterns() {
        setLoading(true);

        const win = await generateWinningPatterns();
        const lose = await generateLosingPatterns();

        setWinning(win.pattern);
        setLosing(lose.pattern);


        setLoading(false);
    }


    return (
        <div className="p-6 space-y-6 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold">パターン辞書生成</h1>

            <button
                onClick={generatePatterns}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow"
            >
                {loading ? "生成中..." : "勝ち/負けパターンを生成する"}
            </button>

            {winning && <PatternCard title="勝ちパターン" pattern={winning} />}
            {losing && <PatternCard title="負けパターン" pattern={losing} />}
        </div>
    );
}