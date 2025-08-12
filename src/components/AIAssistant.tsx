import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Brain,
  Zap,
  Eye,
  Shield,
  Clock,
  Target,
  Lightbulb,
  Settings,
  Key,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { geminiService } from '@/services/geminiService';
import { useWorkflows, type WorkflowGenerationResult, type Workflow } from '@/context/WorkflowsContext';

interface AIAssistantProps {
  onWorkflowGenerated: (workflow: Workflow) => void;
}

const EXAMPLE_PROMPTS = [
  {
    text: "If someone with a weapon is detected at the main entrance during school hours, immediately lock all classroom doors, sound the alarm, and notify police",
    category: "Critical Emergency Response",
    sector: "Education",
    complexity: "high"
  },
  {
    text: "When a fire alarm goes off in the hospital maternity ward, unlock emergency exits, activate evacuation lighting, and announce procedures while ensuring infant security",
    category: "Fire Safety with Special Considerations", 
    sector: "Healthcare",
    complexity: "high"
  },
  {
    text: "Create a visitor management workflow for our corporate office that includes badge creation, escort assignment, and access restrictions to sensitive areas",
    category: "Access Control Management",
    sector: "Commercial",
    complexity: "medium"
  },
  {
    text: "If motion is detected in the server room after business hours, verify with cameras, challenge via intercom, and escalate to security if unauthorized",
    category: "After-Hours Security",
    sector: "Commercial",
    complexity: "medium"
  }
];

