import { 
  WorkflowGenerationResult, 
  Workflow, 
  Step, 
  Trigger, 
  AIGenerationMetadata,
  ReasoningStep,
  MultimodalInput,
  SafetyRating
} from '@/context/WorkflowsContext';

// Gemini API Configuration
export interface GeminiConfig {
  apiKey: string;
  model: "gemini-1.5-flash" | "gemini-1.5-pro";
  maxTokens: number;
  temperature: number;
  timeout: number;
}

// Default configuration optimized for Gemini 1.5 Flash
export const DEFAULT_GEMINI_CONFIG: GeminiConfig = {
  apiKey: '', // Will be set from environment or user input
  model: "gemini-1.5-flash",
  maxTokens: 2000,
  temperature: 0.1, // Low for consistency
  timeout: 45000
};

// Available security components for AI to use
const AVAILABLE_COMPONENTS = [
  { id: "camera", label: "CCTV Motion Detection", description: "Detects motion from security cameras" },
  { id: "ai-vision", label: "AI Vision Analysis", description: "Object/weapon detection with zone mapping" },
  { id: "access-alert", label: "Access Control Alert", description: "Unauthorized, forced, or door held open alerts" },
  { id: "badge-reader", label: "Badge Reader Event", description: "Authorized entry, failed attempt, or RFID events" },
  { id: "visitor-mgmt", label: "Visitor Management Event", description: "Unscheduled visitor or VIP arrival notifications" },
  { id: "emergency-alert", label: "Emergency Alert", description: "Fire, medical emergency, or panic button events" },
  { id: "alarm-system", label: "Alarm System", description: "Intrusion, fire, or environmental alarms" },
  { id: "facility-broadcast", label: "Facility Broadcast", description: "PA system, intercom, or SMS notifications" },
  { id: "lockdown-cmd", label: "Lockdown Command", description: "Lock doors/zones, flash lights, display signage" },
  { id: "compliance-audit", label: "Compliance Audit Event", description: "Log all steps for after-action review" }
];

// System prompt optimized for Gemini 1.5 Flash
const SYSTEM_PROMPT = `You are an expert physical security consultant with deep knowledge of:

TECHNICAL EXPERTISE:
- Industry standards (NIST Cybersecurity Framework, Standard Response Protocol)
- Device capabilities and integration protocols (ONVIF, OSDP, MQTT, gRPC)
- Compliance requirements (FERPA/education, HIPAA/healthcare, SOX/financial)
- Emergency response protocols and escalation procedures
- Physical security best practices and risk assessment

REASONING APPROACH:
1. Analyze the user's request for implicit requirements
2. Consider contextual factors (time, location, occupancy, threat level)
3. Map natural language to specific devices and actions
4. Validate compliance with relevant regulations
5. Provide step-by-step reasoning for all decisions
6. Suggest alternatives and explain tradeoffs

OUTPUT REQUIREMENTS:
- Always respond with valid JSON matching the specified schema
- Include detailed confidence scores and reasoning
- Provide alternative approaches when applicable
- Explain safety and compliance considerations
- Use chain-of-thought reasoning for complex scenarios

SAFETY CONSIDERATIONS:
- Prioritize life safety in all recommendations
- Ensure compliance with applicable regulations
- Consider fail-safe modes for critical systems
- Account for human factors and usability

Available security components: ${AVAILABLE_COMPONENTS.map(c => `${c.label} (${c.description})`).join(', ')}`;

export class GeminiWorkflowService {
  private config: GeminiConfig;

  constructor(config: Partial<GeminiConfig> = {}) {
    this.config = { ...DEFAULT_GEMINI_CONFIG, ...config };
  }

