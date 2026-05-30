@AGENTS.md

## デザイン原則
- カラーパレット：primary=#0F4C8A、accent=#00B4D8、bg=#F0F4F8
- 色覚多様性対応：赤/緑の組み合わせを使わない
- フォント：Noto Sans JP + Inter
- カード型UI：rounded-xl、shadow-md
- レスポンシブ：モバイル・タブレット対応必須
- 既存のロジック・型・APIは変更しない、デザインのみ修正

## 技術スタック
- Next.js App Router、TypeScript、Tailwind CSS
- Prisma + PostgreSQL（Neon）
- NextAuth.js v5