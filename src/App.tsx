import { useUiStore } from './stores/uiStore';
import { TitleScreen } from './components/screens/TitleScreen';
import { PartySetupScreen } from './components/screens/PartySetupScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { EventScreen } from './components/screens/EventScreen';
import { PolicyScreen } from './components/screens/PolicyScreen';
import { BudgetScreen } from './components/screens/BudgetScreen';
import { ElectionResultScreen } from './components/screens/ElectionResultScreen';
import { CoalitionScreen } from './components/screens/CoalitionScreen';
import { EndingScreen } from './components/screens/EndingScreen';
import { HelpScreen } from './components/screens/HelpScreen';
import { PartyInfoScreen } from './components/screens/PartyInfoScreen';

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
