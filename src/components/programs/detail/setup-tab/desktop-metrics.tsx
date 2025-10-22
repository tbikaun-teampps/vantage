// import { useState } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import {
//   IconAlertCircle,
//   IconPlus,
//   IconTrash,
//   IconLoader2,
// } from "@tabler/icons-react";
// import {
//   useProgramMetricsWithDefinitions,
//   useAvailableMetricsForProgram,
//   useAddMetricToProgram,
//   useRemoveMetricFromProgram,
// } from "@/hooks/useMetrics";
// import { toast } from "sonner";
// import type { ProgramMetricWithDefinition } from "@/types/program";

// interface MetricsProps {
//   programId: number;
// }

// export function Metrics({ programId }: MetricsProps) {
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
//   const [selectedMetricIds, setSelectedMetricIds] = useState<number[]>([]);

//   const { data: programMetrics, isLoading: isLoadingProgramMetrics } =
//     useProgramMetricsWithDefinitions(programId);
//   const { data: availableMetrics, isLoading: isLoadingAvailableMetrics } =
//     useAvailableMetricsForProgram(programId);
//   const addMetricMutation = useAddMetricToProgram();
//   const removeMetricMutation = useRemoveMetricFromProgram();

//   const handleMetricSelection = (metricId: number, checked: boolean) => {
//     if (checked) {
//       setSelectedMetricIds((prev) => [...prev, metricId]);
//     } else {
//       setSelectedMetricIds((prev) => prev.filter((id) => id !== metricId));
//     }
//   };

//   const handleAddSelectedMetrics = async () => {
//     if (selectedMetricIds.length === 0) {
//       toast.error("Please select at least one metric to add.");
//       return;
//     }

//     for (const metricId of selectedMetricIds) {
//       await addMetricMutation.mutateAsync({ programId, metricId });
//     }
//     setSelectedMetricIds([]);
//     setIsAddDialogOpen(false);
//   };

//   const handleRemoveMetric = async (metricId: number) => {
//     await removeMetricMutation.mutateAsync({ programId, metricId });
//   };

