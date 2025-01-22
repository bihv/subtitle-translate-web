export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Only POST requests allowed' }), { status: 405 });
    }

    try {
        const { inputContent, apiKey, customPrompt } = await req.json();
        let prompt = '';
        const basePrompt = "Translate the subtitles in this file into Vietnamese with the following requirements: \n" +
                    "Maintain the original format, including sequence numbers, timestamps, and the number of lines.\n" +
                    "Preserve the capitalization exactly as in the original text for languages that distinguish between uppercase and lowercase letters (e.g., English).\n" +
                    "For languages that do not distinguish between uppercase and lowercase letters (e.g., Chinese):\n" +
                    "Detect proper nouns (e.g., names of people, places, or organizations) and convert them to standard pinyin. Ensure the first letter of each word in pinyin is capitalized.\n" +
                    "Use standard pinyin rules: No diacritics (e.g., \"Song Chengli\" instead of \"sòng chénglǐ\").\n" +
                    "Retain other parts of the sentence in lowercase and capitalize only the first letter of the sentence.\n" +
                    "Keep the original Chinese characters when applicable, without any modification." +
                    "Do not merge content from different timestamps into a single translation block.\n" +
                    "Retain all punctuation, special characters, and line breaks from the original content to preserve the original flow and structure of the subtitles.\n" +
                    "Return only the translated content in the specified format, without any additional explanations, introductions, or questions.\n";
        if (!customPrompt) {
            prompt = basePrompt +
                "Ensure translations are accurate and match the context, culture, and situations in the movie. Use natural and conversational Vietnamese that reflects the tone and emotion of the original dialogue.\n" +
                "Avoid literal translations that sound unnatural in Vietnamese. Adjust word choices and sentence structures to make the translation feel fluent and emotionally aligned with the movie's tone.\n";
        } else {
            prompt = basePrompt + customPrompt;
        }

        prompt += inputContent;

        if (!inputContent) {
            return new Response(JSON.stringify({ error: 'Input content is required' }), { status: 400 });
        }

        const translatedPart = await translateText(prompt, apiKey);
        return new Response(JSON.stringify({ translatedContent: translatedPart }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500 });
    }
}

async function translateText(text, apiKey) {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [
                    {
                        role: 'user',
                        parts: [{ text }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 50,
                    topP: 0.9,
                    maxOutputTokens: 8192,
                    responseMimeType: 'text/plain'
                }
            })
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const candidates = data.candidates;
    if (candidates && candidates.length > 0) {
        return candidates[0].content.parts[0].text;
    }
    throw new Error('Translation failed');
}
