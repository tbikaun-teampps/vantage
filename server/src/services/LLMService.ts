import Anthropic from "@anthropic-ai/sdk";

// TypeScript interfaces for LLM interactions
export interface LLMGenerationOptions {
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export interface LLMRecommendationResponse {
  title: string;
  content: string;
  context: string;
  priority: "low" | "medium" | "high";
}

/**
 * Generic LLM Service for AI-powered features using Anthropic's Claude.
 * Provides type-safe methods for generating structured responses from the LLM.
 */
export class LLMService {
  private anthropic: Anthropic;
  private defaultModel = "claude-3-5-haiku-latest";

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Generates a structured JSON response from the LLM.
   * Validates that the response matches the expected type structure.
   *
   * @param prompt - The prompt to send to the LLM
   * @param options - Optional configuration for the LLM call
   * @returns Parsed and validated JSON response of type T
   * @throws Error if the LLM response is invalid or cannot be parsed
   */
  async generateStructuredResponse<T>(
    prompt: string,
    options?: LLMGenerationOptions
  ): Promise<T> {
    const model = options?.model || this.defaultModel;
    const max_tokens = options?.max_tokens || 4096;
    const temperature = options?.temperature;

    try {
      const message = await this.anthropic.messages.create({
        model,
        max_tokens,
        temperature,
        messages: [{ role: "user", content: prompt }],
      });

      // Extract text content from the response
      const textContent = message.content.find(
        (block) => block.type === "text"
      );

      if (!textContent || textContent.type !== "text") {
        throw new Error("No text content in LLM response");
      }

      // Parse JSON from the response
      const responseText = textContent.text.trim();

      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;

      const parsedResponse = JSON.parse(jsonText) as T;

      return parsedResponse;
    } catch (error) {
      if (error instanceof Anthropic.APIError) {
        throw new Error(
          `Anthropic API error (${error.status}): ${error.message}`
        );
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse LLM response as JSON: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Validates that a recommendation response has all required fields.
   * @param response - The object to validate
   * @returns true if valid, false otherwise
   */
  validateRecommendationResponse(
    response: unknown
  ): response is LLMRecommendationResponse {
    if (typeof response !== "object" || response === null) {
      return false;
    }

    const r = response as Record<string, unknown>;

    return (
      typeof r.title === "string" &&
      typeof r.content === "string" &&
      typeof r.context === "string" &&
      (r.priority === "low" || r.priority === "medium" || r.priority === "high")
    );
  }

  /**
   * Generates recommendations based on a given prompt.
   * Validates the response structure before returning.
   *
   * @param prompt - The prompt describing the question and context
   * @param options - Optional LLM configuration
   * @returns Array of validated recommendation responses
   * @throws Error if response is invalid or not an array
   */
  async generateRecommendation(
    prompt: string,
    options?: LLMGenerationOptions
  ): Promise<LLMRecommendationResponse[]> {
    const response = await this.generateStructuredResponse<LLMRecommendationResponse[]>(
      prompt,
      options
    );

    // Validate that response is an array
    if (!Array.isArray(response)) {
      console.log("Invalid response received (not an array):", response);
      throw new Error(
        "LLM response must be an array of recommendation objects."
      );
    }

    // Validate each item in the array
    for (let i = 0; i < response.length; i++) {
      if (!this.validateRecommendationResponse(response[i])) {
        console.log(`Invalid recommendation at index ${i}:`, response[i]);
        throw new Error(
          `Invalid recommendation at index ${i}. Missing required fields: title, content, context, or priority.`
        );
      }
    }

    return response;
  }
}
