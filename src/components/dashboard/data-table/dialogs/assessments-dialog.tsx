import { IconBuilding, IconExternalLink } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DialogProps } from "../types";

export function AssessmentsDialog({ open, onOpenChange, selectedQuestion }: DialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconBuilding className="h-5 w-5" />
            Assessments for &quot;{selectedQuestion?.question_title}&quot;
          </DialogTitle>
          <DialogDescription>
            {selectedQuestion?.location} •{" "}
            {selectedQuestion?.assessments.length} assessments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {selectedQuestion?.assessments &&
          selectedQuestion.assessments.length > 0 ? (
            selectedQuestion.assessments.map((assessment, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{assessment}</h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="capitalize">
                        {selectedQuestion.assessment_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <IconExternalLink className="h-3 w-3" />
                    <span>View Details</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  <p>
                    <strong>Question:</strong>{" "}
                    {selectedQuestion.question_title}
                  </p>
                  <p>
                    <strong>Domain:</strong> {selectedQuestion.domain}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <IconBuilding className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No assessments found for this question at this location.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}