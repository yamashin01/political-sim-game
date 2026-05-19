import type { GameConfig, GameState, Scenario, TrendState } from '@/types';
import { NPC_PARTIES, PLAYER_PARTY_ID, createPlayerParty } from '../parties';
import { REGIONS } from '../regions';
import { TRENDS } from '../trends';

/**
 * 標準シナリオ (現代日本ベース) の初期状態を生成する。
 * プレイヤー党のイデオロギーと党名はあとから上書きされる前提。
 */
export const standardScenario: Scenario = {
  id: 'standard',
  name: '標準シナリオ',
  description: '2026年の現代日本を舞台に、野党第一党として10年間の政治運営に挑む。',
  createInitialState: (config: GameConfig): GameState => {
    const playerParty = createPlayerParty('プレイヤー党', {
      economic: 0,
      social: 0,
      diplomatic: 0,
    });

    const initialTrends: TrendState[] = TRENDS.map((t) => ({
      trendId: t.id,
      progress: 0,
    }));

    return {
      config,
      currentTurn: 1,
      currentYear: 2026,
      lastElectionTurn: 0,
      inOfficeTurns: 0,
      parties: [playerParty, ...NPC_PARTIES],
      playerPartyId: PLAYER_PARTY_ID,
      // 初期与党は民自党 (野党第一党スタート想定)
      rulingPartyId: 'minji',
      coalitionPartyIds: ['minji', 'komei'],
      coalitionHealth: 75,
      regions: REGIONS,
      // ゲームバランス §7.3: 中庸の値。財政だけやや低め。
      indicators: {
        approval: 45,
        economy: 50,
        finance: 35,
        diplomacy: 55,
        environment: 48,
      },
      diplomaticDetails: {
        us: 65,
        china: 40,
        neighbors: 45,
      },
      trends: initialTrends,
      policyHistory: [],
      events: [],
      pendingChainedEvents: [],
      history: { turns: [], elections: [] },
      isEnded: false,
    };
  },
};
