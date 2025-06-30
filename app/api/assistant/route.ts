import { BASE_PROMPT } from '@/prompts/system-prompt';
import { basePrompt as reactBasePrompt } from '@/prompts/react';
import { AIMessage, ErrorResponse, TemplateResponse } from '@/types';
import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from '@/prompts/system-prompt';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export async function POST(req: NextRequest) {
  try {
    const { prompt, history } = await req.json(); 
    
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite", 
    });

    // Format the incoming history for the Gemini API
    // Format the incoming history for the Gemini API
    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Prepend system prompts to the history
    const initialPrompts = [
      { role: 'user', parts: [{ text: BASE_PROMPT }] },
      { role: 'user', parts: [{ text: reactBasePrompt }] },
      { role: 'user', parts: [{ text: getSystemPrompt("/home/project") }] },
    ];

    const fullHistory = [...initialPrompts, ...formattedHistory];

    const chat = model.startChat({
      history: fullHistory,
    });

    // Send the current prompt as the last message in the chat
    let result = await chat.sendMessage(prompt);
    let response = await result.response;
    let text = await response.text();
    let fullText = text;
    let maxContinues = 5; 
    let continuePrompt = 'continue';
    let i = 0;

   
    while (i < maxContinues && text.trim().endsWith('...')) {
      result = await chat.sendMessage(continuePrompt);
      response = await result.response;
      text = await response.text();
      fullText += '\n' + text;
      i++;
    }

    
    

    return NextResponse.json({ text: fullText });

  } catch (error) {
    console.error('Error in Gemini API call:', error);
    const errorResponse: ErrorResponse = { 
      error: 'Failed to process template request',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
