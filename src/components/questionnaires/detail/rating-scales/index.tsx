import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconCheck, IconPlus } from "@tabler/icons-react";
import { AlertTriangle } from "lucide-react";
import RatingsForm from "./ratings-form";
import { useQuestionnaireDetail } from "@/contexts/QuestionnaireDetailContext";
import { useCanAdmin } from "@/hooks/useUserCompanyRole";
import AddRatingDialog from "./add-rating-dialog";
import { useState } from "react";

export function RatingScales() {
  const userCanAdmin = useCanAdmin();

  const {
    getRatingsStatus,
    isProcessing,
    ratingScales,
    questionnaire,
    isLoading,
  } = useQuestionnaireDetail();

  const [showAddRatingDialog, setShowAddRatingDialog] =
    useState<boolean>(false);

  if (!questionnaire) {
    return null;
  }

  return (
    <>
      <Card
        data-tour="questionnaire-rating-scales"
        className="h-full overflow-hidden border-none shadow-none max-w-[1600px] mx-auto p-0"
      >
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                Rating Scales
                {getRatingsStatus() === "complete" ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <IconCheck className="h-3 w-3" />
                  </Badge>
                ) : (
                  <Badge variant="outline">
                    <AlertTriangle className="h-3 w-3" />
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Configure the rating scale for questionnaire responses
              </CardDescription>
            </div>
            {userCanAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddRatingDialog(true)}
                disabled={isProcessing}
                data-tour="questionnaire-rating-actions"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Add Rating
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          <RatingsForm
            ratings={ratingScales}
            questionnaireId={questionnaire.id}
            isLoading={isLoading}
            showActions={false}
          />
        </CardContent>
      </Card>

      <AddRatingDialog
        open={showAddRatingDialog}
        onOpenChange={setShowAddRatingDialog}
        questionnaireId={questionnaire.id}
        ratings={ratingScales}
      />
    </>
  );
}
