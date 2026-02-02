import React from "react";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface LabelWithInfoProps {
  label: string;
  tooltip: string;
  isFullscreen?: boolean;
  container?: HTMLElement | null;
}

export const LabelWithInfo: React.FC<LabelWithInfoProps> = ({ 
  label, 
  tooltip, 
  isFullscreen = false, 
  container 
}) => (
  <div className="flex items-center gap-1">
    <Label className="text-xs font-medium">{label}</Label>
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className="h-3 w-3 text-muted-foreground hover:text-foreground cursor-help" />
        </TooltipTrigger>
        <TooltipContent 
          side="right" 
          className={`max-w-xs ${isFullscreen ? 'z-[99999]' : ''}`}
          container={isFullscreen ? container || undefined : undefined}
        >
          <p className="text-xs">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  </div>
);