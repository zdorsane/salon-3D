import { useCallback, useState } from 'react';
import { Scene } from '@/components/canvas/Scene';
import { ProductDrawer } from '@/components/shop/ProductDrawer';
import { RoomSummary } from '@/components/shop/RoomSummary';
import { ShareMenu } from '@/components/shop/ShareMenu';
import { BottomBar } from '@/components/ui/BottomBar';
import { SceneLoader } from '@/components/ui/SceneLoader';
import { TopBar } from '@/components/ui/TopBar';
import { useSharedRoom } from '@/lib/useSharedRoom';

/** Page principale : le salon 3D plein écran et l'interface en verre par-dessus (aussi `/salon?c=…`). */
export function Showroom() {
  const [ready, setReady] = useState(false);
  const handleReady = useCallback(() => setReady(true), []);
  useSharedRoom();

  return (
    <div className="fixed inset-0 overflow-hidden bg-night">
      <Scene onReady={handleReady} />
      <TopBar actions={<ShareMenu />} />
      <RoomSummary />
      <BottomBar />
      <ProductDrawer />
      <SceneLoader ready={ready} />
    </div>
  );
}
