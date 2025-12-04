import { GoogleGenAI } from "@google/genai";
import { Project, GroundingMetadata } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchGodrejProjects = async (
    location: { latitude: number; longitude: number }
): Promise<{ projects: Project[]; groundingMetadata: GroundingMetadata | null }> => {
    try {
        const model = "gemini-2.5-flash";
        const response = await ai.models.generateContent({
            model,
            contents: `
                Find Godrej Properties projects in Mumbai.
                For each project, provide the following details in a JSON array format:
                - projectName: string
                - address: string
                - rating: number (out of 5)
                - reviewCount: number
                - comments: An array of 3-5 recent comments, each with 'text' (string) and 'sentiment' ('Positive', 'Negative', or 'Neutral').
                - ratingBifurcation: an object with keys "5-star", "4-star", "3-star", "2-star", "1-star" and the corresponding number of reviews for each. If the breakdown is not available, return 0 for each star level.
            `,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: location,
                    },
                },
            },
        });

        const text = response.text.trim();
        let projects: Project[] = [];
        
        // The model may return conversational text or wrap the JSON in a markdown block.
        // This logic is designed to find and parse the JSON array regardless of the surrounding text.
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        
        if (jsonMatch && jsonMatch[1]) {
            projects = JSON.parse(jsonMatch[1]);
        } else {
            // If not in a markdown block, find the start and end of the array
            const startIndex = text.indexOf('[');
            const endIndex = text.lastIndexOf(']');
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                const jsonString = text.substring(startIndex, endIndex + 1);
                projects = JSON.parse(jsonString);
            } else {
                 throw new Error("Could not find a valid JSON array in the API response.");
            }
        }

        const groundingMetadata = response.candidates?.[0]?.groundingMetadata as GroundingMetadata | null ?? null;

        return { projects, groundingMetadata };
    } catch (error) {
        console.error("Error fetching project data from Gemini API:", error);
        if (error instanceof Error && (error.message.includes("JSON") || error instanceof SyntaxError)) {
            throw new Error("The API returned a response that was not valid JSON. Please try again.");
        }
        throw error;
    }
};

export const getAnalysis = async (projects: Project[]): Promise<string> => {
    if (!projects || projects.length === 0) {
        return "No project data available for analysis.";
    }

    try {
        const model = "gemini-2.5-pro";
        const prompt = `
            Analyze the following Godrej Properties real estate data from Mumbai. Provide a concise summary of the overall sentiment,
            highlight any projects with exceptionally low ratings or concerning comments, and identify any common themes
            or trends across the projects. Format the output in markdown. Use bolding for project names and key insights.

            Data:
            ${JSON.stringify(projects, null, 2)}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error getting analysis from Gemini API:", error);
        return "Failed to generate analysis due to an API error.";
    }
};