export default function AIAssistant({ onWorkflowGenerated }: AIAssistantProps) {
  const { addWorkflow } = useWorkflows();
  const [userInput, setUserInput] = useState('');
  const [workflowName, setWorkflowName] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [buildingInfo, setBuildingInfo] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<WorkflowGenerationResult | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isConfigured = geminiService.isConfigured() || apiKey;

  const handleApiKeySubmit = () => {
    if (apiKey.trim()) {
      geminiService.updateApiKey(apiKey.trim());
      setShowApiKeyInput(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      // For demo purposes, we'll just show the file name
      // In production, you'd extract text from PDF/DOC files
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setUserInput(content);
        };
        reader.readAsText(file);
      }
    }
  };

  const resetForm = () => {
    setUserInput('');
    setWorkflowName('');
    setSelectedSector('');
    setBuildingInfo('');
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async () => {
    if (!userInput.trim() && !uploadedFile) {
      alert('Please provide either text input or upload a file.');
      return;
    }

    if (!isConfigured) {
      alert('Please configure your Google AI API key first.');
      return;
    }

    setIsGenerating(true);
    setResult(null);
    setProgress(5); // Start with small initial progress
    setCurrentStage(0);

    // Start progress animation immediately
    const progressStages = [
      { stage: 0, progress: 25, delay: 200 },   // Analyzing requirements
      { stage: 1, progress: 50, delay: 800 },   // Mapping devices
      { stage: 2, progress: 75, delay: 1400 },  // Validating compliance
      { stage: 3, progress: 90, delay: 2000 },  // Optimizing workflow
    ];

    // Store timeout IDs for cleanup
    const timeoutIds: NodeJS.Timeout[] = [];

    progressStages.forEach(({ stage, progress: targetProgress, delay }) => {
      const timeoutId = setTimeout(() => {
        setCurrentStage(stage);
        setProgress(targetProgress);
      }, delay);
      timeoutIds.push(timeoutId);
    });

    try {
      // Configure the service with the API key if provided
      if (apiKey) {
        geminiService.updateApiKey(apiKey);
      }

      // Prepare context
      const context = {
        workflowName: workflowName || undefined,
        sector: selectedSector || undefined,
        buildingInfo: buildingInfo || undefined,
        uploadedFile: uploadedFile ? {
          name: uploadedFile.name,
          type: uploadedFile.type,
          size: uploadedFile.size
        } : undefined
      };

      // Generate workflow
      const result = await geminiService.generateWorkflow(userInput, context);
      
      // Complete progress on success
      setProgress(100);
      setCurrentStage(4);
      
      setResult(result);

      // Reset form after successful generation
      if (result.success) {
        resetForm();
      }

    } catch (error) {
      console.error('Generation failed:', error);
      // Complete progress on error
      setProgress(100);
      setCurrentStage(4);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        confidence: 0,
        warnings: [],
        suggestions: [],
        tokensUsed: 0,
        processingTime: 0
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptWorkflow = () => {
    if (result?.workflow) {
      const workflow = addWorkflow(
        result.workflow.name,
        result.workflow.steps,
        result.workflow.description,
        result.workflow.triggers,
        result.workflow.location,
        result.workflow.schedule,
        result.workflow.complianceTags,
        result.workflow.aiMetadata,
        result.workflow.confidenceScore
      );
      
      if (workflow) {
        onWorkflowGenerated(workflow);
        setResult(null);
        setUserInput('');
        setUploadedFile(null);
      }
    }
  };

  const getComplianceRules = (sector: string): string[] => {
    switch (sector) {
      case 'Education': return ['FERPA', 'School Safety'];
      case 'Healthcare': return ['HIPAA', 'Patient Safety'];
      case 'Commercial': return ['Building Security', 'OSHA'];
      case 'Retail': return ['PCI DSS', 'Customer Safety'];
      default: return [];
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplexityBadge = (complexity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[complexity as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold">AI Workflow Assistant</h2>
          <Badge variant="secondary" className="text-xs">PRO</Badge>
        </div>
        <p className="text-muted-foreground">
          Generate comprehensive security workflows from natural language descriptions
        </p>
      </div>

      {/* API Key Configuration */}
      {!isConfigured && (
        <Alert>
          <Key className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p>To use the AI Assistant, you need a Google AI API key.</p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure API Key
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}
                >
                  Get Free API Key
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {showApiKeyInput && (
        <Card className="p-4">
          <div className="space-y-3">
            <Label htmlFor="api-key">Google AI API Key</Label>
            <div className="flex gap-2">
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Google AI API key..."
              />
              <Button onClick={handleApiKeySubmit} disabled={!apiKey.trim()}>
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers. Get a free key at{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                Google AI Studio
              </a>
            </p>
          </div>
        </Card>
      )}

      {/* Example Prompts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Example Prompts</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2"
          >
            {showExamples ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Examples
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Examples
              </>
            )}
          </Button>
        </div>
        
        {showExamples && (
          <div className="grid gap-3">
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setUserInput(prompt.text)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{prompt.category}</span>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{prompt.sector}</Badge>
                    <Badge className={`text-xs ${getComplexityBadge(prompt.complexity)}`}>
                      {prompt.complexity}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{prompt.text}</p>
              </div>
            ))}
          </div>
        )}
        
        {!showExamples && (
          <p className="text-sm text-muted-foreground">
            Click "Show Examples" to see pre-built prompts for different security scenarios across Education, Healthcare, and Commercial sectors.
          </p>
        )}
      </Card>

      {/* Input Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="workflow-name">Workflow Name</Label>
            <Input
              id="workflow-name"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              placeholder="e.g., Active Shooter Response, Fire Emergency Protocol, Visitor Management..."
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="user-input">Describe your security workflow requirements</Label>
            <Textarea
              id="user-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Example: If someone with a weapon is detected at the main entrance during school hours, immediately lock all classroom doors, sound the alarm, and notify police..."
              className="min-h-24 mt-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sector">Sector (Optional)</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="building-info">Building Context (Optional)</Label>
              <Input
                id="building-info"
                value={buildingInfo}
                onChange={(e) => setBuildingInfo(e.target.value)}
                placeholder="e.g., 3-story office building, main entrance..."
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Policy Document
              </Button>
            </div>
            <Button
              onClick={handleGenerate}
              disabled={!userInput.trim() || isGenerating || !isConfigured}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </div>

          {uploadedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>Uploaded: {uploadedFile.name}</span>
            </div>
          )}
        </div>
      </Card>



      {/* Generation Progress */}
      {isGenerating && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="font-medium">Generating workflow...</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className={`flex items-center gap-2 transition-opacity duration-300 ${
                currentStage >= 0 ? 'opacity-100' : 'opacity-50'
              }`}>
                <Eye className={`w-4 h-4 ${
                  currentStage >= 0 ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <span className={currentStage >= 0 ? 'text-white' : 'text-gray-500'}>
                  Analyzing requirements
                </span>
                {currentStage > 0 && <CheckCircle className="w-3 h-3 text-green-500 ml-1" />}
              </div>
              <div className={`flex items-center gap-2 transition-opacity duration-300 ${
                currentStage >= 1 ? 'opacity-100' : 'opacity-50'
              }`}>
                <Target className={`w-4 h-4 ${
                  currentStage >= 1 ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className={currentStage >= 1 ? 'text-white' : 'text-gray-500'}>
                  Mapping devices
                </span>
                {currentStage > 1 && <CheckCircle className="w-3 h-3 text-green-500 ml-1" />}
              </div>
              <div className={`flex items-center gap-2 transition-opacity duration-300 ${
                currentStage >= 2 ? 'opacity-100' : 'opacity-50'
              }`}>
                <Shield className={`w-4 h-4 ${
                  currentStage >= 2 ? 'text-purple-500' : 'text-gray-400'
                }`} />
                <span className={currentStage >= 2 ? 'text-white' : 'text-gray-500'}>
                  Validating compliance
                </span>
                {currentStage > 2 && <CheckCircle className="w-3 h-3 text-green-500 ml-1" />}
              </div>
              <div className={`flex items-center gap-2 transition-opacity duration-300 ${
                currentStage >= 3 ? 'opacity-100' : 'opacity-50'
              }`}>
                <Zap className={`w-4 h-4 ${
                  currentStage >= 3 ? 'text-yellow-500' : 'text-gray-400'
                }`} />
                <span className={currentStage >= 3 ? 'text-white' : 'text-gray-500'}>
                  Optimizing workflow
                </span>
                {currentStage > 3 && <CheckCircle className="w-3 h-3 text-green-500 ml-1" />}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className="p-6">
          <div className="space-y-4">
            {result.success ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <h3 className="font-semibold">Workflow Generated Successfully</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{result.processingTime}ms</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-4 h-4" />
                      <span>{result.tokensUsed} tokens</span>
                    </div>
                  </div>
                </div>

                {result.workflow && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{result.workflow.name}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{result.workflow.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm">Confidence:</span>
                        <span className={`font-medium ${getConfidenceColor(result.confidence)}`}>
                          {Math.round(result.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {result.workflow.steps.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Workflow Steps ({result.workflow.steps.length})</h5>
                        <div className="space-y-2">
                          {result.workflow.steps.map((step, index) => (
                            <div key={step.id} className="flex items-center gap-3 p-2 bg-muted/20 rounded">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <span className="font-medium text-sm">{step.label}</span>
                                {step.reasoning && (
                                  <p className="text-xs text-muted-foreground mt-1">{step.reasoning}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.workflow.complianceTags && result.workflow.complianceTags.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Compliance</h5>
                        <div className="flex flex-wrap gap-1">
                          {result.workflow.complianceTags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {result.warnings.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          Warnings
                        </h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {result.warnings.map((warning, index) => (
                            <li key={index}>• {warning}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.suggestions.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-blue-500" />
                          Suggestions
                        </h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {result.suggestions.map((suggestion, index) => (
                            <li key={index}>• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      <Button onClick={handleAcceptWorkflow} className="flex-1">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Accept & Add to Workflows
                      </Button>
                      <Button variant="outline" onClick={() => setResult(null)}>
                        Generate New
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <h3 className="font-semibold">Generation Failed</h3>
                </div>
                <p className="text-sm text-muted-foreground">{result.error}</p>
                <Button variant="outline" onClick={() => setResult(null)}>
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
