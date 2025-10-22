import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IconWorld } from "@tabler/icons-react";

interface AssessmentLocationProps {
  location?: {
    business_unit?: { id: number | null; name: string | null };
    region?: { id: number | null; name: string | null };
    site?: { id: number | null; name: string | null };
    asset_group?: { id: number | null; name: string | null };
  };
}

export function AssessmentLocation({ location }: AssessmentLocationProps) {
  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconWorld className="h-5 w-5" />
          Assessment Location
        </CardTitle>
        <CardDescription>
          Details about where the assessment is taking place or targeting.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-8 items-center">
        <div className="flex gap-4 items-center">
          <h4 className="font-medium">Business Unit</h4>
          <Badge variant="secondary" className="text-sm">
            {!location?.business_unit
              ? "Not Set"
              : location.business_unit.id
                ? location.business_unit.name
                : "All"}
          </Badge>
        </div>
        <div className="flex gap-4 items-center">
          <h4 className="font-medium">Region</h4>
          <Badge variant="secondary" className="text-sm">
            {!location?.region
              ? "Not Set"
              : location.region.id
                ? location.region.name
                : "All"}
          </Badge>
        </div>
        <div className="flex gap-4 items-center">
          <h4 className="font-medium">Site</h4>
          <Badge variant="secondary" className="text-sm">
            {!location?.site
              ? "Not Set"
              : location.site.id
                ? location.site.name
                : "All"}
          </Badge>
        </div>
        <div className="flex gap-4 items-center">
          <h4 className="font-medium">Asset Group</h4>
          <Badge variant="secondary" className="text-sm">
            {!location?.asset_group
              ? "Not Set"
              : location.asset_group.id
                ? location.asset_group.name
                : "All"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
