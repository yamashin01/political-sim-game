import type { GameEvent } from '@/types';

export const SCHEDULED_EVENTS: GameEvent[] = [
  {
    id: 'E_SCH_01',
    name: 'G7サミット',
    description: '主要国首脳会議に出席。外交アピールの機会。',
    category: 'scheduled',
    scale: 'small',
    trigger: { type: 'scripted', scheduledTurnType: 'first_half' },
    choices: [
      {
        id: 'A',
        label: '対米同盟を前面に出す',
        effects: { diplomacy: 4, approval: 2 },
      },
      {
        id: 'B',
        label: '独自路線を主張',
        effects: { diplomacy: -1, approval: 3 },
      },
    ],
    educationalNote: 'G7は外交アピールの絶好の機会。発信内容によって関係が変動する。',
  },
  {
    id: 'E_SCH_02',
    name: '国連総会',
    description: '国連総会で演説。国際舞台での発信機会。',
    category: 'scheduled',
    scale: 'small',
    trigger: { type: 'scripted', scheduledTurnType: 'second_half' },
    choices: [
      {
        id: 'A',
        label: '気候変動への取り組みを強調',
        effects: { environment: 2, diplomacy: 2 },
      },
      {
        id: 'B',
        label: '安全保障の課題を訴える',
        effects: { diplomacy: 3, approval: 1 },
      },
    ],
    educationalNote: '国連総会では発信テーマが指標への影響を左右する。',
  },
];
