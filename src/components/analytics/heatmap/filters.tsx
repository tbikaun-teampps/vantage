// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { LabelWithInfo } from "@/components/ui/label-with-info";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// interface FiltersSidebarProps {
//   isSidebarOpen: boolean;
//   isFullscreen: boolean;
//   cardRef: React.RefObject<HTMLDivElement>;
// }

// export function FiltersSidebar({
//   isSidebarOpen,
//   isFullscreen,
//   cardRef,
// }: FiltersSidebarProps) {
//   return (
//     <div
//       className={`bg-background border-r flex-shrink-0 transition-all duration-300 ${
//         isSidebarOpen ? "w-80" : "w-0"
//       } overflow-hidden h-full`}
//     >
//       {isSidebarOpen && (
//         <div className="h-full overflow-y-auto p-4 space-y-4">
//           {/* Basic Filters */}
//           <div className="space-y-3">
//             <h3 className="font-semibold text-sm">Basic Filters</h3>

//             <div className="space-y-2">
//               <LabelWithInfo
//                 label="Questionnaire"
//                 tooltip="Choose a specific questionnaire to filter assessments, or select 'All' to include all questionnaires in the analysis."
//                 isFullscreen={isFullscreen}
//                 container={cardRef.current}
//               />
//               <Select
//                 value={selectedQuestionnaire?.toString()}
//                 onValueChange={(value) =>
//                   setSelectedQuestionnaire(parseInt(value))
//                 }
//               >
//                 <SelectTrigger className="w-full h-8 text-xs">
//                   <SelectValue placeholder="Select questionnaire" />
//                 </SelectTrigger>
//                 <SelectContent
//                   container={
//                     isFullscreen ? cardRef.current || undefined : undefined
//                   }
//                 >
//                   {filters.questionnaires.map((q) => (
//                     <SelectItem key={q.id} value={q.id.toString()}>
//                       {q.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <LabelWithInfo
//                 label="Assessment Scope"
//                 tooltip="Select a single assessment for detailed analysis, or leave empty to include all assessments."
//                 isFullscreen={isFullscreen}
//                 container={cardRef.current}
//               />
//               <Select
//                 value={selectedAssessmentId?.toString() || "all"}
//                 onValueChange={(value) =>
//                   setSelectedAssessmentId(
//                     value === "all" ? null : parseInt(value)
//                   )
//                 }
//               >
//                 <SelectTrigger className="w-full h-8 text-xs">
//                   <SelectValue placeholder="All assessments" />
//                 </SelectTrigger>
//                 <SelectContent
//                   container={
//                     isFullscreen ? cardRef.current || undefined : undefined
//                   }
//                 >
//                   <SelectItem value="all">All Assessments</SelectItem>
//                   {filters.assessments
//                     .filter(
//                       (a) =>
//                         !selectedQuestionnaire ||
//                         a.questionnaireId === selectedQuestionnaire
//                     )
//                     .map((a) => (
//                       <SelectItem key={a.id} value={a.id.toString()}>
//                         <div className="truncate" title={a.name}>
//                           {a.name}
//                         </div>
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <LabelWithInfo
//                 label="Data Metric"
//                 tooltip="Choose what data to visualize: Average Score (mean ratings), Total Interviews (count), Total Actions (action items count), or Completion Rate (percentage of completed responses)."
//                 isFullscreen={isFullscreen}
//                 container={cardRef.current}
//               />
//               <Select
//                 value={selectedMetric}
//                 onValueChange={(value) =>
//                   setSelectedMetric(value as HeatmapMetric)
//                 }
//                 disabled={!selectedQuestionnaire}
//               >
//                 <SelectTrigger className="w-full h-8 text-xs capitalize">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent
//                   container={
//                     isFullscreen ? cardRef.current || undefined : undefined
//                   }
//                 >
//                   {filters.metrics.map((m) => (
//                     <SelectItem key={m} value={m} className="capitalize">
//                       {m.replaceAll("_", " ")}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Analysis Configuration */}
//           <div className="space-y-3 border-t pt-4">
//             <h3 className="font-semibold text-sm">Analysis Configuration</h3>

