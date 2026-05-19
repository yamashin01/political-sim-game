/**
 * 政治シミュレーションゲーム データモデル定義 (MVP版)
 *
 * 要件定義書・機能設計書・データ設計書に基づくTypeScript型定義。
 * Config (不変ルール) と State (可変状態) を分離し、
 * 将来の拡張 (期間, シナリオ, 勝利条件, 選挙対象等) に対応する構造とする。
 */

// ============================================================
// Section 1: Core IDs
// 型エイリアスで意図を明示
// ============================================================

export type PolicyId = string;
export type EventId = string;
export type PartyId = string;
export type RegionId = string;
export type TrendId = string;
export type ScenarioId = string;
export type TurnNumber = number;

// ============================================================
// Section 2: 列挙型
// 文字列ユニオン型で後から要素を追加しやすくする
// ============================================================

/** 政策のカテゴリ */
export type PolicyCategory =
  | 'tax_finance'         // 税制財政
  | 'economy_industry'    // 経済産業
  | 'welfare'             // 社会保障
  | 'education_science'   // 教育科技
  | 'environment_energy'  // 環境エネルギー
  | 'diplomacy_defense'   // 外交防衛
  | 'administration';     // 行政

/** 政策の即効性 */
export type Timeliness =
  | 'immediate' // 1ターン以内
  | 'short'     // 2-3ターン
  | 'medium'    // 4-6ターン
  | 'long';     // 7ターン以上

/** イベントのカテゴリ */
export type EventCategory =
  | 'international_political'  // 国際情勢 (政治・軍事)
  | 'international_economic'   // 国際経済・エネルギー
  | 'national_disaster'        // 全国規模災害・社会
  | 'regional_disaster'        // 地方限定災害
  | 'political_scandal'        // 政治スキャンダル
  | 'economic_shock'           // 経済ショック (国内発)
  | 'positive'                 // ポジティブイベント
  | 'internal_party'           // 党内・政治構造突発
  | 'scheduled';               // 定例イベント (年中行事)

export type EventScale = 'small' | 'large';

export type TriggerType =
  | 'random'            // 完全ランダム
  | 'conditional'       // 条件付きランダム
  | 'policy_triggered'  // 政策連動
  | 'scripted'          // 時系列スクリプト (定例)
  | 'chained';          // 連鎖

/** 選挙対象 (将来拡張用) */
export type ElectionTarget =
  | 'house_of_reps'        // 衆議院 (MVP)
  | 'house_of_councilors'  // 参議院 (将来)
  | 'local';               // 地方選挙 (将来)

/** 勝利条件の種別 (将来拡張用) */
export type WinConditionType =
  | 'composite_score'     // 総合スコア型 (MVP)
  | 'long_rule'           // 長期政権の維持 (将来)
  | 'policy_achievement'  // 政策目標の達成 (将来)
  | 'indicator_max';      // 特定指標最大化 (将来)

export type Difficulty = 'easy' | 'normal' | 'hard';

/** プレイヤーのスタート位置 (将来拡張用) */
export type StartingPosition =
  | 'opposition_first'   // 野党第一党 (MVP)
  | 'opposition_second'  // 野党第二党 (将来)
  | 'new_party'          // 新興政党 (将来)
  | 'ruling_coalition'   // 与党連立 (将来)
  | 'ruling_single';     // 単独与党 (将来)

/** プレイヤー党の現在の立場 (派生プロパティ的に使用) */
export type PlayerPosition =
  | 'opposition'         // 野党
  | 'ruling_single'      // 単独与党
  | 'ruling_coalition'   // 連立与党
  | 'ruling_minority';   // 少数与党

// ============================================================
// Section 3: 基本概念 - イデオロギー
// ============================================================

/**
 * 政党/政策のイデオロギー座標。各軸は -2〜+2 の整数。
 *   - economic:   -2 (小さな政府) 〜 +2 (大きな政府)
 *   - social:     -2 (保守) 〜 +2 (リベラル)
 *   - diplomatic: -2 (同盟重視) 〜 +2 (自主路線)
 */
export interface Ideology {
  economic: number;
  social: number;
  diplomatic: number;
}

// ============================================================
// Section 4: 基本概念 - 国家の指標
// ============================================================

/** 国家の主要指標 (5指標) */
export interface NationalIndicators {
  /** 支持率 (0〜100) - 選挙結果に直結 */
  approval: number;
  /** 経済力 (0〜100) - GDP・雇用の複合 */
  economy: number;
  /** 財政健全度 (0〜100) - 高いほど健全 */
  finance: number;
  /** 外交安保 (0〜100) - 内部で diplomaticDetails を保持 */
  diplomacy: number;
  /** 環境スコア (0〜100) */
  environment: number;
}

