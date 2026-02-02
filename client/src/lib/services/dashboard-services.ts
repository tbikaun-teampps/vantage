// import { createClient } from "@/lib/supabase/client";
// import type {
//   DashboardMetrics,
//   DashboardAction,
//   QuestionAnalytics,
//   DomainAnalytics,
//   AssetRiskAnalytics,
//   DashboardFilters,
//   RiskCalculationParams,
//   LocationMetrics,
//   DomainMetrics,
// } from "@/types/domains/dashboard";

// export class DashboardService {
//   private supabase = createClient();

//   private async getCompanyAssessmentIds(companyId: string): Promise<number[]> {
//     const { data: assessments, error } = await this.supabase
//       .from("assessments")
//       .select("id, company:companies!inner(id, deleted_at)")
//       .is("company.deleted_at", null)
//       .eq("company.id", companyId);

//     if (error) throw new Error(error.message);
//     return (assessments || []).map((a) => a.id);
//   }

//   // Business logic helpers
//   private calculateRiskLevel(
//     params: RiskCalculationParams
//   ): "low" | "medium" | "high" | "critical" {
//     const { actionCount, scorePercentage, percentiles } = params;

//     // Primary classification by actions
//     if (actionCount >= 4) return "high";
//     if (actionCount >= 3) return "medium";

//     // Secondary classification by percentiles if available
//     if (percentiles) {
//       if (scorePercentage <= percentiles.p10) return "critical";
//       if (scorePercentage <= percentiles.p25) return "high";
//       if (scorePercentage <= percentiles.p75) return "medium";
//     }

//     return "low";
//   }

//   private calculatePercentiles(scores: number[]): {
//     p10: number;
//     p25: number;
//     p75: number;
//   } {
//     const sorted = [...scores].sort((a, b) => a - b);
//     return {
//       p10: sorted[Math.floor(sorted.length * 0.1)] || 0,
//       p25: sorted[Math.floor(sorted.length * 0.25)] || 0,
//       p75: sorted[Math.floor(sorted.length * 0.75)] || 0,
//     };
//   }

//   private getMaxScaleValue(ratingScales: any[]): number {
//     return ratingScales.length > 0
//       ? Math.max(
//           ...ratingScales.map((rs: any) => rs.questionnaire_rating_scales.value)
//         )
//       : 5; // Default to 5 if no scale found
//   }

//   private buildOrgPath(
//     businessUnit: string,
//     region: string,
//     site: string
//   ): string {
//     return `${businessUnit} > ${region} > ${site}`;
//   }

//   private buildDomainPath(
//     section: string,
//     step: string,
//     question: string
//   ): string {
//     return `${section} > ${step} > ${question}`;
//   }

//   /**
//    * Load basic dashboard metrics (assessments, interviews, actions)
//    */
//   async loadMetrics(companyId: string): Promise<DashboardMetrics> {
//     const assessmentIds = await this.getCompanyAssessmentIds(companyId);
//     const totalAssessments = assessmentIds.length;

//     // Get total interviews
//     let totalInterviews = 0;
//     if (assessmentIds.length > 0) {
//       const { count, error } = await this.supabase
//         .from("interviews")
//         .select("*", { count: "exact", head: true })
//         .in("assessment_id", assessmentIds);

//       if (error) throw new Error(error.message);
//       totalInterviews = count || 0;
//     }

//     // Load generated actions analytics
//     const generatedActions =
//       await this.loadGeneratedActionsAnalytics(assessmentIds);

//     return {
//       assessments: {
//         total: totalAssessments,
//         trend: 0, // TODO: Calculate trend
//         status: "up",
//       },
//       peopleInterviewed: {
//         total: totalInterviews,
//         trend: 0, // TODO: Calculate trend
//         status: "up",
//       },
//       generatedActions,
//       worstPerformingArea: {
//         // Will be populated by updateMetricsFromAnalytics
//       },
//       criticalAssets: {
//         // Will be populated by updateMetricsFromAnalytics
//       },
//     };
//   }

//   /**
//    * Load dashboard actions with full transformations
//    */
//   async loadActions(filters: DashboardFilters): Promise<DashboardAction[]> {
//     let { assessmentIds } = filters;