//   const isLoading = isLoadingProgramMetrics;
//   const hasMetrics = programMetrics && programMetrics.length > 0;

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle>Desktop Analysis Measurements</CardTitle>
//             <CardDescription>
//               Calculate and track measurements relevant to the program's
//               objectives.
//             </CardDescription>
//           </div>
//           <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//             <DialogTrigger asChild>
//               <Button variant="outline" size="sm">
//                 <IconPlus className="h-4 w-4 mr-2" />
//                 Add Measurements
//               </Button>
//             </DialogTrigger>
//             <DialogContent className="max-w-2xl">
//               <DialogHeader>
//                 <DialogTitle>Add Measurements to Program</DialogTitle>
//                 <DialogDescription>
//                   Select measurements to track for this program. You can choose
//                   multiple measurements at once.
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="space-y-4">
//                 {isLoadingAvailableMetrics ? (
//                   <div className="flex items-center justify-center py-8">
//                     <IconLoader2 className="h-6 w-6 animate-spin" />
//                     <span className="ml-2">
//                       Loading available measurements...
//                     </span>
//                   </div>
//                 ) : availableMetrics && availableMetrics.length > 0 ? (
//                   <>
//                     <div className="space-y-3 max-h-96 overflow-y-auto">
//                       {availableMetrics.map((metric) => (
//                         <div
//                           key={metric.id}
//                           className="flex items-start space-x-3 p-3 border rounded-lg"
//                         >
//                           <Checkbox
//                             id={`metric-${metric.id}`}
//                             checked={selectedMetricIds.includes(metric.id)}
//                             onCheckedChange={(checked) =>
//                               handleMetricSelection(metric.id, !!checked)
//                             }
//                           />
//                           <div className="flex-1 min-w-0">
//                             <label
//                               htmlFor={`metric-${metric.id}`}
//                               className="block text-sm font-medium cursor-pointer"
//                             >
//                               {metric.name}
//                             </label>
//                             {metric.description && (
//                               <p className="text-sm text-muted-foreground mt-1">
//                                 {metric.description}
//                               </p>
//                             )}
//                             {metric.calculation_type && (
//                               <Badge variant="secondary" className="mt-2">
//                                 {metric.calculation_type}
//                               </Badge>
//                             )}
//                             {metric.provider && (
//                               <Badge className="mt-2">{metric.provider}</Badge>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                     <div className="flex justify-end space-x-2 pt-4 border-t">
//                       <Button
//                         variant="outline"
//                         onClick={() => setIsAddDialogOpen(false)}
//                       >
//                         Cancel
//                       </Button>
//                       <Button
//                         onClick={handleAddSelectedMetrics}
//                         disabled={
//                           selectedMetricIds.length === 0 ||
//                           addMetricMutation.isPending
//                         }
//                       >
//                         {addMetricMutation.isPending ? (
//                           <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
//                         ) : (
//                           <IconPlus className="h-4 w-4 mr-2" />
//                         )}
//                         Add{" "}
//                         {selectedMetricIds.length > 0
//                           ? `${selectedMetricIds.length} `
//                           : ""}
//                         Metrics
//                       </Button>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="text-center py-8">
//                     <IconAlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
//                     <p className="mt-2 text-sm text-muted-foreground">
//                       No additional measurements available to add.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </DialogContent>
//           </Dialog>
//         </div>
//       </CardHeader>
//       <CardContent>
//         {isLoading ? (
//           <div className="flex items-center justify-center py-8">
//             <IconLoader2 className="h-6 w-6 animate-spin" />
//             <span className="ml-2">Loading measurements...</span>
//           </div>
//         ) : hasMetrics ? (
//           <div className="space-y-3">
//             {programMetrics.map(
//               (programMetric: ProgramMetricWithDefinition) => (
//                 <div
//                   key={programMetric.id}
//                   className="flex items-center justify-between p-4 border rounded-lg"
//                 >
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center space-x-3">
//                       <h4 className="text-sm font-medium">
//                         {programMetric.metric_definition.name}
//                       </h4>
//                       {programMetric.metric_definition.calculation_type && (
//                         <Badge variant="secondary">
//                           {programMetric.metric_definition.calculation_type}
//                         </Badge>
//                       )}
//                     </div>
//                     {programMetric.metric_definition.description && (
//                       <p className="text-sm text-muted-foreground mt-1">
//                         {programMetric.metric_definition.description}
//                       </p>
//                     )}
//                     <div className="flex gap-4">
//                       {programMetric.metric_definition.provider && (
//                         <div className="text-sm mt-2">
//                           Data Provider:{" "}
//                           <Badge>
//                             {programMetric.metric_definition.provider}
//                           </Badge>
//                         </div>
//                       )}
//                       {programMetric.metric_definition.required_csv_columns && (
//                         <div className="text-sm mt-2">
//                           Required CSV Columns:{" "}
//                           <div className="inline-flex flex-wrap gap-1 text-xs">
//                             {Object.entries(
//                               programMetric.metric_definition
//                                 .required_csv_columns
//                             ).map(([col, colType]: [string, string]) => (
//                               <Badge variant="outline" key={col}>
//                                 {col}: {colType}
//                               </Badge>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => handleRemoveMetric(programMetric.metric_id)}
//                     disabled={removeMetricMutation.isPending}
//                     className="text-destructive hover:text-destructive"
//                   >
//                     {removeMetricMutation.isPending ? (
//                       <IconLoader2 className="h-4 w-4 animate-spin" />
//                     ) : (
//                       <IconTrash className="h-4 w-4" />
//                     )}
//                   </Button>
//                 </div>
//               )
//             )}
//           </div>
//         ) : (
//           <div className="text-center py-8">
//             <IconAlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
//             <h3 className="mt-2 text-sm font-semibold">
//               No measurements configured
//             </h3>
//             <p className="mt-1 text-sm text-muted-foreground">
//               Add measurements to track key performance indicators for this
//               program.
//             </p>
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }
