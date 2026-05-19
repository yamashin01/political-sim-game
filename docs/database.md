# データ設計書 — 政治シミュレーションゲーム

本ゲームのデータモデルを定義する。具体的なTypeScript型定義は `types.ts` に記述し、本書ではその構造の意図・関係性・設計判断を解説する。

---

## 目次

1. 設計方針
2. データの層構造
3. 主要エンティティの概要
4. 静的データと動的データ
5. エンティティ間の関係
6. ID体系と参照整合性
7. 計算関数の型シグネチャ
8. 拡張性のための設計
9. 付録: 型定義ファイル (types.ts) の構成

---

## 1. 設計方針

### 1.1 Config と State の分離

ゲームの「不変ルール」(GameConfig) と「可変状態」(GameState) を完全に分離する。これにより以下を実現する。

- ゲーム期間や勝利条件などのルール変更は GameConfig の差し替えだけで実現
- 将来のセーブ・ロード機能では GameState のシリアライズで完結
- テスト時の状態構築が容易

### 1.2 静的データの宣言性

政策, イベント, トレンド, 政党, 地方ブロックは「定義」として宣言的に持つ。これらはランタイム状態ではなく、TypeScriptオブジェクトまたはJSONファイルとして外部化し、追加・差し替えが容易な構造とする。

### 1.3 計算ロジックの抽象化

選挙計算, 政策通過判定, スコア計算などは関数の型シグネチャだけを `types.ts` で定義する。実装は別ファイルで提供し、後から差し替え可能とする。

### 1.4 拡張性のための余白

MVPでは使用しないフィールド (例: `educationalNote`) も型レベルで予約しておき、将来の機能追加時にデータ構造の互換性を保つ。

---

## 2. データの層構造

データモデルは4つの層に分けて整理する。

```
┌─────────────────────────────────────────┐
│ Layer 1: GameConfig                     │
│   不変ルール (期間・対象等)             │
├─────────────────────────────────────────┤
│ Layer 2: GameState                      │
│   可変状態 (毎ターン変動)               │
├─────────────────────────────────────────┤
│ Layer 3: ドメイン型 (静的データ定義)    │
│   Policy / GameEvent / Trend /          │
│   Party / Region / Scenario             │
├─────────────────────────────────────────┤
│ Layer 4: 計算関数の型シグネチャ         │
│   EvaluatePolicyPassage /               │
│   CalculateElection /                   │
│   CalculateFinalScore / WinCondition    │
└─────────────────────────────────────────┘
```

ゲームの全状態は `GameState` に集約され、`GameState.config` で不変ルールを参照する形になる。これにより、状態を1つのオブジェクトとして扱える。

---

## 3. 主要エンティティの概要

### 3.1 ゲーム設定 (GameConfig)

ゲーム開始時に決まって動かない設定を保持する。

| フィールド | 役割 |
|---|---|
| scenario | 使用するシナリオの識別子 |
| totalTurns | 総ターン数 (MVP: 20) |
| turnDurationMonths | 1ターンの月数 (MVP: 6) |
| houseTotalSeats | 衆議院の総定数 (MVP: 465) |
| majorityThreshold | 過半数ライン (MVP: 233) |
| electionTargets | 選挙対象の種別 (MVP: 衆議院のみ) |
| startingPosition | プレイヤーのスタート位置 |
| winConditionType | 勝利条件の種別 (MVP: 総合スコア型) |
| difficulty | 難易度 |
| playerCount | プレイヤー数 (MVP: 1) |

**設計意図**: ハードコードを避けてConfigに集約することで、将来「3年プレイ版」「20年プレイ版」「マルチプレイ版」などを Config の差し替えで実現できる。

### 3.2 ゲーム状態 (GameState)

毎ターン変動する全ての可変データを保持する。

| 主要フィールド | 役割 |
|---|---|
| config | GameConfig への参照 |
| currentTurn, currentYear | 現在のターン・年 |
| lastElectionTurn | 前回選挙のターン (発動確率計算用) |
| inOfficeTurns | 在任ターン累計 (スコア計算用) |
| parties | 全政党の状態 |
| playerPartyId | プレイヤーの党ID |
| rulingPartyId, coalitionPartyIds | 与党・連立構成 |
| coalitionHealth | 連立健全度 (与党時のみ) |
| regions | 地方ブロックの状態 |
| indicators | 国家の5指標 |
| diplomaticDetails | 外交関係の内訳 |
| trends | 各トレンドの進行度 |
| policyHistory | 実行済み政策の履歴 |
| events | 発生したイベントの履歴 |
| pendingChainedEvents | 次ターン以降に発生する連鎖イベント |
| history | ターン履歴・選挙履歴 |
| isEnded, endReason | ゲーム終了状態 |

