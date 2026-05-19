import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUiStore } from '@/stores/uiStore';

export function HelpScreen() {
  const goBack = useUiStore((s) => s.goBack);
  return (
    <div className="min-h-screen container max-w-3xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>ヘルプ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <section>
            <h3 className="font-semibold mb-1">基本ルール</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>10年 (20ターン) で日本の政治を運営します</li>
              <li>1ターン = 6ヶ月。前半は通常国会、後半は臨時国会期間</li>
              <li>野党第一党からスタートし、政権獲得を目指します</li>
              <li>5指標 (支持率・経済・財政・外交安保・環境)、党理念達成度、在任期間で最終評価</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-1">5指標</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>支持率: 選挙結果に直結</li>
              <li>経済: GDP・雇用の複合</li>
              <li>財政: 国債残高/GDP比 (高いほど健全)</li>
              <li>外交安保: 国際関係と防衛</li>
              <li>環境: CO2・自然保護・再エネ比率の複合</li>
            </ul>
          </section>
          <section>
            <h3 className="font-semibold mb-1">操作</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>各ターンで「イベント → 政策 → 予算 → 指標更新」の順にフェーズが進みます</li>
              <li>政策は1ターンに最大3本まで提出可能</li>
              <li>議席率がイデオロギー乖離込みの必要議席率を超えれば通過</li>
            </ul>
          </section>
          <Button onClick={() => goBack()}>前の画面へ戻る</Button>
        </CardContent>
      </Card>
    </div>
  );
}
