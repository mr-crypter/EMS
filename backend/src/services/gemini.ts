import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function summarizeAndSuggest(description: string): Promise<{ summary: string; suggestions: string }>{
	const prompt = `You are a university event reviewer assistant. Given an event proposal description, first write a concise 3-4 sentence summary, then list 3-5 concrete improvement suggestions (budget realism, risk, logistics, sponsors). Format:
Summary:\n...
Suggestions:\n- ...\n- ...\n- ...\n\nDescription:\n${description}`;
	const result = await model.generateContent(prompt);
	const text = result.response.text();
	const [summaryPart, suggestionsPart] = text.split('Suggestions:');
	return {
		summary: summaryPart?.replace('Summary:', '').trim() || text.trim(),
		suggestions: suggestionsPart ? suggestionsPart.trim() : ''
	};
}
