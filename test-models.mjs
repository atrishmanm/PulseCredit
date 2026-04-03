import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY || '';

async function test() {
  if (!API_KEY) {
    console.error("No API key found");
    return;
  }
  const genAI = new GoogleGenerativeAI(API_KEY);
  console.log("Fetching models...");
  
  // Actually there's a listModels endpoint but no direct wrapper in some SDK versions, maybe we can fetch it via HTTP
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
  const data = await response.json();
  console.log("Models:", JSON.stringify(data.models.map((m: any) => m.name), null, 2));
}

test().catch(console.error);
