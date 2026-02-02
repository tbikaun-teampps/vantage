import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BackButtonProps {
  href: string;
  children?: React.ReactNode;
}

export function BackButton({ href, children }: BackButtonProps) {
  return (
    <Button variant="ghost" size="sm" className="flex-shrink-0 -ml-2" asChild>
      <Link to={href}>
        <ChevronLeft className="h-4 w-4" />
        {children}
      </Link>
    </Button>
  );
}
