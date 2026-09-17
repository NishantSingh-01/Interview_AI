import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
})

async function chatbot(input) {
    const text = typeof input === 'string' ? input : (input?.text || "");



    // const prompt = `
    // You are an interview preparation assistant.

    // User will ask interview questions.
    // You must answer directly.

    // Do NOT ask user for more information nor to short shold me max 100 word -200 words.
    // Do NOT ask for job description.
    // Just answer the question.

    // Keep answers short and professional.

    // Question:
    // ${text}
    // `  

    const prompt = `
You are an interview preparation assistant.

Instructions:
- Answer in 5 to 8 lines total
- First write one simple short paragraph (2-3 lines)
- Then provide bullet points
- Bullet points should be short and clear
- Keep language simple and professional
- Do not ask follow-up questions
- Do not write long explanations

User Question:
${text}
`

    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        generationConfig: {
            temperature: 0.2
        }
    })

    return response.text
}

export default chatbot