//     if (!assessmentIds || assessmentIds.length === 0) {
//       return [];
//     }

//     const { data, error } = await this.supabase
//       .from("interview_response_actions")
//       .select(
//         `
//         id,
//         description,
//         created_at,
//         interview_responses!inner(
//           rating_score,
//           comments,
//           questionnaire_questions!inner(
//             title,
//             questionnaire_steps!inner(
//               title,
//               questionnaire_sections!inner(title)
//             )
//           ),
//           interviews!inner(
//             name,
//             assessments!inner(
//               name,
//               type,
//               business_units!inner(name),
//               regions!inner(name),
//               sites!inner(name)
//             )
//           )
//         )
//       `
//       )
//       .in("interview_responses.interviews.assessment_id", assessmentIds);

//     if (error) throw new Error(error.message);

//     return (data || []).map((item: any) => {
//       const response = item.interview_responses;
//       const interview = response.interviews;
//       const assessment = interview.assessments;
//       const question = response.questionnaire_questions;
//       const step = question.questionnaire_steps;
//       const section = step.questionnaire_sections;

//       return {
//         id: item.id,
//         org_path: this.buildOrgPath(
//           assessment.business_units.name,
//           assessment.regions.name,
//           assessment.sites.name
//         ),
//         score: response.rating_score,
//         assessment_type: assessment.type,
//         domain: this.buildDomainPath(section.title, step.title, question.title),
//         action: item.description,
//         assessment_name: assessment.name,
//         interview_name: interview.name,
//         response_comments: response.comments,
//         action_created_at: item.created_at,
//       };
//     });
//   }

//   /**
//    * Load question analytics with risk calculations
//    */
//   async loadQuestionAnalytics(
//     filters: DashboardFilters
//   ): Promise<QuestionAnalytics[]> {
//     const { assessmentIds, limit = 20 } = filters;

//     if (!assessmentIds || assessmentIds.length === 0) {
//       return [];
//     }

//     // Get all interview responses with question and assessment details
//     const { data: responses, error: responsesError } = await this.supabase
//       .from("interview_responses")
//       .select(
//         `
//         id,
//         rating_score,
//         comments,
//         questionnaire_questions!inner(
//           id,
//           title,
//           questionnaire_steps!inner(
//             title,
//             questionnaire_sections!inner(title),
//             questionnaire_section_id
//           ),
//           questionnaire_question_rating_scales!inner(
//             questionnaire_rating_scales!inner(
//               value,
//               questionnaire_id
//             )
//           )
//         ),
//         interviews!inner(
//           name,
//           assessments!inner(
//             name,
//             type,
//             questionnaire_id,
//             created_at,
//             updated_at,
//             business_units!inner(name),
//             regions!inner(name),
//             sites!inner(name)
//           )
//         )
//       `
//       )
//       .in("interviews.assessment_id", assessmentIds)
//       .not("rating_score", "is", null);

//     if (responsesError) throw new Error(responsesError.message);

//     // Get action details
//     const { data: actions, error: actionsError } = await this.supabase
//       .from("interview_response_actions")
//       .select(
//         `
//         id,
//         title,
//         description,
//         created_at,
//         interview_responses!inner(
//           rating_score,
//           questionnaire_questions!inner(id),
//           interviews!inner(
//             name,
//             assessments!inner(
//               name,
//               business_units!inner(name),
//               regions!inner(name),
//               sites!inner(name)
//             )
//           )
//         )
//       `
//       )
//       .in("interview_responses.interviews.assessment_id", assessmentIds);

//     if (actionsError) throw new Error(actionsError.message);

//     // Group responses by question + location combination
//     const questionLocationMap = new Map<
//       string,
//       {
//         question: any;
//         location: string;
//         responses: any[];
//         actions: any[];
//       }
//     >();

//     // Process responses
//     (responses || []).forEach((response: any) => {
//       const questionId = response.questionnaire_questions.id;
//       const assessment = response.interviews.assessments;
//       const location = this.buildOrgPath(
//         assessment.business_units.name,
//         assessment.regions.name,
//         assessment.sites.name
//       );
//       const key = `${questionId}-${location}`;

