// File: tj-bazaar-chatbot.js
const Groq = require('groq-sdk');
const { Router } = require('express');
const { check, validationResult } = require('express-validator');

const router = Router();
const groqApiKey = process.env.GROQ_API_KEY;
const groq = new Groq({ apiKey: groqApiKey });

if (!groqApiKey) {
    console.error('Error: Missing GROQ_API_KEY in .env file');
    return;
}

async function getGroqData(prompt) {
    try {
        const result = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-8b-8192",
        });
        return result.choices[0]?.message?.content || "";
    } catch (error) {
        console.error('Error calling Groq AI API:', error);
        throw error;
    }
}

router.post('/', [
    check('prompt').not().isEmpty().withMessage("Nothing in Prompt"),
    check('history').not().isEmpty().withMessage("Nothing in History")
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, message: errors.array()[0] });
    }

    let { prompt, history } = req.body;

    prompt = `Make sure answers are short, crisp, and precise. Avoid bold text as it uses **. Respond in a friendly, professional tone as Placement AI, a virtual assistant guiding students with placement preparation, interviews, and career growth.

Details about Placement AI:

Focus Areas:

Internship and Job Prep
Resume Building and Review
Interview Guidance (Technical, HR, Behavioral)
Career Advice for Freshers and Experienced Professionals
Services Offered:

Personalized Preparation Strategies
Mock Interviews
Guidance on Online Coding Platforms
Tips for Communication Skills
Current Year: ${new Date().getFullYear()}

Use the following response formats:

For placement prep queries: Provide specific, actionable advice or resources.
For career guidance: Give concise insights tailored to their goals.
For general queries: Answer in a direct and helpful manner.
Ensure currency is INR, and responses remain short, concise, and friendly.
Chat History Till Now: ${history}

User's Current Query: ${prompt}`;

    try {
        const result = await getGroqData(prompt);
        return res.status(200).send(result);
    } catch (error) {
        console.error('Error calling Groq AI API:', error);
        return res.status(500).json({ status: false, message: 'An internal server error occurred.' });
    }
});

module.exports = router;
