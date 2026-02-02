import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InterviewCommentsContent } from "@/components/interview/detail/InterviewComments";
import { InterviewEvidenceContent } from "@/components/interview/detail/InterviewEvidence";
import { IconPlus } from "@tabler/icons-react";

interface MobileActionBarProps {
  responseId?: number;
  disabled?: boolean;
}

export function MobileActionBar({
  responseId,
  disabled = false,
}: MobileActionBarProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          aria-label="Open menu"
          size="icon"
          data-tour="interview-drawer-mobile"
        >
          <IconPlus />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4 min-h-[60vh] max-h-[80vh] overflow-y-auto">
          <Tabs defaultValue="comments" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="comments" className="flex-1">
                Comments
              </TabsTrigger>
              <TabsTrigger value="evidence" className="flex-1">
                Evidence
              </TabsTrigger>
            </TabsList>
            <TabsContent value="comments" className="mt-4">
              {responseId ? (
                <InterviewCommentsContent
                  responseId={responseId}
                  disabled={disabled}
                  onClose={() => setIsOpen(false)}
                  showLabel={false}
                />
              ) : (
                <p className="text-muted-foreground text-center p-4">
                  Please select a question response to add comments
                </p>
              )}
            </TabsContent>
            <TabsContent value="evidence" className="mt-4">
              <InterviewEvidenceContent
                responseId={responseId}
                disabled={disabled}
                onClose={() => setIsOpen(false)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