//       if (!questionLocationMap.has(key)) {
//         questionLocationMap.set(key, {
//           question: response.questionnaire_questions,
//           location,
//           responses: [],
//           actions: [],
//         });
//       }

//       questionLocationMap.get(key)!.responses.push(response);
//     });

//     // Process actions
//     (actions || []).forEach((action: any) => {
//       const questionId = action.interview_responses.questionnaire_questions.id;
//       const assessment = action.interview_responses.interviews.assessments;
//       const location = this.buildOrgPath(
//         assessment.business_units.name,
//         assessment.regions.name,
//         assessment.sites.name
//       );
//       const key = `${questionId}-${location}`;

//       if (questionLocationMap.has(key)) {
//         questionLocationMap.get(key)!.actions.push(action);
//       }
//     });

//     // Calculate analytics for each question-location combination
//     const analytics: QuestionAnalytics[] = Array.from(
//       questionLocationMap.entries()
//     ).map(([key, data]) => {
//       const scores = data.responses.map((r) => r.rating_score);
//       const avgScore =
//         scores.reduce((sum, score) => sum + score, 0) / scores.length;

//       // Get max scale value
//       const ratingScales =
//         data.responses[0]?.questionnaire_questions
//           ?.questionnaire_question_rating_scales || [];
//       const maxScaleValue = this.getMaxScaleValue(ratingScales);
//       const avgScorePercentage = Math.round((avgScore / maxScaleValue) * 100);

//       // Get unique assessments
//       const assessments = [
//         ...new Set(data.responses.map((r) => r.interviews.assessments.name)),
//       ];

//       // Get most recent assessment date
//       const lastAssessed = data.responses.reduce((latest, r) => {
//         const responseDate = new Date(
//           r.interviews.assessments.created_at ||
//             r.interviews.assessments.updated_at
//         );
//         const latestDate = new Date(latest);
//         return responseDate > latestDate ? responseDate.toISOString() : latest;
//       }, data.responses[0]?.interviews?.assessments?.created_at || new Date().toISOString());

//       // Get worst responses (bottom 3)
//       const worstResponses = data.responses
//         .sort((a, b) => a.rating_score - b.rating_score)
//         .slice(0, 3)
//         .map((r) => ({
//           score: r.rating_score,
//           assessment_name: r.interviews.assessments.name,
//           interview_name: r.interviews.name,
//           org_path: data.location,
//           comments: r.comments,
//         }));

//       // Transform actions with full details
//       const actionDetails = data.actions.map((a) => ({
//         id: a.id,
//         title: a.title,
//         description: a.description,
//         created_at: a.created_at,
//         response_score: a.interview_responses.rating_score,
//         assessment_name: a.interview_responses.interviews.assessments.name,
//         interview_name: a.interview_responses.interviews.name,
//         org_path: data.location,
//       }));

//       const step = data.question.questionnaire_steps;
//       const section = step.questionnaire_sections;
//       const questionId = parseInt(key.split("-")[0]);

//       return {
//         question_id: questionId,
//         question_title: data.question.title,
//         domain: this.buildDomainPath(
//           section.title,
//           step.title,
//           data.question.title
//         ),
//         assessment_type:
//           data.responses[0]?.interviews?.assessments?.type || "onsite",
//         location: data.location,
//         avg_score: Math.round(avgScore * 100) / 100,
//         max_scale_value: maxScaleValue,
//         avg_score_percentage: avgScorePercentage,
//         response_count: data.responses.length,
//         action_count: data.actions.length,
//         risk_level: this.calculateRiskLevel({
//           actionCount: data.actions.length,
//           scorePercentage: avgScorePercentage,
//         }),
//         last_assessed: lastAssessed,
//         assessments,
//         actions: actionDetails,
//         worst_responses: worstResponses,
//       };
//     });

//     // Sort by average score (worst first) and take top limit
//     return analytics.sort((a, b) => a.avg_score - b.avg_score).slice(0, limit);
//   }

//   /**
//    * Load domain analytics with performance calculations
//    */
//   async loadDomainAnalytics(
//     filters: DashboardFilters
//   ): Promise<DomainAnalytics[]> {
//     const { assessmentIds } = filters;

