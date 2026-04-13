"use client";

import { useState } from "react";
import { uploadPdf } from "@/src/lib/apiClient";

export default function PdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState("");

    async function handleUpload() {
        if (!file) return;
        const res = await uploadPdf(file);
        setResult(JSON.stringify(res, null, 2))
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>PDF アップロード</h1>

            <input
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <button onClick={handleUpload} style={{ marginLeft: 10 }}>
                アップロード
            </button>

            <pre style={{ marginTop: 20, padding: 10 }} >
                {result}
            </pre>
        </div>
    )
}