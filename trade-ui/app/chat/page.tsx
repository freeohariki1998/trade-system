"use client"

import { useState } from "react";
import { chat } from "@/src/lib/apiClient";

export default function ChatPage() {
    const [input, setInput] = useState("");
    const [reply, setReply] = useState("");

    async function handleSend() {
        const res = await chat(input);
        setReply(res);
    }

    return (
        <div style={{ padding: 20 }}>
            <h1>AI Chat</h1>

            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="メッセージを入力"
                style={{ width: "300px", marginRight: "10px" }}
            />

            <button onClick={handleSend}>送信</button>

            <div style={{ marginTop: 20 }}>
                <strong>AI: </strong> {reply}
            </div>
        </div>
    )
}