//     if (!assessmentIds || assessmentIds.length === 0) {
//       return [];
//     }

//     const { data: responses, error } = await this.supabase
//       .from("interview_responses")
//       .select(
//         `
//         id,
//         rating_score,
//         questionnaire_questions!inner(
//           id,
//           title,
//           questionnaire_steps!inner(
//             title,
//             questionnaire_sections!inner(title)
//           ),
//           questionnaire_question_rating_scales!inner(
//             questionnaire_rating_scales!inner(
//               value,
//               questionnaire_id
//             )
//           )
//         ),
//         interviews!inner(
//           name,
//           assessments!inner(
//             name,
//             type,
//             created_at,
//             business_units!inner(name),
//             regions!inner(name),
//             sites!inner(name)
//           )
//         )
//       `
//       )
//       .in("interviews.assessment_id", assessmentIds);

//     if (error) throw new Error(error.message);

//     // Group by domain (section level)
//     const domainMap = new Map<string, DomainMetrics>();

//     (responses || []).forEach((response: any) => {
//       const section =
//         response.questionnaire_questions.questionnaire_steps
//           .questionnaire_sections;
//       const domain = section.title;
//       const location = this.buildOrgPath(
//         response.interviews.assessments.business_units.name,
//         response.interviews.assessments.regions.name,
//         response.interviews.assessments.sites.name
//       );

//       const maxScaleValue = this.getMaxScaleValue(
//         response.questionnaire_questions.questionnaire_question_rating_scales ||
//           []
//       );

//       if (!domainMap.has(domain)) {
//         domainMap.set(domain, {
//           scores: [],
//           maxScales: [],
//           locations: new Set(),
//           questions: new Set(),
//           responses: [],
//         });
//       }

//       const domainData = domainMap.get(domain)!;
//       domainData.scores.push(response.rating_score);
//       domainData.maxScales.push(maxScaleValue);
//       domainData.locations.add(location);
//       domainData.questions.add(response.questionnaire_questions.title);
//       domainData.responses.push(response);
//     });

//     // Calculate domain analytics
//     const domainAnalytics: DomainAnalytics[] = Array.from(
//       domainMap.entries()
//     ).map(([domain, data]) => {
//       const avgScore =
//         data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
//       const avgMaxScale =
//         data.maxScales.reduce((sum, scale) => sum + scale, 0) /
//         data.maxScales.length;
//       const avgScorePercentage = Math.round((avgScore / avgMaxScale) * 100);

//       return {
//         domain,
//         avgScore: Math.round(avgScore * 100) / 100,
//         avgScorePercentage,
//         locationCount: data.locations.size,
//         questionCount: data.questions.size,
//         responseCount: data.scores.length,
//         actionCount: 0, // TODO: Calculate from actions data
//         trend: 0, // TODO: Calculate trend
//         status: "down" as const, // TODO: Calculate status based on trend
//       };
//     });

//     // Sort by worst performing (lowest average score)
//     return domainAnalytics.sort(
//       (a, b) => a.avgScorePercentage - b.avgScorePercentage
//     );
//   }

//   /**
//    * Load asset risk analytics with percentile-based classification
//    */
//   async loadAssetRiskAnalytics(
//     filters: DashboardFilters
//   ): Promise<AssetRiskAnalytics[]> {
//     const { assessmentIds } = filters;

//     if (!assessmentIds || assessmentIds.length === 0) {
//       return [];
//     }

//     const { data: responses, error } = await this.supabase
//       .from("interview_responses")
//       .select(
//         `
//         id,
//         rating_score,
//         questionnaire_questions!inner(
//           questionnaire_question_rating_scales!inner(
//             questionnaire_rating_scales!inner(value)
//           )
//         ),
//         interviews!inner(
//           assessments!inner(
//             created_at,
//             business_units!inner(name),
//             regions!inner(name),
//             sites!inner(name)
//           )
//         )
//       `
//       )
//       .in("interviews.assessment_id", assessmentIds);

//     if (error) throw new Error(error.message);

