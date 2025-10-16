// import * as React from "react";
// import { type ColumnDef } from "@tanstack/react-table";
// import { Badge } from "@/components/ui/badge";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
// } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//   IconLoader2,
//   IconCalendar,
//   IconUser,
//   IconPlus,
//   IconInfoCircle,
//   IconTrash,
// } from "@tabler/icons-react";
// import { useCalculatedMetrics, useDeleteCalculatedMetric } from "@/hooks/useMetrics";
// import { MetricsDataSheet } from "@/components/metrics/metrics-data-sheet";
// import { formatDistanceToNow } from "date-fns";
// import { SimpleDataTable } from "@/components/simple-data-table";
// import type { CalculatedMetricWithDefinition } from "@/lib/supabase/metrics-service";
// import { Card, CardHeader, CardContent } from "../ui/card";

// interface CalculatedMetricsProps {
//   programId?: number;
//   programPhaseId?: number;
//   companyId?: string;
//   title?: string;
//   description?: string;
//   showEmpty?: boolean;
// }

// export function CalculatedMetrics({
//   programId,
//   programPhaseId,
//   companyId,
//   title = "Calculated Metrics",
//   description = "Current metric values for this phase",
//   showEmpty = true,
// }: CalculatedMetricsProps) {
//   const { data: calculatedMetrics, isLoading } = useCalculatedMetrics(
//     programPhaseId,
//     companyId
//   );
//   const deleteCalculatedMetric = useDeleteCalculatedMetric();
//   const [isSheetOpen, setIsSheetOpen] = React.useState(false);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
//   const [metricToDelete, setMetricToDelete] = React.useState<CalculatedMetricWithDefinition | null>(null);

//   const handleDeleteClick = (metric: CalculatedMetricWithDefinition) => {
//     setMetricToDelete(metric);
//     setDeleteConfirmOpen(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!metricToDelete) return;
//     try {
//       await deleteCalculatedMetric.mutateAsync(metricToDelete.id);
//       setDeleteConfirmOpen(false);
//       setMetricToDelete(null);
//     } catch (error) {
//       console.error('Failed to delete calculated metric:', error);
//     }
//   };

//   // Create column definitions with useCallback for formatValue
//   const columns: ColumnDef<CalculatedMetricWithDefinition>[] =
//     React.useMemo(() => {
//       return [
//         {
//           id: "metric_name",
//           header: "Metric Name",
//           cell: ({ row }) => {
//             const metric = row.original;
//             return (
//               <div className="font-medium">{metric.metric_definition.name}</div>
//             );
//           },
//         },
//         {
//           accessorKey: "calculated_value",
//           header: "Value",
//           cell: ({ row }) => {
//             const value = row.getValue("calculated_value") as number;
//             return <div className="">{value}</div>;
//           },
//         },
//         {
//           accessorKey: "data_source",
//           header: "Data Source",
//           cell: ({ row }) => {
//             const dataSource = row.getValue("data_source") as string;
//             if (!dataSource) return null;
//             return (
//               <Badge className="capitalize">
//                 {dataSource.replaceAll("_", " ")}
//               </Badge>
//             );
//           },
//         },
//         {
//           id: "organizational_context",
//           header: "Context",
//           cell: ({ row }) => {
//             const metric = row.original;
//             const contexts = [
//               metric.site_id && {
//                 label: "Site",
//                 value: String(metric.site_id),
//               },
//               metric.region_id && {
//                 label: "Region",
//                 value: String(metric.region_id),
//               },
//               metric.business_unit_id && {
//                 label: "Business Unit",
//                 value: String(metric.business_unit_id),
//               },
//               metric.asset_group_id && {
//                 label: "Asset Group",
//                 value: String(metric.asset_group_id),
//               },
//               metric.work_group_id && {
//                 label: "Work Group",
//                 value: String(metric.work_group_id),
//               },
//               metric.role_id && {
//                 label: "Role",
//                 value: String(metric.role_id),
//               },
//             ].filter(Boolean) as { label: string; value: string }[];

//             if (contexts.length === 0) return "-";

