# 政治シミュレーションゲーム

## プロジェクト概要
日本政治を題材としたWebシミュレーションゲーム (MVP)。

## 設計ドキュメント
実装にあたっては必ず `docs/` 配下の設計書を参照すること:
- 要件・スコープ: requirements.md
- 機能・計算式: specification.md
- 画面構成: design.md
- データモデル: database.md + src/types.ts
- 技術構成: architecture.md
- 数値設計: game-balance.md
- テスト方針: testing.md

## 技術スタック
Vite + React 19 + TypeScript + Zustand + Tailwind + shadcn/ui
パッケージマネージャ: bun
Linter/Formatter: Biome
