import { Outlet } from 'react-router-dom';
import { ThemeModeToggle } from '@/components/theme-mode-toggle';
import { BRAND_COLORS } from '@/lib/brand';
import { HexagonalBackground } from '@/components/hexagonal-bg';

export function ExternalLayout() {
  return (
    <div className="relative h-full w-full overflow-hidden min-h-screen">
      <HexagonalBackground/>

      {/* Brand color gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom right, ${BRAND_COLORS.pinkFlamingo}08, ${BRAND_COLORS.malibu}05, ${BRAND_COLORS.luckyPoint}10)`,
        }}
      />

      {/* Header with theme toggle */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeModeToggle />
      </div>

      {/* Main content - no authentication gate */}
      <div className="relative z-10 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
}