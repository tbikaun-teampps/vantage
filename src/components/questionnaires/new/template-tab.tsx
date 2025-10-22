import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconPlus, IconTemplate } from "@tabler/icons-react";

interface NewQuestionnaireTemplateTabProps {
  setShowTemplateDialog: (value: boolean) => void;
}

export function NewQuestionnaireTemplateTab({
  setShowTemplateDialog,
}: NewQuestionnaireTemplateTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconTemplate className="h-5 w-5" />
          Choose a Template
        </CardTitle>
        <CardDescription>
          Start with a pre-built questionnaire template or select sections from
          our library
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-12">
          <IconTemplate className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Quick Start with Templates
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Choose from industry-standard questionnaires or build from modular
            sections
          </p>
          <Button onClick={() => setShowTemplateDialog(true)} size="lg">
            <IconPlus className="h-4 w-4 mr-2" />
            Browse Templates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