//     // Calculate percentiles for risk classification
//     const allScores = (responses || []).map((r: any) => {
//       const maxScaleValue = this.getMaxScaleValue(
//         r.questionnaire_questions.questionnaire_question_rating_scales || []
//       );
//       return (r.rating_score / maxScaleValue) * 100;
//     });

//     const percentiles = this.calculatePercentiles(allScores);

//     // Group by location
//     const locationMap = new Map<string, LocationMetrics>();

//     (responses || []).forEach((response: any) => {
//       const location = this.buildOrgPath(
//         response.interviews.assessments.business_units.name,
//         response.interviews.assessments.regions.name,
//         response.interviews.assessments.sites.name
//       );

//       const maxScaleValue = this.getMaxScaleValue(
//         response.questionnaire_questions.questionnaire_question_rating_scales ||
//           []
//       );
//       const percentage = (response.rating_score / maxScaleValue) * 100;

//       if (!locationMap.has(location)) {
//         locationMap.set(location, {
//           scores: [],
//           percentages: [],
//           questionCount: 0,
//           lastAssessed: response.interviews.assessments.created_at,
//         });
//       }

//       const locationData = locationMap.get(location)!;
//       locationData.scores.push(response.rating_score);
//       locationData.percentages.push(percentage);
//       locationData.questionCount++;

//       // Update last assessed if this is more recent
//       if (
//         new Date(response.interviews.assessments.created_at) >
//         new Date(locationData.lastAssessed)
//       ) {
//         locationData.lastAssessed = response.interviews.assessments.created_at;
//       }
//     });

//     // Calculate asset risk analytics
//     const assetRiskAnalytics: AssetRiskAnalytics[] = Array.from(
//       locationMap.entries()
//     ).map(([location, data]) => {
//       const avgScore =
//         data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length;
//       const avgPercentage =
//         data.percentages.reduce((sum, pct) => sum + pct, 0) /
//         data.percentages.length;

//       // Classify risk based on percentiles
//       const riskLevel = this.calculateRiskLevel({
//         actionCount: 0, // Not action-based for asset risk
//         scorePercentage: avgPercentage,
//         percentiles,
//       });

//       // Check if overdue (more than 6 months)
//       const daysSinceAssessed = Math.floor(
//         (new Date().getTime() - new Date(data.lastAssessed).getTime()) /
//           (1000 * 60 * 60 * 24)
//       );
//       const overdue = daysSinceAssessed > 180;

//       return {
//         location,
//         avgScore: Math.round(avgScore * 100) / 100,
//         avgScorePercentage: Math.round(avgPercentage),
//         riskLevel,
//         questionCount: data.questionCount,
//         responseCount: data.scores.length,
//         actionCount: 0, // TODO: Calculate from actions data
//         lastAssessed: data.lastAssessed,
//         overdue,
//       };
//     });

//     // Sort by risk level (critical first, then high, etc.)
//     const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
//     return assetRiskAnalytics.sort(
//       (a, b) =>
//         riskOrder[a.riskLevel] - riskOrder[b.riskLevel] ||
//         a.avgScorePercentage - b.avgScorePercentage
//     );
//   }

//   /**
//    * Load generated actions analytics with trend calculations
//    */
//   private async loadGeneratedActionsAnalytics(
//     assessmentIds: number[]
//   ): Promise<DashboardMetrics["generatedActions"]> {
//     if (assessmentIds.length === 0) {
//       return {
//         total: 0,
//         fromLastWeek: 0,
//         highPriority: 0,
//         fromInterviews: 0,
//         trend: 0,
//         status: "up",
//       };
//     }

//     const { data: actions, error } = await this.supabase
//       .from("interview_response_actions")
//       .select(
//         `
//         id,
//         title,
//         description,
//         created_at,
//         interview_responses!inner(
//           rating_score,
//           questionnaire_questions!inner(
//             questionnaire_question_rating_scales!inner(
//               questionnaire_rating_scales!inner(value)
//             )
//           ),
//           interviews!inner(
//             assessments!inner(id)
//           )
//         )
//       `
//       )
//       .in("interview_responses.interviews.assessment_id", assessmentIds);

//     if (error) throw new Error(error.message);

//     const total = actions?.length || 0;

