"use client";

export default function Home() {
  const menus = [
    // --- トレード系 ---
    { title: "トレード一覧", href: "/trades", icon: "📊" },
    { title: "分析ダッシュボード", href: "/dashboard", icon: "📈" },
    { title: "類似検索（RAG）", href: "/trades/analyze", icon: "🔍" },
    { title: "パターン辞書", href: "/patterns", icon: "🧩" },

    // --- AI / RAG 系 ---
    { title: "AI チャット", href: "/chat", icon: "🤖" },
    { title: "RAG 質問", href: "/ask", icon: "❓" },
    { title: "勝ちパターン生成", href: "/patterns/winning", icon: "🏆" },
    { title: "負けパターン生成", href: "/patterns/losing", icon: "💀" },

    // --- ユーティリティ ---
    { title: "PDF 要約", href: "/pdf", icon: "📄" },
    { title: "設定", href: "/settings", icon: "⚙️" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">メニュー</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {menus.map((m) => (
          <a
            key={m.title}
            href={m.href}
            className="p-6 bg-gray-800 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors shadow-sm flex flex-col items-center justify-center gap-3"
          >
            <div className="text-4xl">{m.icon}</div>
            <div className="text-lg font-semibold">{m.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
