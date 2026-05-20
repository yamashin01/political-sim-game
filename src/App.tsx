import { BudgetScreen } from './components/screens/BudgetScreen';
import { CoalitionScreen } from './components/screens/CoalitionScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { ElectionResultScreen } from './components/screens/ElectionResultScreen';
import { EndingScreen } from './components/screens/EndingScreen';
import { EventScreen } from './components/screens/EventScreen';
import { HelpScreen } from './components/screens/HelpScreen';
import { PartyInfoScreen } from './components/screens/PartyInfoScreen';
import { PartySetupScreen } from './components/screens/PartySetupScreen';
import { PolicyScreen } from './components/screens/PolicyScreen';
import { TitleScreen } from './components/screens/TitleScreen';
import { TurnSummaryScreen } from './components/screens/TurnSummaryScreen';
import { useUiStore } from './stores/uiStore';

export function App() {
  const currentScreen = useUiStore((s) => s.currentScreen);

  switch (currentScreen) {
    case 'title':
      return <TitleScreen />;
    case 'party_setup':
      return <PartySetupScreen />;
    case 'dashboard':
      return <DashboardScreen />;
    case 'event':
      return <EventScreen />;
    case 'policy':
      return <PolicyScreen />;
    case 'budget':
      return <BudgetScreen />;
    case 'turn_summary':
      return <TurnSummaryScreen />;
    case 'election_result':
      return <ElectionResultScreen />;
    case 'coalition':
      return <CoalitionScreen />;
    case 'ending':
      return <EndingScreen />;
    case 'help':
      return <HelpScreen />;
    case 'party_info':
      return <PartyInfoScreen />;
    default:
      return <TitleScreen />;
  }
}
