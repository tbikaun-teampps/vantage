import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store";
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

interface DemoModeDialogsProps {
  showDisableDialog: boolean;
  setShowDisableDialog: (show: boolean) => void;
  showEnableDialog: boolean;
  setShowEnableDialog: (show: boolean) => void;
  isUpdating: boolean;
  setIsUpdating: (updating: boolean) => void;
}

export function DemoModeDialogs({
  showDisableDialog,
  setShowDisableDialog,
  showEnableDialog,
  setShowEnableDialog,
  isUpdating,
  setIsUpdating,
}: DemoModeDialogsProps) {
  const { updateDemoMode } = useAuthStore();

  const triggerCelebrationConfetti = async () => {
    try {
      // Initialize tsparticles
      await loadSlim(tsParticles);

      // Simple confetti configuration that should work reliably
      const confettiConfig = {
        fullScreen: {
          enable: true,
          zIndex: 9999,
        },
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        particles: {
          number: {
            value: 100,
          },
          shape: {
            type: "image",
            options: {
              image: {
                src: "/assets/logos/vantage-logo.svg",
                width: 32,
                height: 32,
              },
            },
          },
          opacity: {
            value: { min: 0.6, max: 1.0 },
          },
          size: {
            value: { min: 8, max: 16 },
          },
          move: {
            enable: true,
            speed: { min: 2, max: 8 },
            direction: "bottom" as const,
            outModes: {
              default: "destroy" as const,
            },
            gravity: {
              enable: true,
              acceleration: 9.81,
            },
          },
          rotate: {
            value: { min: 0, max: 360 },
            direction: "random" as const,
            animation: {
              enable: true,
              speed: 5,
            },
          },
        },
        emitters: [
          {
            position: {
              x: 10,
              y: 0,
            },
            rate: {
              delay: 0.2,
              quantity: 30,
            },
            life: {
              duration: 1,
            },
          },
          {
            position: {
              x: 50,
              y: 0,
            },
            rate: {
              delay: 0.4,
              quantity: 50,
            },
            life: {
              duration: 1,
            },
          },
          {
            position: {
              x: 90,
              y: 0,
            },
            rate: {
              delay: 0.2,
              quantity: 30,
            },
            life: {
              duration: 1,
            },
          },
        ],
        detectRetina: true,
      };

      // Load and start the confetti
      const container = await tsParticles.load({
        id: "celebration-confetti",
        options: confettiConfig,
      });

      // Clean up after 5 seconds
      setTimeout(() => {
        if (container) {
          container.destroy();
        }
      }, 5000);

    } catch (error) {
      console.warn('tsParticles confetti failed, falling back to simpler animation', error);
      // Fallback to a simple CSS animation if tsParticles fails
      createSimpleFallbackConfetti();
    }
  };

  const createSimpleFallbackConfetti = () => {
    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
    
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        top: -10px;
        left: ${Math.random() * 100}vw;
        z-index: 9999;
        pointer-events: none;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        animation: fallDown 3s linear forwards;
      `;
      
      document.body.appendChild(particle);
      
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 3000);
    }
  };

  const handleDisableDemoMode = async () => {
    setIsUpdating(true);
    try {
      const result = await updateDemoMode(false);
      if (result.error) {
        throw new Error(result.error);
      }

      // Close dialog first
      setShowDisableDialog(false);
      
      // Trigger celebration confetti
      // setTimeout(() => {
      //   triggerCelebrationConfetti();
      // }, 300);
      
      // Show celebration message
      toast.success("🎉 Congratulations! You're now ready to use your own data!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to disable demo mode: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEnableDemoMode = async () => {
    setIsUpdating(true);
    try {
      const result = await updateDemoMode(true);
      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Demo mode enabled successfully");
      setShowEnableDialog(false);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to enable demo mode: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Demo Mode Disable Confirmation Dialog */}
      <AlertDialog
        open={showDisableDialog}
        onOpenChange={setShowDisableDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disable Demo Mode?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Are you sure you want to disable demo mode? This will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Remove all demo data from your account</li>
                  <li>Allow you to set up your own company structure</li>
                  <li>Enable full platform functionality with your data</li>
                </ul>
                <p className="font-medium">
                  You can always re-enable demo mode later if needed.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Keep Demo Mode
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisableDemoMode}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Disabling..." : "Use My Data"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Demo Mode Enable Confirmation Dialog */}
      <AlertDialog
        open={showEnableDialog}
        onOpenChange={setShowEnableDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable Demo Mode?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3">
                <p>Are you sure you want to enable demo mode? This will:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Load sample data to explore Vantage features</li>
                  <li>Hide your actual company data temporarily</li>
                  <li>Allow you to test functionality safely</li>
                </ul>
                <p className="font-medium">
                  Your actual data will remain safe and can be accessed anytime by disabling demo mode.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEnableDemoMode}
              disabled={isUpdating}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Enabling..." : "Enable Demo Mode"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}