**設計意図**: GameStateを1つのオブジェクトに集約することで、将来のセーブ・ロード機能では `JSON.stringify(state)` で永続化できる。

### 3.3 政党 (Party)

プレイヤー党とNPC党を区別なく同じ型で扱う。

| フィールド | 役割 |
|---|---|
| id, name | 識別子と表示名 |
| isPlayer | プレイヤーの党かどうかのフラグ |
| modelDescription | モデルとなった実在政党 (UI表示用) |
| ideology | イデオロギー座標 (3軸) |
| seats | 現在の議席数 |
| funds | 党資金 |
| approvalByRegion | 地方ブロックごとの支持率 (選挙計算で使用) |
| unity | 党結束度 (オプショナル。MVPではプレイヤー党のみが保持し、NPC党は undefined) |

**設計意図**: プレイヤー党とNPC党を同じ構造で扱うことで、将来のマルチプレイ対応 (複数プレイヤーが各党を操作) への移行が容易になる。MVP では党分裂エンド・派閥対立イベントの対象がプレイヤー党のみのため、NPC党は `unity` を持たない。マルチプレイ時には全プレイヤー党に拡張する。

### 3.4 地方ブロック (Region)

6つの地方ブロックを定義する静的データ。

| フィールド | 役割 |
|---|---|
| id, name | 識別子と表示名 |
| seatShare | 全議席に対するシェア (合計1.0) |
| totalSeats | 地方の総議席数 (seatShare × 465) |
| urbanization | 都市化度 (0〜1, 政策効果計算用) |

**設計意図**: 地方ごとの支持率はRegionに持たせず、Party側の `approvalByRegion` で管理する。これにより「党 × 地方」の二次元データを自然に表現できる。

### 3.5 国家の指標 (NationalIndicators)

5つの主要指標を1つのオブジェクトにまとめる。

| フィールド | 役割 |
|---|---|
| approval | 支持率 (0〜100) |
| economy | 経済 (0〜100) |
| finance | 財政健全度 (0〜100) |
| diplomacy | 外交安保 (0〜100) |
| environment | 環境スコア (0〜100) |

外交安保の内訳 (対米/対中/対近隣) は `DiplomaticDetails` で別途保持する。

**設計意図**: 指標を集約することで、`IndicatorChanges` (`Partial<NationalIndicators>`) という派生型を作りやすく、政策やイベントの効果記述が簡潔になる。

### 3.6 政策 (Policy)

48本の政策はすべて同じ構造で定義される。

| フィールド | 役割 |
|---|---|
| id, name, category | 識別子・表示名・カテゴリ |
| importance | 重要度 1〜3 (必要議席率に影響) |
| ideologyDirection | 政策のイデオロギー方向 (3軸) |
| timeliness | 効果の発現タイミング |
| budgetCost | 国家予算への影響 |
| effects | 主要指標への影響 |
| regionalEffects | 地方別の追加効果 (任意) |
| sideEffects | 副次効果 (イベント確率変更等) |
| specialRequirements | 特殊条件 (憲法改正など) |
| educationalNote | 教育的解説 (将来用, MVPでは未表示) |

**設計意図**: 全政策が単一の構造で表現できるため、カテゴリ別にファイルを分けて宣言的に管理しやすい (例: `policies/tax-finance.ts`)。

### 3.7 イベント (GameEvent)

50本のイベントも同じ構造で定義される。

| フィールド | 役割 |
|---|---|
| id, name, description | 識別子・名称・説明文 |
| category, scale | カテゴリ・規模 |
| trigger | 発生トリガー (種別・条件・確率等) |
| affectedRegions | 影響対象の地方 (地方災害の場合) |
| immediateEffects | 選択前の即時効果 |
| choices | プレイヤーの選択肢 (任意) |
| chainedEventIds | 連鎖イベントのID |
| educationalNote | 教育的解説 (将来用) |

**設計意図**: トリガーをデータとして宣言できる構造にすることで、「どの政策が連動するか」「どのターンに必ず発生するか」などの条件をコードではなくデータで管理できる。

