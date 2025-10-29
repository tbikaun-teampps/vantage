import { type ColumnDef } from "@tanstack/react-table";
import {
  IconCheck,
  IconAlertCircle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import type { AssessmentMeasurement } from "../../../types/assessment-measurements";
import { cn } from "@/lib/utils";

export const MEASUREMENT_STATUS_OPTIONS = [
  {
    value: "available",
    label: "Available",
    icon: IconAlertCircle,
    iconColor: "text-blue-600",
  },
  {
    value: "unavailable",
    label: "Unavailable",
    icon: IconAlertCircle,
    iconColor: "text-orange-600",
  },
  {
    value: "in_use",
    label: "In Use",
    icon: IconCheck,
    iconColor: "text-green-600",
  },
];

function StatusIcon({ status }: { status: string }) {
  const option = MEASUREMENT_STATUS_OPTIONS.find((opt) => opt.value === status);
  if (!option) return <IconAlertCircle className="h-4 w-4 text-gray-400" />;

  return <option.icon className={`h-4 w-4 ${option.iconColor}`} />;
}

export function createMeasurementColumns(): ColumnDef<AssessmentMeasurement>[] {
  return [
    {
      id: "selected",
      header: () => <div className="w-8" />,
      cell: ({ row }) => (
        <div
          className="flex items-center justify-center w-8"
          key={row.original.id}
        >
          {row.original.isInUse && (
            <IconCircleCheck className="h-5 w-5 text-primary" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "id",
      header: "Id",
      cell: ({ row }) => <div key={row.original.id}>{row.original.id}</div>,
    },
    {
      accessorKey: "name",
      header: "Measurement",
      cell: ({ row }) => (
        <div className="capitalize flex flex-1" key={row.original.id}>
          {row.original.name.replaceAll("_", " ")}
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[300px] truncate" key={row.original.id}>
          {row.original.description}
        </div>
      ),
    },
    // {
    //   accessorKey: "assessment_categories",
    //   header: "Categories",
    //   cell: ({ row }) => (
    //     <div key={row.original.id}>
    //       {row.original.assessment_categories?.map((ac, index) => (
    //         <Badge key={index}>{ac}</Badge>
    //       )) || <Badge>Uncategorised</Badge>}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "status",
      header: () => <div>Status</div>,
      cell: ({ row }) => (
        <div key={row.original.id} className="flex gap-2">
          <Badge
            className={cn(
              "flex items-center gap-1 capitalize",
              row.original.status === "available" &&
                "bg-blue-100 text-blue-800",
              row.original.status === "unavailable" &&
                "bg-orange-100 text-orange-800"
            )}
            variant="secondary"
          >
            <StatusIcon status={row.original.status} />
            {row.original.status.replaceAll("_", " ")}
          </Badge>
          {row.original.isInUse && (
            <Badge
              className={cn(
                "flex items-center gap-1 capitalize bg-green-100 text-green-800"
              )}
              variant="secondary"
            >
              <StatusIcon status="in_use" />
              In Use
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "instanceCount",
      header: () => <div className="text-center">Instances</div>,
      cell: ({ row }) => (
        <div key={row.original.id} className="flex justify-center">
          <Badge variant="secondary">{row.original?.instanceCount ?? 0}</Badge>
        </div>
      ),
    },
  ];
}
