import { GoogleGenAI, GenerateContentResponse, Candidate } from "@google/genai";
import { Project, GroundingMetadata } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface DateRange {
    startDate: string;
    endDate: string;
}

export const fetchGodrejProjects = async (
    latitude: number,
    longitude: number,
    dateRange?: DateRange
): Promise<{ projects: Project[], groundingMetadata: GroundingMetadata | null }> => {
    try {
        let dateFilterPrompt = '';
        if (dateRange && dateRange.startDate && dateRange.endDate) {
            dateFilterPrompt = ` from the period between ${dateRange.startDate} and ${dateRange.endDate}`;
        }

        const prompt = `
            Find Godrej Properties projects in Mumbai. For each project, provide its name, full address, overall rating out of 5, the total number of reviews, and a list of at least 3 recent user comments from Google Maps${dateFilterPrompt}. For each comment, include the comment text and a sentiment analysis (Positive, Negative, or Neutral).
            Prioritize projects closest to the user's location.
            Your entire response must be a single, valid JSON array of objects. Do not include any explanatory text, markdown formatting, or any other characters outside of this JSON array.
            Each object in the array should represent a project with the following structure:
            {
              "projectName": "string",
              "address": "string",
              "rating": "number",
              "reviewCount": "number",
              "comments": [
                { "text": "string", "sentiment": "Positive" | "Negative" | "Neutral" }
              ]
            }
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: latitude,
                            longitude: longitude,
                        }
                    }
                }
            },
        });

        let text = response.text.trim();
        
        if (text.startsWith('```json')) {
            text = text.substring(7, text.length - 3).trim();
        } else if (text.startsWith('```')) {
            text = text.substring(3, text.length - 3).trim();
        }

        const projects: Project[] = JSON.parse(text);
        const candidate: Candidate | undefined = response.candidates?.[0];
        const groundingMetadata = candidate?.groundingMetadata as GroundingMetadata || null;
        
        return { projects, groundingMetadata };
    } catch (error) {
        console.error("Error fetching data from Gemini API:", error);
        throw new Error("Failed to fetch project data. The model may have returned an invalid JSON format.");
    }
};

export const analyzeProjectData = async (projects: Project[]): Promise<string> => {
    if (projects.length === 0) {
        return "No project data available to analyze.";
    }
    try {
        const prompt = `
            Analyze the following JSON data of Godrej Properties projects in Mumbai. Provide a concise summary of the findings. 
            Highlight any common themes in user comments (both positive and negative), mention the project with the highest and lowest ratings, and give an overall sentiment trend.
            Present the analysis in well-structured markdown format.

            Data:
            ${JSON.stringify(projects, null, 2)}
        `;
        
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing data with Gemini API:", error);
        return "An error occurred during the analysis.";
    }
}