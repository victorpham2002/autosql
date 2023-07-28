import openai from "../../lib/openai"
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { messages } = req.body
    if (req.method !== "POST") {
        return res.status(400).json({error: 'Invalid Request'})
    }
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages
      })
    
    const firstResponse = completion.data.choices[0].message.content;
    return res.status(200).json({firstResponse});
}