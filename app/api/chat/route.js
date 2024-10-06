// app/api/chat/route.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = body.messages;

    // Add a system message to guide the AI's responses
    const systemMessage = {
      role: 'system',
      content: 'You are a professional and empathetic doctor in a telemedicine consultation. Provide clear, accurate medical information while maintaining a caring demeanor. Do not make definitive diagnoses but offer general guidance and recommend in-person consultation when appropriate.'
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',  // or 'gpt-3.5-turbo' depending on your needs
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500
    });

    return new Response(JSON.stringify({
      message: completion.choices[0].message.content
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
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