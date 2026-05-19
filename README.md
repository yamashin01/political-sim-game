# 政治シミュレーションゲーム (仮称)

日本政治を題材としたWebシミュレーションゲームのMVP実装。プレイヤーは政党党首として10年間 (20ターン) の政治運営を体験し、政策決定のトレードオフ・選挙戦略・国際情勢への対応を通じて、政治の構造を学べる。

> 設計の基本方針: **シンプル : リアル = 7 : 3** / 特定の政治的立場に偏らない公平性 / 桃太郎電鉄のように設定をカスタマイズして繰り返し遊べる拡張性。詳細は `docs/` 参照。

## 技術スタック

| 領域 | 採用 |
|---|---|
| ビルド | Vite 6 |
| UI | React 19 + TypeScript |
| 状態管理 | Zustand + Immer |
| スタイリング | Tailwind CSS |
| UI部品 | shadcn/ui (Radix UI ベース) |
| テスト | Vitest |
| Linter/Formatter | Biome |
| パッケージマネージャ | bun |

## クイックスタート

```bash
bun install
bun run dev      # http://localhost:5173
```

タイトル画面で「新規ゲーム」→ 党設定 (党名・イデオロギー3軸) → ダッシュボードからフェーズを進める形でプレイできる。

## スクリプト

```bash
bun run dev       # 開発サーバー
bun run build     # 本番ビルド (tsc + vite build)
bun run preview   # ビルド成果物のプレビュー
bun run test      # Vitest でテスト実行
bun run lint      # Biome で Lint + Format チェック
bun run format    # Biome でフォーマット適用
```

## プロジェクト構成

設計書 (`docs/architecture.md`) の 4 層アーキテクチャに沿って構成。下位レイヤーは上位に依存しない。

```
src/
├── data/              # Data Layer: 政策・イベント・トレンド・政党・地方・シナリオ・balance係数
│   ├── policies/      # カテゴリ別の政策定義 (税制財政, 経済産業, ...)
│   ├── events/        # カテゴリ別のイベント定義
│   ├── scenarios/     # シナリオ定義 (初期GameStateの生成)
│   ├── balance.ts     # ゲームバランス係数 (α_ruling, τ_suppress 等)
│   └── registry.ts    # 静的データの集約 + 整合性チェック
├── engine/            # Logic Layer: 純粋関数 (副作用なし)
│   ├── ideology.ts    # イデオロギー乖離・距離
│   ├── policy.ts      # 政策通過判定 (必要議席率・結束度ボーナス)
│   ├── election.ts    # 選挙計算 (経済補正・端数調整)
│   ├── coalition.ts   # 連立形成 (距離順自動連立)
│   ├── trend.ts       # トレンド進行 (抑制係数)
│   ├── event.ts       # イベント発生判定 (定例・連鎖・確率抽選)
│   ├── score.ts       # 最終スコア・称号判定
│   ├── end-conditions.ts # 特殊終了判定
│   └── turn.ts        # ターン進行オーケストレーション
├── stores/            # State Layer: Zustand
│   ├── gameStore.ts   # GameState の保持と全アクション
│   └── uiStore.ts     # 画面ID・フェーズ・イベントキュー
├── components/        # UI Layer
│   ├── screens/       # 画面 (SC-01〜SC-11 全て)
│   ├── common/        # 共通レイアウト (Header/StatusBar/Footer)
│   └── ui/            # shadcn/ui 部品 (button, card, slider, ...)
├── utils/             # 汎用ユーティリティ
└── types.ts           # 全ドメイン型定義
```

## ゲームの流れ

1. **党設定**: 党名と党のイデオロギー (経済・社会・外交 各-2〜+2) を決める
2. **各ターン (6ヶ月)** を以下の順で進行
   - イベントフェーズ (定例 + ランダム/連鎖)
   - 政策フェーズ (1〜3本提出 → 通過判定)
   - 予算フェーズ (前半: 本予算 / 後半: 補正予算)
   - 指標更新 (政策・イベント・トレンド効果の合算)
   - (該当時) 選挙 → 連立交渉
3. **20ターン到達 or 特殊終了** で最終スコアと称号を表示

詳細フローは `docs/specification.md` 参照。

## 開発状況 (MVP)

| 項目 | 状況 |
|---|---|
| 4層アーキテクチャ・型システム | 完成 |
| engine の全主要モジュール | 実装済み |
| 11画面 (SC-01〜SC-11) | 実装済み |
| 政策データ | **14本** (各カテゴリ2本ずつ。設計目標は48本) |
| イベントデータ | **8本** (全カテゴリ網羅。設計目標は50本) |
| トレンドデータ | 5本 (完了) |
| Vitest テスト | 30件パス (engine / data整合性) |
| ゲームバランス数値 | **暫定値** (設計書の想定範囲の中央値を採用 — プレイテストで要調整) |

未完了・暫定の主要項目:
- 政策・イベントの本数を設計目標まで拡充
- 政策の遅延効果 (現状は全て即時扱い)
- イベントの `conditionKey` 評価関数 (条件付きランダム)
- 連立成立率 (`coalitionSuccessRate`) の確率判定組み込み
- 党分裂エンドの「3ターン連続<10」追跡 (現状は単一ターン判定)
- 連立健全度のターン毎の自動変動

## 設計ドキュメント

実装にあたっては `docs/` 配下の設計書を参照する:

| ファイル | 内容 |
|---|---|
| `docs/requirements.md` | 要件定義 (スコープ・MVP/将来拡張) |
| `docs/specification.md` | 機能設計 (F-01〜F-08 の計算式・処理仕様) |
| `docs/design.md` | UI/画面設計 (SC-01〜SC-11) |
| `docs/database.md` | データ設計 (型・関係・拡張性) |
| `docs/architecture.md` | アーキテクチャ設計 (4層構造) |
| `docs/game-balance.md` | バランス設計 (係数・効果値スケール) |
| `docs/testing.md` | テスト方針 |

## ライセンス

(未設定)