//             return (
//               <div className="flex flex-wrap gap-1">
//                 {contexts.slice(0, 2).map((context) => (
//                   <Badge
//                     key={context.label}
//                     variant="outline"
//                     className="text-xs"
//                   >
//                     {context.label}: {context.value}
//                   </Badge>
//                 ))}
//                 {contexts.length > 2 && (
//                   <Badge variant="outline" className="text-xs">
//                     +{contexts.length - 2} more
//                   </Badge>
//                 )}
//               </div>
//             );
//           },
//         },
//         {
//           id: "metadata",
//           header: "Details",
//           cell: ({ row }) => {
//             const metric = row.original;
//             if (!metric.calculation_metadata) return "-";

//             return (
//               <TooltipProvider>
//                 <Tooltip>
//                   <TooltipTrigger>
//                     <IconInfoCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//                   </TooltipTrigger>
//                   <TooltipContent className="max-w-sm">
//                     <div className="space-y-1">
//                       <div className="text-xs font-medium">
//                         Calculation Details
//                       </div>
//                       <pre className="text-xs whitespace-pre-wrap">
//                         {JSON.stringify(metric.calculation_metadata, null, 2)}
//                       </pre>
//                     </div>
//                   </TooltipContent>
//                 </Tooltip>
//               </TooltipProvider>
//             );
//           },
//         },
//         {
//           accessorKey: "created_at",
//           header: "Last Updated",
//           cell: ({ row }) => {
//             const createdAt = row.getValue("created_at") as string;
//             return (
//               <div className="flex items-center space-x-1 text-sm text-muted-foreground">
//                 <IconCalendar className="h-4 w-4" />
//                 <span>
//                   {formatDistanceToNow(new Date(createdAt), {
//                     addSuffix: true,
//                   })}
//                 </span>
//               </div>
//             );
//           },
//         },
//         {
//           id: "actions",
//           header: "Actions",
//           cell: ({ row }) => {
//             const metric = row.original;
//             return (
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => handleDeleteClick(metric)}
//                 className="h-8 w-8 p-0 text-destructive hover:text-destructive"
//               >
//                 <IconTrash className="h-4 w-4" />
//               </Button>
//             );
//           },
//         },
//       ];
//     }, [handleDeleteClick]);

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center py-8">
//         <IconLoader2 className="h-6 w-6 animate-spin" />
//         <span className="ml-2">Loading calculated metrics...</span>
//       </div>
//     );
//   }

//   if (!calculatedMetrics || calculatedMetrics.length === 0) {
//     if (!showEmpty) return null;
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div>
//           <h2 className="font-semibold">{title}</h2>
//           <p className="text-sm text-muted-foreground">{description}</p>
//         </div>
//       </CardHeader>

//       <CardContent>
//         <SimpleDataTable
//           data={calculatedMetrics || []}
//           columns={columns}
//           getRowId={(row) => row.id.toString()}
//           enableSorting={true}
//           enableFilters={true}
//           enableColumnVisibility={true}
//           filterPlaceholder="Filter metrics..."
//           primaryAction={
//             programId
//               ? {
//                   label: "Add Data",
//                   icon: IconPlus,
//                   onClick: () => setIsSheetOpen(true),
//                 }
//               : undefined
//           }
//           defaultPageSize={20}
//         />
//       </CardContent>

//       {programId && (
//         <MetricsDataSheet
//           open={isSheetOpen}
//           onOpenChange={setIsSheetOpen}
//           programId={programId}
//           programPhaseId={programPhaseId}
//         />
//       )}

//       <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
//         <AlertDialogContent>
//           <AlertDialogHeader>
//             <AlertDialogTitle>Delete Calculated Metric</AlertDialogTitle>
//             <AlertDialogDescription>
//               Are you sure you want to delete the calculated metric "{
//                 metricToDelete?.metric_definition.name
//               }"? This action cannot be undone.
//             </AlertDialogDescription>
//           </AlertDialogHeader>
//           <AlertDialogFooter>
//             <AlertDialogCancel>Cancel</AlertDialogCancel>
//             <AlertDialogAction
//               onClick={handleDeleteConfirm}
//               className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//               disabled={deleteCalculatedMetric.isPending}
//             >
//               {deleteCalculatedMetric.isPending ? (
//                 <>
//                   <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 "Delete"
//               )}
//             </AlertDialogAction>
//           </AlertDialogFooter>
//         </AlertDialogContent>
//       </AlertDialog>
//     </Card>
//   );
// }
