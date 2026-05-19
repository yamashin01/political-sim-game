import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useGameStore } from '@/stores/gameStore';
import { useUiStore } from '@/stores/uiStore';

export function TitleScreen() {
  const setScreen = useUiStore((s) => s.setScreen);
  const resetGame = useGameStore((s) => s.resetGame);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="py-10 flex flex-col items-center gap-6">
          <div className="text-center">
            <CardTitle className="text-2xl mb-2">政治シミュレーションゲーム</CardTitle>
            <CardDescription>(仮称)</CardDescription>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Button
              size="lg"
              onClick={() => {
                resetGame();
                setScreen('party_setup');
              }}
            >
              新規ゲーム
            </Button>
            <Button variant="outline" size="lg" onClick={() => setScreen('help')}>
              ヘルプ
            </Button>
          </div>
          <span className="text-xs text-muted-foreground">version 0.1.0</span>
        </CardContent>
      </Card>
    </div>
  );
}
