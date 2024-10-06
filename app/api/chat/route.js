// app/api/chat/route.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = body.messages;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 });
    }

    // Add a system message to guide the AI's responses
    const systemMessage = {
      role: 'system',
      content: "You are a professional and empathetic doctor in a telemedicine consultation. Provide clear, accurate medical information while maintaining a caring demeanor. Do not make definitive diagnoses but offer general guidance and recommend in-person consultation when appropriate. Don't make your responses too wordy or long. The patient should not feel overwhelmed reading your response, and they should be easy to read."
    };

    // Check if the last user message is requesting a summary
    const lastUserMessage = messages[messages.length - 1];
    let prompt = [...messages];

    if (lastUserMessage && lastUserMessage.content.toLowerCase().includes('summarize this conversation')) {
      // Modify the prompt to ask for summary and issue title
      prompt.push({
        role: 'system',
        content: "Please provide a summary of the conversation so far and a brief 2-3 word issue title. Return the response in the following JSON format:\n{\n  \"summary\": \"Your summary here.\",\n  \"issueTitle\": \"Title here\"\n}"
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...prompt],
      temperature: 0.7,
      max_tokens: 500
    });

    // Log the completion for debugging
    console.log('OpenAI Completion:', completion);

    if (
      completion &&
      completion.choices &&
      completion.choices.length > 0 &&
      completion.choices[0].message &&
      completion.choices[0].message.content
    ) {
      const aiMessage = completion.choices[0].message.content.trim();
      return new Response(JSON.stringify({
        message: aiMessage
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200
      });
    } else {
      console.error('Invalid response structure from OpenAI:', completion);
      return new Response(JSON.stringify({ error: 'Invalid response from OpenAI' }), { status: 500 });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get response from OpenAI'
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
