import { OpenAI } from 'openai';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  // For text files, read directly
  if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
    const text = await file.text();
    return text;
  }

  // For PDF files, use pdf-extraction
  if (fileName.endsWith('.pdf')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Use pdf-extraction for PDF parsing (CommonJS module)
      const pdfExtract = require('pdf-extraction');
      const data = await pdfExtract(buffer);

      // Extract text from all pages
      let fullText = '';
      if (data.text) {
        fullText = data.text;
      }

      // Limit to avoid token limits
      return fullText.substring(0, 15000);
    } catch (error) {
      console.error('Error parsing PDF:', error);
      return 'Erro ao processar PDF. Por favor, tente outro formato.';
    }
  }

  // For other document types, try to read as text
  const arrayBuffer = await file.arrayBuffer();
  const text = new TextDecoder('utf-8', { fatal: false }).decode(arrayBuffer);

  return text.substring(0, 10000); // Limit to first 10000 chars to avoid token limits
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let messages;
    let fileContents: string[] = [];

    // Check if request contains files
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      messages = JSON.parse(formData.get('messages') as string);

      // Extract text from uploaded files
      const files = formData.getAll('files') as File[];
      for (const file of files) {
        try {
          const content = await extractTextFromFile(file);
          fileContents.push(`\n\n--- Conteúdo do arquivo: ${file.name} ---\n${content}\n--- Fim do arquivo ---\n`);
        } catch (error) {
          console.error(`Error extracting text from ${file.name}:`, error);
          fileContents.push(`\n\n--- Arquivo: ${file.name} ---\nErro ao extrair texto do arquivo.\n--- Fim do arquivo ---\n`);
        }
      }
    } else {
      const body = await req.json();
      messages = body.messages;
    }

    // If files were uploaded, append their contents to the last user message
    if (fileContents.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'user') {
        lastMessage.content = lastMessage.content + '\n\n' + fileContents.join('\n');
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      temperature: 0.7,
      stream: false,
    });

    const assistantMessage = response.choices[0].message.content;

    return NextResponse.json({ message: assistantMessage });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during your request.' },
      { status: 500 }
    );
  }
}
