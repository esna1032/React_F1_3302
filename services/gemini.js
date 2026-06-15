const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export async function generateDriverReply({ driver, userQuestion, messages }) {
  if (!GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing. Check your .env file.");
  }

  const recentConversation = messages
    .slice(-6)
    .map((message) => {
      const speaker = message.sender === "user" ? "Fan" : driver.shortName;
      return `${speaker}: ${message.text}`;
    })
    .join("\n");

  const prompt = `
You are an AI paddock interview simulator for an F1 fan website called New.

Important rules:
- You are not the real ${driver.name}.
- Do not claim to be the actual person.
- Answer as a respectful virtual interview AI inspired by publicly known racing style, team context, and Formula 1 knowledge.
- Do not invent private facts, private conversations, injuries, contracts, or confidential paddock information.
- Keep the answer natural, friendly, and immersive.
- Reply in Korean.
- Keep the answer within 2 to 4 sentences.
- The selected driver is:
  Name: ${driver.name}
  Team: ${driver.team}
  Racing number: ${driver.number}
  Short description: ${driver.intro}

Recent conversation:
${recentConversation || "No previous conversation."}

Fan question:
${userQuestion}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.85,
          maxOutputTokens: 220,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${errorText}`);
  }

  const data = await response.json();

  const reply =
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "지금은 답변을 생성하지 못했어. 잠시 후 다시 질문해줘.";

  return reply.trim();
}