/** 外交関係の内訳。diplomacy 指標の裏側で保持 */
export interface DiplomaticDetails {
  /** 対米関係 (0〜100) */
  us: number;
  /** 対中関係 (0〜100) */
  china: number;
  /** 対近隣関係 (0〜100) - 韓国・北朝鮮・ロシア等の総合 */
  neighbors: number;
}

/** 指標への変化量 (政策・イベントの効果記述に使用) */
export type IndicatorChanges = Partial<NationalIndicators>;

// ============================================================
// Section 5: 地方ブロック
// ============================================================

/** 地方ブロック (6ブロック) */
export interface Region {
  id: RegionId;
  name: string;
  /** 全議席に対するこの地方の議席シェア (0〜1) */
  seatShare: number;
  /** 地方の総議席数 (seatShare × GameConfig.houseTotalSeats。MVPは465議席を前提) */
  totalSeats: number;
  /** 都市化度 (0〜1, 1が完全に都市部) - 政策効果計算に使用 */
  urbanization: number;
}

// ============================================================
// Section 6: 政党
// ============================================================

/** 政党 */
export interface Party {
  id: PartyId;
  name: string;
  /** プレイヤーの党か */
  isPlayer: boolean;
  /** モデルになった実在政党 (UI表示用ぼかし表現) */
  modelDescription?: string;
  ideology: Ideology;
  /** 現在の議席数 */
  seats: number;
  /** 党資金 */
  funds: number;
  /** 地方ブロックごとの支持率 (0〜100) */
  approvalByRegion: Record<RegionId, number>;
  /** 党結束度 (0〜100) - プレイヤーの党のみで使用 */
  unity?: number;
}

// ============================================================
// Section 7: 政策
// ============================================================

/** 政策の副次効果 */
export interface PolicySideEffect {
  /** 副次効果の種別 */
  type:
    | 'event_probability'  // 特定イベントの発生確率を変更
    | 'policy_unlock'      // 別の政策の必要議席率を低下
    | 'policy_lock'        // 別の政策を一時的に封印
    | 'trigger_event';     // 特定イベントを誘発
  /** 対象のID (イベントID or 政策ID) */
  targetId: string;
  /** 変化量 */
  modifier?: number;
  /** 持続ターン数 (永続なら省略) */
  durationTurns?: number;
}

/** 特殊な議決要件 (憲法改正等) */
export interface SpecialRequirement {
  /** 必要議席率を上書き (例: 0.67 = 2/3) */
  requiredSeatsRatio?: number;
  /** 国民投票を要するか */
  requiresReferendum?: boolean;
}

/** 政策定義 */
export interface Policy {
  id: PolicyId;
  name: string;
  category: PolicyCategory;
  /** 重要度 (1〜3) - 必要議席率の計算に使用 */
  importance: 1 | 2 | 3;
  /** 政策のイデオロギー方向 (自党との乖離が議席率に影響) */
  ideologyDirection: Ideology;
  /** 効果の発現タイミング */
  timeliness: Timeliness;
  /** 国家予算への影響 (財政指標とは別の財源変動量) */
  budgetCost: number;
  /** 主要指標への影響 */
  effects: IndicatorChanges;
  /** 地方別の追加効果 */
  regionalEffects?: Partial<Record<RegionId, IndicatorChanges>>;
  /** 副次効果 */
  sideEffects?: PolicySideEffect[];
  /** 特殊条件 (憲法改正等) */
  specialRequirements?: SpecialRequirement;
  /** 教育的解説 (将来の教育サポート機能で使用, MVPでは未表示) */
  educationalNote: string;
}

// ============================================================
// Section 8: イベント
// ============================================================

/** イベント発生のトリガー定義 */
export interface EventTrigger {
  type: TriggerType;
  /** 基礎確率 (0〜1) - random/conditional の場合 */
  baseProbability?: number;
  /** 条件評価のためのキー (実装側で評価関数を参照) */
  conditionKey?: string;
  /** 政策連動の場合の連動先政策ID */
  linkedPolicyId?: PolicyId;
  /** 時系列スクリプトの場合の発生ターン or ターン種別 */
  scheduledTurn?: number;
  scheduledTurnType?: 'first_half' | 'second_half';
  /** 連鎖の場合のトリガー元イベントID */
  parentEventId?: EventId;
}

/** イベントの選択肢 */
export interface EventChoice {
  id: string;
  label: string;
  /** 選択時の指標への効果 */
  effects: IndicatorChanges;
  /** 選択時の副次効果 */
  sideEffects?: PolicySideEffect[];
  /** 教育的補足 (将来用) */
  explanation?: string;
}

