"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    fetch("http://localhost:3001/api/chat")
      .then(res => res.text())
      .then(console.log)
      .catch(console.error);
  }, []);

  return <div>API 接続テスト中…</div>;
}
