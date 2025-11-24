import { useState } from "react";
import { Card } from "@/components/ui/card";
import { getWidget } from "./index";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical, IconSettings, IconTrash } from "@tabler/icons-react";
import type { Widget } from "@/types/api/dashboard";

interface WidgetContainerProps {
  widget: Widget;
  isEditMode: boolean;
  onRemove: () => void;
  onConfigClick: () => void;
}

export function WidgetContainer({
  widget,
  isEditMode,
  onRemove,
  onConfigClick,
}: WidgetContainerProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const widgetDefinition = getWidget(widget.widgetType);
  if (!widgetDefinition) return null;

  const WidgetComponent = widgetDefinition.component;

  return (
    <Card key={widget.id} className="h-full w-full relative">
      {isEditMode && (
        <div className="absolute top-4 right-4 z-10">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon">
                <IconDotsVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onConfigClick();
                }}
              >
                <IconSettings className="h-4 w-4" />
                Configure widget
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteDialog(true);
                }}
                className="text-destructive"
              >
                <IconTrash className="h-4 w-4 text-destructive" />
                Remove widget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <WidgetComponent config={widget.config} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Widget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the "{widgetDefinition.title}" widget? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onRemove();
                setShowDeleteDialog(false);
              }}
              className="bg-destructive hover:bg-destructive/90 cursor-pointer"
            >
              Remove Widget
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
