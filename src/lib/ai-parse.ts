// AI Parse for food macros using OpenAI API

interface ParsedMacros {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  calories: number;
  notes: string;
}

type ParseResult = 
  | { success: true; data: ParsedMacros }
  | { success: false; error: 'network' | 'format' | 'empty'; message: string };

export async function parseFood(text: string, apiKey: string): Promise<ParseResult> {
  const prompt = `Analyze this food description and estimate the macronutrients. Return ONLY valid JSON with this exact structure:
{
  "protein_g": <number>,
  "carbs_g": <number>,
  "fat_g": <number>,
  "calories": <number>,
  "notes": "<brief explanation>"
}

Food description: "${text}"

Rules:
- All numbers should be non-negative integers
- If you cannot determine a value, use 0
- Be conservative in estimates
- Calculate calories as: protein*4 + carbs*4 + fat*9`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a nutrition analysis assistant. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: 'network',
        message: "Couldn't reach AI. Try again or enter macros manually.",
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        error: 'empty',
        message: "AI couldn't confidently extract macros. Please enter manually.",
      };
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }

    try {
      const parsed = JSON.parse(jsonStr.trim());
      
      // Validate and clamp values
      const protein_g = Math.max(0, Math.round(parsed.protein_g || 0));
      const carbs_g = Math.max(0, Math.round(parsed.carbs_g || 0));
      const fat_g = Math.max(0, Math.round(parsed.fat_g || 0));
      
      // Recompute calories from macros as per PRD
      const calories = protein_g * 4 + carbs_g * 4 + fat_g * 9;

      return {
        success: true,
        data: {
          protein_g,
          carbs_g,
          fat_g,
          calories,
          notes: parsed.notes || '',
        },
      };
    } catch {
      return {
        success: false,
        error: 'format',
        message: 'AI returned an unexpected format. Try again.',
      };
    }
  } catch {
    return {
      success: false,
      error: 'network',
      message: "Couldn't reach AI. Try again or enter macros manually.",
    };
  }
}