/** イベント定義 */
export interface GameEvent {
  id: EventId;
  name: string;
  description: string;
  category: EventCategory;
  scale: EventScale;
  trigger: EventTrigger;
  /** 影響対象の地方 (地方災害の場合) */
  affectedRegions?: RegionId[];
  /** 選択前に確定で発生する効果 */
  immediateEffects?: IndicatorChanges;
  /** プレイヤーの選択肢 (なければ即時効果のみ) */
  choices?: EventChoice[];
  /** このイベントの後に誘発される後続イベント */
  chainedEventIds?: EventId[];
  /** 教育的解説 (将来用, MVPでは未表示) */
  educationalNote: string;
}

// ============================================================
// Section 9: トレンド (長期進行する変化)
// ============================================================

/** トレンド定義 (静的データ) */
export interface Trend {
  id: TrendId;
  name: string;
  description: string;
  /** 毎ターン進行する基準量 (進行度0〜100に対する増分) */
  baseAdvancePerTurn: number;
  /** 進行による毎ターン指標への影響 */
  perTurnEffects: IndicatorChanges;
  /** 進行を緩和する対抗政策のIDリスト */
  counterPolicyIds: PolicyId[];
  educationalNote: string;
}

/** トレンドの現在状態 */
export interface TrendState {
  trendId: TrendId;
  /** 進行度 (0〜100) */
  progress: number;
}

// ============================================================
// Section 10: 予算配分とプレイヤーアクション
// ============================================================

/** 予算配分 (主要分野への割り振り) */
export interface BudgetAllocation {
  /** 予算の種別 (本予算 or 補正予算) */
  type: 'main' | 'supplementary';
  taxFinance: number;
  economyIndustry: number;
  welfare: number;
  educationScience: number;
  environmentEnergy: number;
  diplomacyDefense: number;
}

/** プレイヤーが1ターン中に取れるアクション */
export type PlayerAction =
  | { type: 'propose_policies'; policyIds: PolicyId[] }
  | { type: 'respond_to_event'; eventId: EventId; choiceId: string }
  | { type: 'allocate_budget'; allocation: BudgetAllocation }
  | { type: 'skip_supplementary_budget' }
  | { type: 'call_election' }
  | { type: 'end_turn' };

// ============================================================
// Section 11: ゲーム設定 (不変ルール)
// ============================================================

/**
 * ゲームの不変設定。
 * シナリオ・期間・選挙対象・勝利条件などの「ルール」をここに集約する。
 *
 * 拡張時はこの Config を変えるだけで新モードを実現する。
 */
export interface GameConfig {
  scenario: ScenarioId;
  /** 総ターン数 (MVPは20) */
  totalTurns: number;
  /** 1ターンの月数 (MVPは6) */
  turnDurationMonths: number;
  /** 衆議院の総定数 (MVPは465) */
  houseTotalSeats: number;
  /** 過半数ライン (MVPは233) */
  majorityThreshold: number;
  /** 対象とする選挙の種別 */
  electionTargets: ElectionTarget[];
  /** プレイヤーのスタート位置 */
  startingPosition: StartingPosition;
  /** 勝利条件の種別 */
  winConditionType: WinConditionType;
  difficulty: Difficulty;
  /** プレイヤー数 (将来のマルチプレイ用, MVPは1) */
  playerCount: number;
}

// ============================================================
// Section 12: ゲーム状態 (可変)
// ============================================================

/** 発生したイベントのインスタンス */
export interface ActiveEvent {
  eventId: EventId;
  occurredAt: TurnNumber;
  /** プレイヤーが選んだ選択肢 (未対応ならundefined) */
  resolvedChoiceId?: string;
}

/** 選挙の結果 */
export interface ElectionResult {
  turn: TurnNumber;
  /** 各党の議席数 */
  seatsPerParty: Record<PartyId, number>;
  /** 与党 (第一党) の党ID */
  rulingPartyId?: PartyId;
  /** 連立構成 (rulingPartyId を含む)。単独過半数の場合は [rulingPartyId] となる */
  coalitionPartyIds: PartyId[];
}

/** 1ターン分の履歴 */
export interface TurnHistory {
  turn: TurnNumber;
  /** このターンに提出した政策と結果 */
  proposedPolicies: { policyId: PolicyId; passed: boolean }[];
  /** このターンに発生したイベントと対応 */
  events: { eventId: EventId; choiceId?: string }[];
  /** ターン終了時の指標 */
  indicatorsAtEnd: NationalIndicators;
  /** ターン終了時の議席分布 */
  seatsAtEnd: Record<PartyId, number>;
}

/** 累積履歴 */
export interface GameHistory {
  turns: TurnHistory[];
  elections: ElectionResult[];
}

/**
 * ゲームの全状態。
 * config + state でゲームを完全に表現する。
 */
