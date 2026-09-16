// import { GoogleGenAI } from "@google/genai"
// import {  z } from "zod"
// import { zodToJsonSchema } from "zod-to-json-schema"


// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY
// })

// const interviewReportSchema = z.object({
//     matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
//     technicalQuestion: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
//     behaviouralQuestion: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
//     skillGaps: z.array(z.object({
//         skill: z.string().describe("The skill which the candidate is lacking"),
//         severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
//     })).describe("List of skill gaps in the candidate's profile along with their severity"),
//     preparationPlan: z.array(z.object({
//         day: z.number().describe("The day number in the preparation plan, starting from 1"),
//         focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
//         tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
//     })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
//     title: z.string().describe("The title of the job for which the interview report is generated"),
// })

// async function generateInterviewReport({ resume, selfDescription, jobDescription }) {


//     const prompt = `Generate an interview report for a candidate with the following details:
//                         Resume: ${resume}
//                         Self Description: ${selfDescription}
//                         Job Description: ${jobDescription}
//                         follow this
//                         const interviewReportSchema = z.object({
//     matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
//     technicalQuestion: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
//     behaviouralQuestion: z.array(z.object({
//         question: z.string().describe("The technical question can be asked in the interview"),
//         intention: z.string().describe("The intention of interviewer behind asking this question"),
//         answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
//     })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
//     skillGaps: z.array(z.object({
//         skill: z.string().describe("The skill which the candidate is lacking"),
//         severity: z.enum(["low", "medium", "high"]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
//     })).describe("List of skill gaps in the candidate's profile along with their severity"),
//     preparationPlan: z.array(z.object({
//         day: z.number().describe("The day number in the preparation plan, starting from 1"),
//         focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
//         tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
//     })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),

// })

// }

// `

//     const response = await ai.models.generateContent({
//         // model: "gemini-3-flash-preview",
//         //    model: "gemini-3-flash-preview",
//         model: "gemini-2.5-flash",
//         //    model: "gemini-3-flash-preview",
//         // model: "gemini-2.5-flash-lite",
//         // model: "gemini-2.5-pro-preview-tts",
//         contents: prompt,
//         config: {
//             responseMimeType: "application/json",
//             responseSchema: zodToJsonSchema(interviewReportSchema),
//         }
//     })

//     return JSON.parse(response.text)


// }


// export default generateInterviewReport


import { GoogleGenAI } from "@google/genai"
import { z } from "zod"
import { zodToJsonSchema } from "zod-to-json-schema"

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
})

const interviewReportSchema = z.object({
  matchScore: z.number().min(0).max(100),

  technicalQuestion: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string()
    })
  ),

  behaviouralQuestion: z.array(
    z.object({
      question: z.string(),
      intention: z.string(),
      answer: z.string()
    })
  ),

  skillGaps: z.array(
    z.object({
      skill: z.string(),
      severity: z.enum(["low", "medium", "high"])
    })
  ),

  preparationPlan: z.array(
    z.object({
      day: z.number(),
      focus: z.string(),
      tasks: z.array(z.string())
    })
  ),
  title: z.string().describe("The title of of the Job for which the interview report is generated")

}).strict()

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

  const prompt = `
You are a senior technical interviewer.

Generate an interview preparation report.

Return ONLY JSON matching this structure:

{
 "matchScore": number (0-100),
 "technicalQuestion": [
   {
     "question": string,
     "intention": string,
     "answer": string
   }
 ],
 "behaviouralQuestion": [
   {
     "question": string,
     "intention": string,
     "answer": string
   }
 ],
 "skillGaps": [
   {
     "skill": string,
     "severity": "low" | "medium" | "high"
   }
 ],
 "preparationPlan": [
   {
     "day": number,
     "focus": string,
     "tasks": [string]
   }
 ],
 title:{
 string
 }
}

Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

Return ONLY valid JSON.
`

  const response = await ai.models.generateContent({
    // model: "gemini-2.5-flash",
    model: "gemini-3-flash-preview",
    contents: prompt,
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: zodToJsonSchema(interviewReportSchema),
      temperature: 0.2
    }
  })

  const json = JSON.parse(response.text)
  // console.log(json)
  console.log(JSON.stringify(json, null, 2))
  const validated = interviewReportSchema.safeParse(json)

  if (!validated.success) {
    console.error(validated.error)
    throw new Error("Invalid AI response format")
  }

  return validated.data
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {

  const htmlResponse = z.string().describe("A complete valid HTML document for a professional ATS-friendly resume. Must start with <!DOCTYPE html> and contain no explanations or extra text."
  )
  const prompt = `You are an expert resume writer and HTML designer.
Your task is to generate a professional, ATS-friendly resume in **pure HTML format** based on the inputs provided.
Resume Data: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

### Inputs:
1. Resume Data: {{resume}}
2. Candidate Self Description: {{selfDescription}}
3. Job Description: {{jobDescription}}

### Instructions:
- Generate a **complete HTML document** (include <!DOCTYPE html>, <html>, <head>, <body>)
- Use **inline CSS only** (no external styles, no Tailwind, no scripts)
- The design should be **clean, modern, and professional**
- Format the resume specifically tailored to the **job description**
- Highlight relevant skills, experience, and keywords from the job description
- Keep it **ATS-friendly** (simple layout, no complex tables)

### Structure to follow:
- Header:
  - Full Name
  - Email | Phone | Location | LinkedIn (if available)
  -github | porfolio
- Summary:
  - 2–3 lines tailored to the job
- Skills:
  - Bullet points or inline list
- Experience:
  - Job Title, Company, Duration
  - Bullet points with achievements
- Projects (if relevant)
- Education

### Styling Guidelines:
- Use a professional font (Arial, Helvetica, sans-serif)
- Proper spacing and margins
- Section headings with subtle borders or emphasis
- Keep it visually clean for PDF conversion

### IMPORTANT:
- Output ONLY valid HTML
- Do NOT include explanations, markdown, or code blocks
- Ensure the HTML is directly usable for PDF generation (Puppeteer)
`
  const response = await ai.models.generateContent({
    // model: "gemini-2.0-flash", 
    model: "gemini-3-flash-preview",
    contents: prompt,
  })

  let html = response.text
  // console.log(html)
  return html

}




export { generateInterviewReport, generateResumePdf }