//     // Calculate actions from last week
//     const oneWeekAgo = new Date();
//     oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
//     const fromLastWeek =
//       actions?.filter((action) => new Date(action.created_at) >= oneWeekAgo)
//         .length || 0;

//     // Calculate high priority actions (from responses with scores in bottom 25%)
//     const allScores = (actions || []).map((action: any) => {
//       const maxScaleValue = this.getMaxScaleValue(
//         action.interview_responses.questionnaire_questions
//           .questionnaire_question_rating_scales || []
//       );
//       return (action.interview_responses.rating_score / maxScaleValue) * 100;
//     });

//     const percentiles = this.calculatePercentiles(allScores);
//     const highPriority = (actions || []).filter((action: any) => {
//       const maxScaleValue = this.getMaxScaleValue(
//         action.interview_responses.questionnaire_questions
//           .questionnaire_question_rating_scales || []
//       );
//       const percentage =
//         (action.interview_responses.rating_score / maxScaleValue) * 100;
//       return percentage <= percentiles.p25;
//     }).length;

//     // All actions are from interviews by definition
//     const fromInterviews = total;

//     // Calculate trend (compare this week vs last week)
//     const twoWeeksAgo = new Date();
//     twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
//     const fromPreviousWeek =
//       actions?.filter((action) => {
//         const actionDate = new Date(action.created_at);
//         return actionDate >= twoWeeksAgo && actionDate < oneWeekAgo;
//       }).length || 1; // Avoid division by zero

//     const trend =
//       fromPreviousWeek > 0
//         ? Math.round(
//             ((fromLastWeek - fromPreviousWeek) / fromPreviousWeek) * 100
//           )
//         : 0;

//     return {
//       total,
//       fromLastWeek,
//       highPriority,
//       fromInterviews,
//       trend,
//       status: trend >= 0 ? "up" : "down",
//     };
//   }

//   /**
//    * Update metrics from analytics data (business logic for combining analytics)
//    */
//   updateMetricsFromAnalytics(
//     currentMetrics: DashboardMetrics,
//     domainAnalytics: DomainAnalytics[],
//     assetRiskAnalytics: AssetRiskAnalytics[]
//   ): DashboardMetrics {
//     // Update worst performing area
//     const worstDomain = domainAnalytics[0]; // Already sorted by worst performing
//     const worstPerformingArea = worstDomain
//       ? {
//           name: worstDomain.domain,
//           trend: worstDomain.trend,
//           status: worstDomain.status,
//           avgScore: worstDomain.avgScorePercentage,
//           affectedLocations: worstDomain.locationCount,
//         }
//       : currentMetrics.worstPerformingArea;

//     // Update critical assets
//     const riskBreakdown =
//       assetRiskAnalytics.length > 0
//         ? assetRiskAnalytics.reduce(
//             (acc, asset) => {
//               acc[asset.riskLevel]++;
//               return acc;
//             },
//             { critical: 0, high: 0, medium: 0, low: 0 }
//           )
//         : { critical: 0, high: 0, medium: 0, low: 0 };

//     const criticalAndHighRiskCount =
//       riskBreakdown.critical + riskBreakdown.high;
//     const overdueCount = assetRiskAnalytics.filter(
//       (asset) => asset.overdue
//     ).length;
//     const worstLocation =
//       assetRiskAnalytics[0]?.location.split(" > ").pop() ||
//       currentMetrics.criticalAssets.site;
//     const avgCompliance =
//       assetRiskAnalytics.length > 0
//         ? Math.round(
//             assetRiskAnalytics.reduce(
//               (sum, asset) => sum + asset.avgScorePercentage,
//               0
//             ) / assetRiskAnalytics.length
//           )
//         : currentMetrics.criticalAssets.avgCompliance;

//     const criticalAssets = {
//       count: criticalAndHighRiskCount,
//       overdue: overdueCount,
//       avgCompliance,
//       site: worstLocation,
//       riskBreakdown,
//       worstLocation:
//         assetRiskAnalytics[0]?.location || currentMetrics.criticalAssets.site,
//     };

//     return {
//       ...currentMetrics,
//       worstPerformingArea,
//       criticalAssets,
//     };
//   }
// }

// export const dashboardService = new DashboardService();