export interface GameState {
  config: GameConfig;
  /** 現在のターン数 (1始まり) */
  currentTurn: TurnNumber;
  /** 現在の年 (turn と turnDurationMonths から導出可能) */
  currentYear: number;
  /** 最後に選挙が行われたターン (発動確率の計算に使用) */
  lastElectionTurn: TurnNumber;
  /** 在任ターン数 (与党だったターンの累計, スコア計算に使用) */
  inOfficeTurns: number;

  /** 全政党の状態 (プレイヤーの党を含む) */
  parties: Party[];
  /** プレイヤーの党のID */
  playerPartyId: PartyId;
  /** 与党 (第一党) の党ID。未定 (野党時) は undefined */
  rulingPartyId?: PartyId;
  /** 連立構成 (rulingPartyId を含む与党および連立相手党のID)。単独与党時は [rulingPartyId] となる */
  coalitionPartyIds: PartyId[];
  /** 連立健全度 (0〜100, 与党時のみ) */
  coalitionHealth?: number;

  /** 地方ブロックの状態 */
  regions: Region[];

  /** 国家の主要指標 */
  indicators: NationalIndicators;
  /** 外交関係の内訳 */
  diplomaticDetails: DiplomaticDetails;

  /** 長期トレンドの進行度 */
  trends: TrendState[];

  /** 実行済み・進行中の政策履歴 */
  policyHistory: { policyId: PolicyId; turn: TurnNumber; passed: boolean }[];
  /** 発生したイベント */
  events: ActiveEvent[];
  /** 次ターン以降に予約されている連鎖イベント */
  pendingChainedEvents: EventId[];

  /** ゲーム履歴 */
  history: GameHistory;

  /** ゲーム終了フラグ */
  isEnded: boolean;
  /** 終了理由 (失脚エンド等) */
  endReason?: 'normal' | 'scandal_resignation' | 'coalition_collapse' | 'party_split';
}

// ============================================================
// Section 13: 計算関数の型シグネチャ
// 実装は別ファイルで提供
// ============================================================

/** 政策通過判定の結果 */
export interface PolicyPassageResult {
  passed: boolean;
  /** 必要だった議席率 */
  requiredSeatsRatio: number;
  /** 実際に確保できた支持議席率 */
  actualSupportRatio: number;
  /** イデオロギー乖離値 */
  ideologyDeviation: number;
}

/** 政策通過判定関数 */
export type EvaluatePolicyPassage = (
  policy: Policy,
  state: GameState
) => PolicyPassageResult;

/** 選挙計算関数 */
export type CalculateElection = (state: GameState) => ElectionResult;

/** 最終スコア */
export interface FinalScore {
  /** 指標ごとのスコア (0〜100) */
  indicatorScores: NationalIndicators;
  /** 党理念達成度 (0〜100) */
  ideologyAchievement: number;
  /** 在任ターン数 */
  inOfficeTurns: number;
  /** 総合スコア */
  totalScore: number;
  /** 称号 (例: "歴史的名宰相") */
  rank: string;
  /** エンディング種別 */
  endingType: string;
}

/** スコア計算関数 */
export type CalculateFinalScore = (state: GameState) => FinalScore;

// ============================================================
// Section 14: 勝利条件 (差し替え可能なロジック)
// ============================================================

/**
 * 勝利条件のインターフェース。
 * MVPでは composite_score の1実装のみだが、
 * このインターフェースを実装することで他の勝利条件を追加可能。
 */
export interface WinCondition {
  type: WinConditionType;
  /** ゲーム終了時のスコアを算出する */
  evaluate: (state: GameState) => FinalScore;
}

// ============================================================
// Section 15: シナリオ (将来拡張用)
// ============================================================

/**
 * シナリオは「初期状態 + Config の組み合わせ」で表現される。
 * MVPでは標準シナリオ1つのみ実装。
 */
export interface Scenario {
  id: ScenarioId;
  name: string;
  description: string;
  /** このシナリオの初期 GameState を生成する関数 */
  createInitialState: (config: GameConfig) => GameState;
}

// ============================================================
// Section 16: 静的データのレジストリ
// ============================================================

/**
 * ゲーム内の全静的データのレジストリ。
 * 実装時はカテゴリごとにファイルを分けて配置し、
 * このレジストリで集約する形が運用しやすい。
 */
export interface GameDataRegistry {
  policies: Record<PolicyId, Policy>;
  events: Record<EventId, GameEvent>;
  trends: Record<TrendId, Trend>;
  parties: Record<PartyId, Party>;
  regions: Record<RegionId, Region>;
  scenarios: Record<ScenarioId, Scenario>;
  winConditions: Record<WinConditionType, WinCondition>;
}