//             {/* <div className="space-y-2">
//                       <LabelWithInfo
//                         label="Detail Level"
//                         tooltip="Set the granularity of analysis: Individual Questions (most detailed), Steps (groups of questions), or Sections (high-level categories)."
//                         isFullscreen={isFullscreen}
//                         container={cardRef.current}
//                       />
//                       <Select
//                         value={questionnaireLevel}
//                         onValueChange={setQuestionnaireLevel}
//                       >
//                         <SelectTrigger className="w-full h-8 text-xs">
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent container={isFullscreen ? cardRef.current || undefined : undefined}>
//                           <SelectItem value="Question">
//                             Individual Questions
//                           </SelectItem>
//                           <SelectItem value="Step">Steps</SelectItem>
//                           <SelectItem value="Section">
//                             Sections
//                           </SelectItem>
//                         </SelectContent>
//                       </Select>
//                     </div> */}

//             <div className="space-y-2">
//               <LabelWithInfo
//                 label="X-Axis"
//                 tooltip="Choose what to display horizontally: organizational hierarchy (Business Unit, Site, etc.), Roles, or questionnaire elements (Sections, Steps, Questions)."
//                 isFullscreen={isFullscreen}
//                 container={cardRef.current}
//               />
//               <Select
//                 value={xAxis}
//                 onValueChange={setXAxis}
//                 disabled={!selectedQuestionnaire}
//               >
//                 <SelectTrigger className="w-full h-8 text-xs capitalize">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent
//                   container={
//                     isFullscreen ? cardRef.current || undefined : undefined
//                   }
//                 >
//                   <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
//                     Company Hierarchy
//                   </div>
//                   {filters.axes
//                     .filter((item) => item.category === "company")
//                     .sort((a, b) => a.order - b.order)
//                     .map((item) => (
//                       <SelectItem
//                         key={item.value}
//                         value={item.value}
//                         className="capitalize"
//                       >
//                         {item.value.replaceAll("_", " ")}
//                       </SelectItem>
//                     ))}
//                   <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
//                     Questionnaire
//                   </div>
//                   {filters.axes
//                     .filter((item) => item.category === "questionnaire")
//                     .sort((a, b) => a.order - b.order)
//                     .map((item) => (
//                       <SelectItem
//                         key={item.value}
//                         value={item.value}
//                         className="capitalize"
//                       >
//                         {item.value.replaceAll("_", " ")}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="space-y-2">
//               <LabelWithInfo
//                 label="Y-Axis"
//                 tooltip="Choose what to display vertically: organizational hierarchy (Business Unit, Site, etc.), Roles, or questionnaire elements (Sections, Steps, Questions)."
//                 isFullscreen={isFullscreen}
//                 container={cardRef.current}
//               />
//               <Select
//                 value={yAxis}
//                 onValueChange={setYAxis}
//                 disabled={!selectedQuestionnaire}
//               >
//                 <SelectTrigger className="w-full h-8 text-xs capitalize">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent
//                   container={
//                     isFullscreen ? cardRef.current || undefined : undefined
//                   }
//                 >
//                   <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
//                     Company Hierarchy
//                   </div>
//                   {filters.axes
//                     .filter((item) => item.category === "company")
//                     .sort((a, b) => a.order - b.order)
//                     .map((item) => (
//                       <SelectItem
//                         key={item.value}
//                         value={item.value}
//                         className="capitalize"
//                       >
//                         {item.value.replaceAll("_", " ")}
//                       </SelectItem>
//                     ))}
//                   <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground border-t mt-1 pt-2">
//                     Questionnaire
//                   </div>
//                   {filters.axes
//                     .filter((item) => item.category === "questionnaire")
//                     .sort((a, b) => a.order - b.order)
//                     .map((item) => (
//                       <SelectItem
//                         key={item.value}
//                         value={item.value}
//                         className="capitalize"
//                       >
//                         {item.value.replaceAll("_", " ")}
//                       </SelectItem>
//                     ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           {/* Organizational Filters */}
//           {/* <div className="space-y-3 border-t pt-4">
//                     <h3 className="font-semibold text-sm">Organizational Filters</h3>
        
