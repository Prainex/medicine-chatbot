// app/api/chat/route.js
import OpenAI from 'openai';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase'; // Adjust the path as needed

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    const messages = body.messages;
    const chatId = body.chatId;

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'No messages provided' }), { status: 400 });
    }

    if (!chatId) {
      return new Response(JSON.stringify({ error: 'No chatId provided' }), { status: 400 });
    }

    // Fetch the chat document to check if a doctor is active
    const chatDocRef = doc(db, 'chats', chatId);
    const chatDocSnap = await getDoc(chatDocRef);

    if (!chatDocSnap.exists()) {
      return new Response(JSON.stringify({ error: 'Chat not found' }), { status: 404 });
    }

    const chatData = chatDocSnap.data();

    if (chatData.isDoctorActive) {
      // Do not send messages to AI; inform that a doctor will respond
      return new Response(JSON.stringify({ message: 'A real doctor will respond to your message shortly.' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Proceed with AI response as usual
    const systemMessage = {
      role: 'system',
      content:
        "You are a professional and empathetic assistant in a telemedicine consultation. I'm a patient that is going to tell you what brings me in today, or I might say hi, in which case you should try to get me to talk about what ailment/symptoms I'm going through. Ask questions (not more than 6) about what I'm going through so that you can better understand how to help me, and provide clear, accurate medical information while maintaining a caring demeanor. Do not make definitive diagnoses but offer general guidance and recommend in-person consultation when appropriate. Don't make your responses too wordy or long. The patient should not feel overwhelmed reading your response, and they should be easy to read.",
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 500,
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
      return new Response(
        JSON.stringify({
          message: aiMessage,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } else {
      console.error('Invalid response structure from OpenAI:', completion);
      return new Response(JSON.stringify({ error: 'Invalid response from OpenAI' }), { status: 500 });
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to get response from OpenAI',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
}