### 3.8 トレンド (Trend, TrendState)

5本の長期進行トレンドの定義と現在状態を分離する。

**Trend (静的定義)**:

| フィールド | 役割 |
|---|---|
| id, name, description | 識別子・名称・説明 |
| baseAdvancePerTurn | 毎ターンの基準進行量 |
| perTurnEffects | 進行による毎ターン指標への影響 |
| counterPolicyIds | 進行を緩和する対抗政策のID |

**TrendState (動的状態)**:

| フィールド | 役割 |
|---|---|
| trendId | トレンドID |
| progress | 現在の進行度 (0〜100) |

**設計意図**: 「定義」と「状態」を分けることで、状態のみをセーブ対象とし、定義は静的データとして読み込み専用にできる。

---

## 4. 静的データと動的データ

### 4.1 静的データ (ゲーム開始時に読み込み, 変動しない)

| データ | 件数 | 配置場所 |
|---|---|---|
| 政策定義 (Policy) | 48 | `policies/*.ts` または `policies.json` |
| イベント定義 (GameEvent) | 50 | `events/*.ts` または `events.json` |
| トレンド定義 (Trend) | 5 | `trends.ts` |
| 政党の基礎情報 | 6 | `parties.ts` (シナリオ内で初期化) |
| 地方ブロック定義 (Region) | 6 | `regions.ts` |
| シナリオ定義 (Scenario) | 1 (MVP) | `scenarios/*.ts` |
| 計算係数 | — | `balance.ts` (ゲームバランス設計書から取得) |

これらは `GameDataRegistry` で集約参照する。

### 4.2 動的データ (毎ターン変動)

GameState 内の以下が変動する。

- `currentTurn`, `currentYear`, `inOfficeTurns`
- `parties` の各党の `seats`, `funds`, `approvalByRegion`, `unity`
- `indicators` の5値, `diplomaticDetails`
- `trends[]` の各進行度
- `coalitionHealth`
- `policyHistory`, `events`, `history`

---

## 5. エンティティ間の関係

### 5.1 包含関係

```
GameState
  ├─ config (GameConfig)
  ├─ parties (Party[])
  │    └─ ideology, seats, funds, approvalByRegion (Region IDで参照)
  ├─ regions (Region[])
  ├─ indicators (NationalIndicators)
  ├─ diplomaticDetails (DiplomaticDetails)
  ├─ trends (TrendState[])
  ├─ policyHistory (政策IDの履歴)
  ├─ events (発生イベントの履歴)
  ├─ pendingChainedEvents (次ターン発生予定)
  └─ history (GameHistory)
       ├─ turns (TurnHistory[])
       └─ elections (ElectionResult[])
```

### 5.2 静的データレジストリと GameState の関係

```
GameDataRegistry (静的, 読み込み専用)
  ├─ policies   ───┐
  ├─ events     ───┼─ ID参照で GameState から参照される
  ├─ trends     ───┤
  ├─ scenarios  ───┘
  └─ winConditions
            ↓
        参照のみ
            ↓
        GameState (動的)
```

GameState は静的データを **複製せず ID で参照** する。これにより、メモリ効率がよく、データ更新時の整合性も保たれる。

### 5.3 主要なアクセスパターン

| 操作 | データの流れ |
|---|---|
| 政策の通過判定 | GameDataRegistry.policies[id] → 必要議席率計算 → GameState.parties で議席数を取得 |
| イベント発生 | GameState の状態を見て GameDataRegistry.events から発生候補を抽出 |
| 選挙計算 | GameState.parties[].approvalByRegion + indicators.economy → 議席算出 |
| 最終スコア | GameState.indicators + policyHistory + inOfficeTurns → FinalScore |

---

## 6. ID体系と参照整合性

### 6.1 ID命名規則

| 対象 | プレフィックス | 例 |
|---|---|---|
| 政策 | P | `P001`, `P010`, `P048` |
| イベント | E | `E001`, `E025`, `E050` |
| 政党 | (任意) | `minji`, `komei`, `player` |
| 地方 | (任意) | `hokkaido_tohoku`, `kanto` |
| トレンド | (任意) | `aging`, `climate_change` |

### 6.2 参照整合性の保証

すべてのID参照は静的データレジストリのキーと一致する必要がある。実装時に以下の方針で整合性を保つ。

