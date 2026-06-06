import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from "@google/genai";
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AssistentService {
    private genAI: GoogleGenAI;
    private systemInstruction: string;

    constructor(private readonly configService: ConfigService) {
        this.genAI = new GoogleGenAI({
            apiKey: this.configService.get<string>('GEMINI_API_KEY'),
        });

        
        try {
           
            const skillPath = path.join(process.cwd(), 'src', 'assistent', 'SKILL.md');
            this.systemInstruction = fs.readFileSync(skillPath, 'utf8');
        } catch (error) {
            console.error('⚠️ Não foi possível ler o arquivo SKILL.md. Usando contexto padrão.', error);
            this.systemInstruction = "Você é um assistente útil especializado em análise de commodities.";
        }
    }

    async sendMessage(input: string | any[]) {
        try {
            let requestContents: any;

            // Se o input for um array (histórico do chat), formatamos para o Gemini
            if (Array.isArray(input)) {
                requestContents = input.map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));
            } else {
                requestContents = input;
            }

            const response = await this.genAI.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: requestContents,
                config: {
                    
                    systemInstruction: this.systemInstruction,
                }
            });

            return response.text;
        } catch(error) {
            throw error;
        }
    }
}
