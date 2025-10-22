// components/demo-banner.tsx
import { useEffect, useState, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useIsMobile } from "@/hooks/use-mobile";
import { SubscriptionModal } from "./account/subscription-modal";

export const DemoBanner = () => {
  const { data: profile } = useProfile();
  const isMobile = useIsMobile();
  const isDemoMode = profile?.subscription_tier === "demo";
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const bannerRef = useRef<HTMLDivElement>(null);


  // Check if demo mode is locked via environment variable
  const isDemoModeLocked = import.meta.env.VITE_DEMO_MODE_LOCKED === "true";

  // Set CSS custom property for automatic layout adjustment
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--demo-banner-height",
      isDemoMode ? "2rem" : "0px"
    );
  }, [isDemoMode]);

  const handleUpgradeClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!bannerRef.current) return;

    const bannerRect = bannerRef.current.getBoundingClientRect();
    const x = e.clientX - bannerRect.left;
    const y = e.clientY - bannerRect.top;

    // Calculate the size needed to reach all edges of the banner
    const maxDistanceX = Math.max(x, bannerRect.width - x);
    const maxDistanceY = Math.max(y, bannerRect.height - y);
    const size = Math.sqrt(maxDistanceX * maxDistanceX + maxDistanceY * maxDistanceY) * 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 800);

    // Open modal with slight delay for visual effect
    setTimeout(() => {
      setSubscriptionModalOpen(true);
    }, 200);
  };

  if (!isDemoMode) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      className={`fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-[#eb59ff]/90 via-[#8b5cf6]/90 to-[#032a83]/90 overflow-hidden ${
        isMobile ? "px-2 py-1.5" : "px-4 py-2"
      }`}
    >
      {/* Left pulse effect */}
      <div className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-white/20 to-transparent animate-pulse pointer-events-none"></div>
      {/* Right pulse effect */}
      <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-white/20 to-transparent animate-pulse pointer-events-none"></div>
      <div
        className={`flex items-center justify-center gap-4 max-w-6xl mx-auto relative`}
      >
        <span
          className={`${
            isMobile ? "text-xs" : "text-sm"
          } text-white font-medium text-center`}
        >
          {isMobile ? (
            <strong>Demo Mode</strong>
          ) : (
            <>You&apos;re exploring Vantage in <strong>demo mode</strong></>
          )}
        </span>
        {!isDemoModeLocked && (
          <button
            onClick={handleUpgradeClick}
            className={`${
              isMobile ? "text-xs" : "text-sm"
            } font-medium transition-colors duration-300 text-white hover:text-white/80 underline hover:no-underline text-center bg-transparent border-none cursor-pointer`}
          >
            {isMobile
              ? "Upgrade subscription"
              : "Upgrade your subscription to use your own data!"}
          </button>
        )}
      </div>

      {/* Banner-wide ripple effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{
            left: ripple.x - ripple.size / 2,
            top: ripple.y - ripple.size / 2,
            width: ripple.size,
            height: ripple.size,
            animation: 'ripple-expand 800ms ease-out',
          }}
        />
      ))}

      <SubscriptionModal
        open={subscriptionModalOpen}
        onOpenChange={setSubscriptionModalOpen}
      />
    </div>
  );
};