//                     {organizationalData.businessUnits.length > 0 && (
//                       <div className="space-y-2">
//                         <LabelWithInfo
//                           label="Business Units"
//                           tooltip="Filter results to include only selected business units. Leave empty to include all business units in the analysis."
//                           isFullscreen={isFullscreen}
//                           container={cardRef.current}
//                         />
//                         <MultiSelect
//                           options={organizationalData.businessUnits}
//                           value={selectedBusinessUnits}
//                           onChange={setSelectedBusinessUnits}
//                           placeholder="All business units"
//                         />
//                       </div>
//                     )}
        
//                     {organizationalData.sites.length > 0 && (
//                       <div className="space-y-2">
//                         <LabelWithInfo
//                           label="Sites"
//                           tooltip="Filter results to include only selected sites/locations. Leave empty to include all sites in the analysis."
//                           isFullscreen={isFullscreen}
//                           container={cardRef.current}
//                         />
//                         <MultiSelect
//                           options={organizationalData.sites}
//                           value={selectedSites}
//                           onChange={setSelectedSites}
//                           placeholder="All sites"
//                         />
//                       </div>
//                     )}
        
//                     {organizationalData.roles.length > 0 && (
//                       <div className="space-y-2">
//                         <LabelWithInfo
//                           label="Roles"
//                           tooltip="Filter results to include only selected job roles/positions. Leave empty to include all roles in the analysis."
//                           isFullscreen={isFullscreen}
//                           container={cardRef.current}
//                         />
//                         <MultiSelect
//                           options={organizationalData.roles}
//                           value={selectedRoles}
//                           onChange={setSelectedRoles}
//                           placeholder="All roles"
//                         />
//                       </div>
//                     )}
//                   </div> */}

//           {/* Data Summary Bar */}
//           <div className="flex-1 border-t pt-4">
//             <div className="flex gap-1 flex-wrap">
//               {selectedQuestionnaire && filters && (
//                 <Badge variant="outline" className="text-xs flex-shrink-0">
//                   {
//                     filters.questionnaires.find(
//                       (q) => q.id === selectedQuestionnaire
//                     )?.name
//                   }
//                 </Badge>
//               )}
//               {selectedAssessmentId && filters && (
//                 <Button
//                   asChild
//                   variant="outline"
//                   className="text-xs flex-shrink-0"
//                 >
//                   <Link
//                     to={routes.assessmentOnsiteDetail(
//                       selectedAssessmentId.toString()
//                     )}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                   >
//                     {
//                       filters.assessments.find(
//                         (a) => a.id === selectedAssessmentId
//                       )?.name
//                     }
//                     <IconExternalLink className="h-2 w-2" />
//                   </Link>
//                 </Button>
//               )}

//               {/* Organizational Filter Badges */}
//               {selectedBusinessUnits.length > 0 && (
//                 <Badge variant="outline" className="text-xs flex-shrink-0">
//                   {selectedBusinessUnits.length} BU
//                   {selectedBusinessUnits.length > 1 ? "s" : ""}
//                 </Badge>
//               )}
//               {selectedSites.length > 0 && (
//                 <Badge variant="outline" className="text-xs flex-shrink-0">
//                   {selectedSites.length} Site
//                   {selectedSites.length > 1 ? "s" : ""}
//                 </Badge>
//               )}
//               {selectedRoles.length > 0 && (
//                 <Badge variant="outline" className="text-xs flex-shrink-0">
//                   {selectedRoles.length} Role
//                   {selectedRoles.length > 1 ? "s" : ""}
//                 </Badge>
//               )}

//               <Badge
//                 variant="outline"
//                 className="text-xs flex-shrink-0 capitalize"
//               >
//                 {selectedMetric.replaceAll("_", " ")}
//               </Badge>
//               <Badge
//                 variant="outline"
//                 className="text-xs flex-shrink-0 capitalize"
//               >
//                 {xAxis.replaceAll("_", " ")} × {yAxis.replaceAll("_", " ")}
//               </Badge>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
