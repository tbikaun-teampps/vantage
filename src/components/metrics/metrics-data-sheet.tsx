import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
// import { MetricsDataUpload } from "@/components/metrics/metrics-data";

interface MetricsDataSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programId: number;
}

export function MetricsDataSheet({
  open,
  onOpenChange,
  programId,
  programPhaseId,
}: MetricsDataSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="max-w-2xl sm:max-w-none flex flex-col"
        side="right"
      >
        <SheetHeader>
          <SheetTitle>Add Metrics Data</SheetTitle>
          <SheetDescription>
            Upload data to calculate metric values or enter manually for this
            program
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto">
          {/* <MetricsDataUpload
            programId={programId}
            programPhaseId={programPhaseId}
          /> */}
        </div>
      </SheetContent>
    </Sheet>
  );
}
