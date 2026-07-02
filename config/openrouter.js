const OpenAI = require("openai");

const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "AI Chat Assistant",
    },
});
console.log("API Key:", process.env.OPENROUTER_API_KEY);

async function generateResponse(prompt) {
    try {
        const completion = await client.chat.completions.create({
            model: "openai/gpt-oss-20b:free",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        return completion.choices[0].message.content;
    } catch (error) {
    console.log("========== OPENROUTER ERROR ==========");

    if (error.status) {
        console.log("Status:", error.status);
    }

    if (error.message) {
        console.log("Message:", error.message);
    }

    if (error.response) {
        console.dir(error.response.data, { depth: null });
    }

    console.dir(error, { depth: 3 });

    console.log("======================================");

    return "Sorry, I couldn't generate a response at the moment.";
}
}

module.exports = generateResponse;