
import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000/api/v1",
    withCredentials: true
})


export const getinterviewReport = async ({ resumeFile, selfDescription, jobDescription }) => {
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('jobDescription', jobDescription)
    formData.append('selfDescription', selfDescription)

    const response = await api.post('/interview-ai', formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    })
    return response.data
}
export const getInterviewReportById = async(interviewId)=>{
      const response = await api.get(`/getinterview-report/${interviewId}`)

      return response.data
}
export const getAllInterviewReport = async()=>{
      const response = await api.get('/all-interview-report')
      
      return response.data
}

export const sendChatMessage = async (message) => {
    const response = await api.post('/chatbot', { message })
    return response.data
}