- ID参照は TypeScript の型エイリアス (`PolicyId`, `EventId` 等) で意図を明示
- レジストリ登録時に重複IDをチェック
- 政策の `sideEffects.targetId` などの相互参照は実装時に検証

---

## 7. 計算関数の型シグネチャ

計算ロジックは関数として独立させ、差し替え可能にする。型シグネチャのみ `types.ts` で定義し、実装は別ファイルで提供する。

| 関数 | 型シグネチャ概要 |
|---|---|
| 政策通過判定 | `(policy, state) → PolicyPassageResult` |
| 選挙計算 | `(state) → ElectionResult` |
| 最終スコア | `(state) → FinalScore` |

**WinCondition (勝利条件)** は、`evaluate(state) → FinalScore` を持つインターフェースとして定義し、勝利条件の種別ごとに実装する。MVPでは `composite_score` のみ実装するが、将来「長期政権型」「政策達成型」を追加できる。

```
WinCondition (interface)
  ├─ CompositeScoreWinCondition (MVP実装)
  ├─ LongRuleWinCondition (将来)
  ├─ PolicyAchievementWinCondition (将来)
  └─ IndicatorMaxWinCondition (将来)
```

---

## 8. 拡張性のための設計

### 8.1 将来機能のためのフィールド予約

| 将来機能 | データ構造上の対応 |
|---|---|
| 教育サポート機能 | `Policy.educationalNote` / `GameEvent.educationalNote` を予約済み (MVPでは未表示) |
| セーブ・ロード機能 | GameState 全体をシリアライズ可能な構造で設計済み |
| 公約達成度システム | 将来 GameState に `currentManifesto`, `manifestoScore` を追加可能 |
| 候補者の質システム | 将来 Party に `candidateQualityByRegion` を追加可能 |
| 選挙資金投入 | 将来 PlayerAction に `invest_campaign_funds` を追加可能 |
| 累積効果システム | 計算ロジックの差し替えで対応 (データ構造変更なし) |
| 多シナリオ | `GameDataRegistry.scenarios` に追加するだけ |
| 多様な勝利条件 | `GameDataRegistry.winConditions` に追加するだけ |
| マルチプレイヤー | `Party.isPlayer` を `playerId?` に拡張 |
| 多言語対応 | `name`, `description` 等を `{ ja: string, en: string }` に拡張 |

### 8.2 設計上のトレードオフ

- **シリアライズ可能性 vs 関数フィールド**: WinCondition や Scenario は関数を持つため、そのままJSONシリアライズはできない。これらは静的データレジストリに置き、シリアライズ時は型のIDで参照する。
- **正規化 vs 非正規化**: 地方支持率は `Party.approvalByRegion` に持たせる (非正規化)。これにより参照が単純になるが、すべての党が全地方の支持率を持つため重複がある。MVP規模 (6党 × 6地方 = 36エントリ) なら問題ない。
- **履歴データの肥大化**: `history.turns[]` は最大20件で固定 (MVPは20ターン)。`history.elections[]` は最大4〜5件 (10年で最大5回選挙)。サイズの上限が予測可能。

---

## 9. 付録: 型定義ファイル (types.ts) の構成

`types.ts` は以下のセクションで構成される。

| Section | 内容 |
|---|---|
| 1 | Core IDs (PolicyId, EventId など) |
| 2 | 列挙型 (PolicyCategory, EventCategory など) |
| 3 | 基本概念: イデオロギー (Ideology) |
| 4 | 基本概念: 国家の指標 (NationalIndicators, IndicatorChanges) |
| 5 | 地方ブロック (Region) |
| 6 | 政党 (Party) |
| 7 | 政策 (Policy, PolicySideEffect, SpecialRequirement) |
| 8 | イベント (GameEvent, EventTrigger, EventChoice) |
| 9 | トレンド (Trend, TrendState) |
| 10 | 予算配分とプレイヤーアクション (BudgetAllocation, PlayerAction) |
| 11 | ゲーム設定 (GameConfig) |
| 12 | ゲーム状態 (GameState, ActiveEvent, ElectionResult, GameHistory) |
| 13 | 計算関数の型シグネチャ |
| 14 | 勝利条件 (WinCondition) |
| 15 | シナリオ (Scenario) |
| 16 | 静的データのレジストリ (GameDataRegistry) |

詳細は `types.ts` を参照のこと。
