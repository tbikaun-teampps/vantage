import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconPlus } from "@tabler/icons-react";

export function Alignment() {
  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Alignment</CardTitle>
            <CardDescription>
              Align desktop measurements with questionnaires to identify
              discrepancies and gaps.
            </CardDescription>
          </div>
          <Button size="sm">
            <IconPlus className="h-4 w-4 mr-2" />
            Add Alignment
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        Alignment feature - allows users to align desktop measurements with
        questionnaires
      </CardContent>
    </Card>
  );
}
