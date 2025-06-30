import { BASE_PROMPT } from '@/prompts/system-prompt';
import { basePrompt as reactBasePrompt } from '@/prompts/react';
import { AIMessage, ErrorResponse, TemplateResponse } from '@/types';
import { NextResponse, NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from '@/prompts/system-prompt';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json(); 
    
    
    const combinedPrompt = [
      BASE_PROMPT,
      reactBasePrompt,
      getSystemPrompt("/home/project"),
      prompt
    ].join('\n\n');

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-lite", 
    });

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: combinedPrompt }],
        },
      ],
    });

    let result = await chat.sendMessage(combinedPrompt);
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

    
    console.log("Gemini Response:", fullText);

    return NextResponse.json({ text: fullText });

  } catch (error) {
    console.error('Error in Gemini API call:', error);
    const errorResponse: ErrorResponse = { 
      error: 'Failed to process template request',
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