  async generateWorkflow(
    userInput: string,
    context: {
      sector?: string;
      buildingInfo?: string;
      currentTime?: string;
      complianceRules?: string[];
    } = {}
  ): Promise<WorkflowGenerationResult> {
    try {
      if (!this.config.apiKey) {
        throw new Error('Gemini API key is required. Please set VITE_GOOGLE_AI_API_KEY in your environment variables.');
      }

      const startTime = Date.now();
      
      // Build the prompt
      const prompt = this.buildPrompt(userInput, context);
      
      // Call Gemini API
      const response = await this.callGeminiAPI(prompt);
      
      const processingTime = Date.now() - startTime;
      
      // Parse and validate the response
      const result = this.parseGeminiResponse(response, userInput, processingTime);
      
      return result;
      
    } catch (error) {
      console.error('Gemini workflow generation error:', error);
      return {
        success: false,
        confidence: 0,
        warnings: [],
        suggestions: [],
        tokensUsed: 0,
        processingTime: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private buildPrompt(userInput: string, context: any): string {
    return `# SECURITY WORKFLOW GENERATION REQUEST

## User Request
"${userInput}"

## Available Context
**Building Information:** ${context.buildingInfo || 'General facility'}
**Sector/Industry:** ${context.sector || 'General'}
**Current Time:** ${context.currentTime || new Date().toISOString()}
**Compliance Requirements:** ${context.complianceRules?.join(', ') || 'Standard security protocols'}

## Available Security Components
${AVAILABLE_COMPONENTS.map(c => `- ${c.label}: ${c.description}`).join('\n')}

## Generation Instructions
Create a comprehensive security workflow that addresses the user's request. Follow this reasoning process:

1. **REQUIREMENTS ANALYSIS**
   - What is the primary security objective?
   - What are the implicit requirements not explicitly stated?
   - What compliance considerations apply?

2. **THREAT ASSESSMENT** 
   - What threats does this workflow address?
   - What is the expected threat level and frequency?
   - What are the potential failure modes?

3. **DEVICE MAPPING**
   - Which available devices best address these requirements?
   - What are the integration considerations?
   - Are there device capability gaps?

4. **WORKFLOW DESIGN**
   - What is the optimal sequence of steps?
   - What parallel actions should occur?
   - What escalation paths are needed?

5. **COMPLIANCE VALIDATION**
   - Does this workflow meet regulatory requirements?
   - Are there any compliance gaps or concerns?
   - What documentation/logging is required?

6. **RISK MITIGATION**
   - What could go wrong with this workflow?
   - What backup procedures are needed?
   - How do we minimize false positives/negatives?

Generate a workflow with:
- Clear, specific triggers based on available devices
- Detailed steps with proper device mapping
- Appropriate escalation and notification procedures
- Compliance considerations and required logging
- Confidence scores for each component
- Alternative approaches and their tradeoffs

Respond with a JSON object in this exact format:
{
  "workflow": {
    "name": "Workflow Name",
    "description": "Brief description",
    "steps": [
      {
        "id": "step-1",
        "label": "Step Label",
        "action": "Specific action to take",
        "reasoning": "Why this step is needed",
        "parameters": {},
        "aiParsed": true
      }
    ],
    "triggers": [
      {
        "source": "device-id",
        "eventType": "event description",
        "naturalLanguageDescription": "Human readable trigger",
        "aiParsed": true,
        "confidence": 0.9,
        "contextualFactors": {
          "timeRelevance": "when relevant",
          "locationFactors": ["location considerations"],
          "threatLevel": "low|medium|high|critical",
          "expectedFrequency": "how often this occurs"
        }
      }
    ],
    "complianceTags": ["relevant compliance standards"]
  },
  "confidence": 0.85,
  "reasoning": [
    {
      "step": 1,
      "question": "What question is being answered?",
      "analysis": "Analysis of the situation",
      "conclusion": "What was decided",
      "confidence": 0.9
    }
  ],
  "warnings": ["any potential issues"],
  "suggestions": ["improvement recommendations"],
  "riskAssessment": "Overall risk analysis",
  "complianceAnalysis": "Compliance considerations",
  "alternativeApproaches": ["other viable options"]
}`;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent?key=${this.config.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: this.config.temperature,
            maxOutputTokens: this.config.maxTokens,
            candidateCount: 1
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_ONLY_HIGH' // Allow security-related content
            }
          ],
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
    }

    return await response.json();
  }

  private parseGeminiResponse(
    response: any, 
    originalPrompt: string, 
    processingTime: number
  ): WorkflowGenerationResult {
    try {
      const candidate = response.candidates?.[0];
      if (!candidate) {
        throw new Error('No response candidate from Gemini');
      }

      const content = candidate.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error('No text content in Gemini response');
      }

      // Extract JSON from response (handle markdown code blocks)
      let jsonStr = content;
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonStr);
      
      // Create AI metadata
      const aiMetadata: AIGenerationMetadata = {
        originalPrompt,
        llmModel: this.config.model,
        generatedAt: new Date(),
        tokenUsage: {
          prompt: response.usageMetadata?.promptTokenCount || 0,
          completion: response.usageMetadata?.candidatesTokenCount || 0,
          total: response.usageMetadata?.totalTokenCount || 0,
          contextWindowUsed: 0
        },
        processingTime,
        iterationCount: 1,
        geminiSpecificMetrics: {
          safetyRatings: candidate.safetyRatings || [],
          finishReason: candidate.finishReason || 'STOP',
          candidateCount: response.candidates?.length || 1
        }
      };

      // Build the workflow with AI metadata
      const workflow: Workflow = {
        id: `ai_wf_${Date.now()}`,
        name: parsed.workflow.name,
        description: parsed.workflow.description,
        steps: parsed.workflow.steps || [],
        triggers: parsed.workflow.triggers || [],
        source: 'ai_generated',
        complianceTags: parsed.workflow.complianceTags || [],
        aiMetadata,
        confidenceScore: parsed.confidence || 0.5,
        validationStatus: 'pending'
      };

      return {
        success: true,
        workflow,
        confidence: parsed.confidence || 0.5,
        warnings: parsed.warnings || [],
        suggestions: parsed.suggestions || [],
        tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        processingTime,
        geminiEnhancements: {
          reasoningChain: parsed.reasoning || [],
          contextualInsights: [],
          riskAssessment: parsed.riskAssessment || '',
          complianceAnalysis: parsed.complianceAnalysis || '',
          alternativeApproaches: parsed.alternativeApproaches || []
        }
      };

    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      throw new Error(`Failed to parse Gemini response: ${error instanceof Error ? error.message : 'Unknown parsing error'}`);
    }
  }

  // Update API key
  updateApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
  }

  // Check if service is configured
  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

// Singleton instance
export const geminiService = new GeminiWorkflowService({
  apiKey: import.meta.env.VITE_GOOGLE_AI_API_KEY || ''
});
