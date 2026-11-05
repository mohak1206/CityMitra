// Gemma4B AI Service for issue analysis

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';
const MODEL_NAME = 'gemma4:e4b';

/**
 * Analyze image using Gemma4B model
 * @param {string} imageBase64 - Base64 encoded image
 * @returns {Promise<Object>} Analysis result
 */
export const analyzeImageWithGemma = async (imageBase64) => {
  try {
    // Convert base64 to the format Ollama expects
    const base64Data = imageBase64.split(',')[1] || imageBase64;
    
    const prompt = `You are an AI assistant for analyzing infrastructure issues in cities. 
Look at this image and identify the type of issue from these categories:
- pothole (road damage)
- street-light (broken or non-functional street light)
- graffiti (vandalism on walls/public property)
- broken-sign (damaged traffic signs)
- drainage (blocked or damaged drainage systems)
- sidewalk (damaged or uneven walkways)

Respond ONLY with a JSON object in this exact format:
{
  "issueType": "category_name",
  "description": "Brief description of the detected issue",
  "severity": "low|medium|high"
}

Example:
{"issueType": "pothole", "description": "Large pothole in the middle of the road", "severity": "high"}`;

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        prompt: prompt,
        images: [base64Data],
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for consistent results
          top_p: 0.9,
          max_tokens: 200
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.response || '';
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in AI response');
    }

    const result = JSON.parse(jsonMatch[0]);
    
    // Validate and normalize the result
    const validTypes = ['pothole', 'street-light', 'graffiti', 'broken-sign', 'drainage', 'sidewalk'];
    const validSeverities = ['low', 'medium', 'high'];
    
    return {
      issueType: validTypes.includes(result.issueType) ? result.issueType : 'other',
      description: result.description || 'Infrastructure issue detected',
      severity: validSeverities.includes(result.severity) ? result.severity : 'medium',
      estimatedRepairTime: getEstimatedRepairTime(result.severity || 'medium'),
      confidence: 0.85 // Mock confidence since Gemma4B doesn't provide it
    };

  } catch (error) {
    console.error('Gemma4B analysis error:', error);
    
    // Fallback to mock analysis if AI fails
    return {
      issueType: 'other',
      description: 'Could not analyze image with AI. Please describe the issue manually.',
      severity: 'medium',
      estimatedRepairTime: '2-3 days',
      confidence: 0.3 // Low confidence for fallback
    };
  }
};

/**
 * Get estimated repair time based on severity
 */
const getEstimatedRepairTime = (severity) => {
  switch (severity) {
    case 'high': return '1-2 days';
    case 'medium': return '3-5 days';
    case 'low': return '5-7 days';
    default: return '2-3 days';
  }
};

/**
 * Check if Ollama service is available
 */
export const checkOllamaStatus = async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    const models = data.models || [];
    
    return models.some(model => model.name.includes('gemma4'));
  } catch (error) {
    console.error('Ollama status check failed:', error);
    return false;
  }
};
