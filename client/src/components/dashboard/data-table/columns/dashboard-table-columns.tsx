// import {
//   IconUsers,
//   IconClipboardList,
//   IconBuilding,
//   IconClock,
// } from "@tabler/icons-react";
// import { type ColumnDef } from "@tanstack/react-table";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import type { QuestionAnalytics } from "@/types/domains/dashboard";
// import type { DialogHandlers } from "../types";
// import { getAssessmentStatus, getScoreStyle, getRiskStyle } from "../utils";

// export function createDashboardColumns(
//   handlers: DialogHandlers
// ): ColumnDef<QuestionAnalytics>[] {
//   const { onViewActions, onViewResponses, onViewAssessments } = handlers;

//   return [
//     {
//       accessorKey: "location",
//       header: "Location",
//       cell: ({ row }) => {
//         const locationParts = row.original.location.split(" > ");
//         const siteName = locationParts[locationParts.length - 1]; // Last part (Site)
//         return (
//           <div className="min-w-0 flex-1">
//             <div className="font-medium text-sm mb-1.5">{siteName}</div>
//             <div
//               className="text-xs text-muted-foreground/80 truncate leading-relaxed"
//               title={row.original.location}
//             >
//               {row.original.location}
//             </div>
//           </div>
//         );
//       },
//       enableHiding: false,
//     },
//     {
//       accessorKey: "question_title",
//       header: "Domain",
//       cell: ({ row }) => (
//         <div className="min-w-0 flex-1">
//           <div className="font-medium text-sm mb-1.5">
//             {row.original.question_title}
//           </div>
//           <div className="text-xs text-muted-foreground/80 truncate leading-relaxed">
//             {row.original.domain}
//           </div>
//         </div>
//       ),
//       enableHiding: false,
//     },
//     {
//       accessorKey: "avg_score_percentage",
//       header: ({}) => <div className="text-center">Avg Score</div>,
//       cell: ({ row }) => {
//         const percentage = row.original.avg_score_percentage;
//         return (
//           <div className="flex justify-center">
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Badge
//                     variant="outline"
//                     className={getScoreStyle(percentage)}
//                   >
//                     {percentage}%
//                   </Badge>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>
//                     {row.original.avg_score} / {row.original.max_scale_value} on
//                     rating scale
//                   </p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "risk_level",
//       header: ({}) => <div className="text-center">Risk</div>,
//       cell: ({ row }) => {
//         const risk = row.original.risk_level;
//         return (
//           <div className="flex justify-center">
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Badge variant="outline" className={getRiskStyle(risk)}>
//                     {risk}
//                   </Badge>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>Based on {row.original.action_count} actions created</p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "last_assessed",
//       header: ({}) => <div className="text-center">Last Assessed</div>,
//       cell: ({ row }) => {
//         const status = getAssessmentStatus(
//           row.original.last_assessed,
//           row.original.assessment_type
//         );
//         return (
//           <div className="flex justify-center">
//             <TooltipProvider>
//               <Tooltip>
//                 <TooltipTrigger asChild>
//                   <Badge variant="outline" className={status.className}>
//                     <IconClock className="h-3 w-3 mr-1" />
//                     {status.label}
//                   </Badge>
//                 </TooltipTrigger>
//                 <TooltipContent>
//                   <p>
//                     {row.original.assessment_type} assessment: {status.tooltip}
//                   </p>
//                 </TooltipContent>
//               </Tooltip>
//             </TooltipProvider>
//           </div>
//         );
//       },
//     },
//     {
//       accessorKey: "response_count",
//       header: ({}) => <div className="text-center">Responses</div>,
//       cell: ({ row }) => (
//         <div className="flex justify-center">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-auto p-1 hover:bg-muted cursor-pointer"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onViewResponses(row.original);
//                   }}
//                   disabled={row.original.response_count === 0}
//                 >
//                   <div className="flex items-center gap-1">
//                     <IconUsers className="h-3 w-3 text-muted-foreground" />
//                     <Badge variant="outline">
//                       {row.original.response_count}
//                     </Badge>
//                   </div>
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Click to view response details and scores</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "action_count",
//       header: ({}) => <div className="text-center">Actions</div>,
//       cell: ({ row }) => (
//         <div className="flex justify-center">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-auto p-1 hover:bg-muted cursor-pointer"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onViewActions(row.original);
//                   }}
//                   disabled={row.original.action_count === 0}
//                 >
//                   <div className="flex items-center gap-1">
//                     <IconClipboardList className="h-3 w-3 text-muted-foreground" />
//                     <Badge variant="outline">{row.original.action_count}</Badge>
//                   </div>
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Click to view all actions created for this question</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "assessment_type",
//       header: ({}) => <div className="text-center">Type</div>,
//       cell: ({ row }) => (
//         <div className="flex justify-center">
//           <Badge variant="outline" className="capitalize">
//             {row.original.assessment_type}
//           </Badge>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "assessments",
//       header: ({}) => <div className="text-center">Assessments</div>,
//       cell: ({ row }) => (
//         <div className="flex justify-center">
//           <TooltipProvider>
//             <Tooltip>
//               <TooltipTrigger asChild>
//                 <Button
//                   variant="ghost"
//                   size="sm"
//                   className="h-auto p-1 hover:bg-muted cursor-pointer"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onViewAssessments(row.original);
//                   }}
//                   disabled={row.original.assessments.length === 0}
//                 >
//                   <div className="flex items-center gap-1">
//                     <IconBuilding className="h-3 w-3 text-muted-foreground" />
//                     <Badge variant="outline">
//                       {row.original.assessments.length}
//                     </Badge>
//                   </div>
//                 </Button>
//               </TooltipTrigger>
//               <TooltipContent>
//                 <p>Click to view assessments containing this question</p>
//               </TooltipContent>
//             </Tooltip>
//           </TooltipProvider>
//         </div>
//       ),
//     },
//   ];
// }
