import OpenAI from "openai";
import {Parea, patchOpenAI} from "parea-ai";
import * as dotenv from 'dotenv';

dotenv.config();

export const p = new Parea(process.env.PAREA_API_KEY, "test-nextjs")
export const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});
patchOpenAI(openai);