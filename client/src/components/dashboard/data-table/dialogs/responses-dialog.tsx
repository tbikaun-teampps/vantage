// import { IconUsers } from "@tabler/icons-react";
// import { Badge } from "@/components/ui/badge";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import type { DialogProps } from "../types";

// export function ResponsesDialog({ open, onOpenChange, selectedQuestion }: DialogProps) {
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <IconUsers className="h-5 w-5" />
//             Responses for &quot;{selectedQuestion?.question_title}&quot;
//           </DialogTitle>
//           <DialogDescription>
//             {selectedQuestion?.location} • {selectedQuestion?.response_count}{" "}
//             responses
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-4">
//           {selectedQuestion?.worst_responses &&
//           selectedQuestion.worst_responses.length > 0 ? (
//             selectedQuestion.worst_responses.map((response, idx) => (
//               <div key={idx} className="border rounded-lg p-4 space-y-3">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-2 mb-2">
//                       <Badge
//                         // variant={
//                         //   response.score >= 80
//                         //     ? "default"
//                         //     : response.score >= 60
//                         //     ? "secondary"
//                         //     : "destructive"
//                         // }
//                       >
//                         {response.score}
//                       </Badge>
//                       <span className="text-sm font-medium">
//                         {response.assessment_name}
//                       </span>
//                     </div>
//                     {response.comments && (
//                       <p className="text-sm italic text-muted-foreground">
//                         &quot;{response.comments}&quot;
//                       </p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between text-xs text-muted-foreground">
//                   <div className="flex items-center gap-1">
//                     <IconUsers className="h-3 w-3" />
//                     <span>{response.interview_name}</span>
//                   </div>
//                 </div>
//               </div>
//             ))
//           ) : (
//             <div className="text-center py-8 text-muted-foreground">
//               <IconUsers className="h-12 w-12 mx-auto mb-4 opacity-50" />
//               <p>
//                 No response details available for this question at this
//                 location.
//               </p>
//             </div>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }