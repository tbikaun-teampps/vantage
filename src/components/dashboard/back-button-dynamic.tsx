import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { type BackButtonDynamicProps } from "@/types/ui/dashboard";

export function BackButtonDynamic({
  onBack,
  children,
}: BackButtonDynamicProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack(); // Calls the custom handler
    } else {
      // Default behavior
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/");
      }
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBack}
      className="flex-shrink-0 -ml-2 cursor-pointer"
    >
      <ChevronLeft className="h-4 w-4" />
      {children}
    </Button>
  );
}
