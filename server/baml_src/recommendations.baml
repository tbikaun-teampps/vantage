// Defining the data model.
class Recommendation {
  title string
  content string
  context string
  priority "low" | "medium" | "high"
}

client<llm> AnthropicClient {
    provider "anthropic"
    options {
        model "claude-haiku-4-5-20251001"
    }
}

// Create a function to generate recommendations from an assessment question answers.
function ExtractRecommendations(questionWithAnswers: string) -> Recommendation[] {
    client AnthropicClient
    prompt #"
        You are an expert asset management and maintenance consultant. Based on the following question data from an assessment questionnaire, provide recommendations. You may return 1-5 recommendations depending on the complexity and importance of the findings.

        {{ questionWithAnswers }}
    
        {{ctx.output_format }}
    "#
}


// Test the function with a sample question and answers. Open the VSCode playground to run this.
test sample_recommendations {
    functions [ExtractRecommendations]
    args {
        questionWithAnswers #"
            # Question
            ## Overview
            - Section Title: Overall
            - Step Title: General
            - Question Title: Notifications
            - Question Text: Not provided
            - Question Context/Support: Placeholder context

            ## Question Parts
            - How many notifications were delayed this week?
            - Did all materials arrive on site on time?

            ## Question Rating Scales:
            1. Poor: Below acceptable standards
            2. Fair: Meets minimum requirements
            3. Good: Meets expectations
            4. Very Good: Exceeds expectations
            5. Excellent: Outstanding performance

            # Answers
            ## Overall Rating Scale
            - Score 3 selected by role(s): Planner (APAC > Australia > Boddington Mine > Fixed Plant > Planning)
            - Score 5 selected by role(s): Planner (APAC > Australia > Boddington Mine > Fixed Plant > Planning)

            ## Question Parts
            - How many notifications were delayed this week?
                - Answer: "50" by role(s): Planner (APAC > Australia > Boddington Mine > Fixed Plant > Planning)
                - Answer: "0" by role(s): Planner (APAC > Australia > Boddington Mine > Fixed Plant > Planning)
            - Did all materials arrive on site on time?
                - Answer: "true" by role(s): Planner (APAC > Australia > Boddington Mine > Fixed Plant > Planning), Planner (APAC > Australia > Boddington Mine > Fixed Plant > Planning)

            Based on this data, what recommendations would you provide?

            Please provide:
            1. Current State Analysis (strengths and gaps)
            2. Key Insights (including any data inconsistencies)
            3. Prioritized Recommendations (with implementation difficulty)
            4. Risk Assessment if no action is taken

            Note: Multiple responses from the same role indicate different individuals 
            with that title. Analyze consensus levels and note where perspectives diverge.

            When analyzing conflicting responses within the same role:
            - Identify if this indicates inconsistent practices or varying perspectives
            - Consider if this suggests a need for standardization or training
            - Note if certain locations/departments show more alignment than others

            Recommendations should be actionable and tailored to the organization's structure as indicated by the roles provided.
        "#
    }
}