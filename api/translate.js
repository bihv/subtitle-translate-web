import dotenv from 'dotenv';
import axios from 'axios/dist/node/axios.cjs';

dotenv.config();
const axiosInstance = axios.create({
    timeout: 10000 
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Only POST requests allowed' });
        return;
    }

    try {
        const { inputContent, apiKey } = req.body;
        const promt = "Translate the subtitles in this file into Vietnamese with the following requirements:\n" +
        "Maintain the original format, including sequence numbers, timestamps, and the number of lines.\n" +
        "The translations must match the context, culture, and situations occurring in the movie.\n" +
        "Preserve the capitalization exactly as in the original text.\n" +
        "Do not merge content from different timestamps into a single translation block.\n" +
        "Return only the translated content in the specified format, without any additional explanations, introductions, or questions.\n" + inputContent;

        if (!inputContent) {
            res.status(400).json({ error: 'Input content is required' });
            return;
        }

        const translatedPart = await translateText(promt, apiKey);
        res.status(200).json({ translatedContent: translatedPart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
}


function splitSRTContent(srtContent, charLimit) {
    const lines = srtContent.split('\n');
    const parts = [];
    let currentPart = '';

    for (const line of lines) {
        if ((currentPart.length + line.length + 1 > charLimit) && line.trim() === '') {
            parts.push(currentPart.trim());
            currentPart = '';
        }
        currentPart += line + '\n';
    }
    if (currentPart) parts.push(currentPart.trim());
    return parts;
}

async function translateText(text, apiKey) {
    const response = await axiosInstance.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
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
        },
        {
            headers: { 'Content-Type': 'application/json' }
        }
    );

    const candidates = response.data.candidates;
    if (candidates && candidates.length > 0) {
        return candidates[0].content.parts[0].text;
    }
    throw new Error('Translation failed');
}
