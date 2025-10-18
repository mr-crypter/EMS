import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export async function summarizeAndSuggest(description: string): Promise<{ summary: string; suggestions: string }>{
	const prompt = `You are a university event reviewer assistant. Given an event proposal description, first write a concise 3-4 sentence summary, then output a markdown section titled "Suggestions" with 3-5 bolded bullet points covering logistics, budget realism, risks, and sponsorship. Use this exact format:

Summary:
<3-4 sentence summary>

Suggestions:
-   **<Title>:** <one sentence with concrete, actionable advice>
-   **<Title>:** <one sentence with concrete, actionable advice>
-   **<Title>:** <one sentence with concrete, actionable advice>
-   **<Title>:** <one sentence with concrete, actionable advice>

Description:
${description}`;
	const result = await model.generateContent(prompt);
	const text = result.response.text();
	const [summaryPart, suggestionsPart] = text.split('Suggestions:');
	return {
		summary: summaryPart?.replace('Summary:', '').trim() || text.trim(),
		suggestions: suggestionsPart ? suggestionsPart.trim() : ''
	};
}
