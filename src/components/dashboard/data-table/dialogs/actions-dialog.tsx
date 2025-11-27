// import {
//   IconClipboardList,
//   IconBuilding,
//   IconUsers,
//   IconCalendar,
// } from "@tabler/icons-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import type { DialogProps } from "../types";

// export function ActionsDialog({ open, onOpenChange, selectedQuestion }: DialogProps) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <IconClipboardList className="h-5 w-5" />
//             Actions for &quot;{selectedQuestion?.question_title}&quot;
//           </DialogTitle>
//           <DialogDescription>
//             {selectedQuestion?.location} • {selectedQuestion?.action_count}{" "}
//             actions
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {selectedQuestion?.actions &&
//           selectedQuestion.actions.length > 0 ? (
//             selectedQuestion.actions.map((action) => (
//               <div
//                 key={action.id}
//                 className="border rounded-lg p-4 space-y-3"
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     {action.title && (
//                       <h4 className="font-medium text-sm mb-1">
//                         {action.title}
//                       </h4>
//                     )}
//                     <p className="text-sm">{action.description}</p>
//                   </div>
//                   <Badge variant="outline" className="ml-3">
//                     Score: {action.response_score}
//                   </Badge>
//                 </div>

//                 <div className="flex items-center justify-between text-xs text-muted-foreground">
//                   <div className="flex items-center gap-4">
//                     <div className="flex items-center gap-1">
//                       <IconBuilding className="h-3 w-3" />
//                       <span>{action.assessment_name}</span>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <IconUsers className="h-3 w-3" />
//                       <span>{action.interview_name}</span>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-1">
//                     <IconCalendar className="h-3 w-3" />
//                     <span>
//                       {new Date(action.created_at).toLocaleDateString()}
//                     </span>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8 text-muted-foreground">
//               <IconClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
//               <p>No actions found for this question at this location.</p>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }