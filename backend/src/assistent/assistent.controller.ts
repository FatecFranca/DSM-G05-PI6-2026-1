import { Controller } from '@nestjs/common';
import { Body, Post } from '@nestjs/common';
import { AssistentService } from './assistent.service';

@Controller('assistent')
export class AssistentController {

    constructor(private readonly assistentService: AssistentService) {}

    @Post('message')
    async sendMessage(@Body() body: { message?: string, history?: {role: string, content: string}[] }) {
        try{
            const inputData = body.history || body.message;
            if (!inputData) throw new Error("Mensagem ou histórico ausente");
            
            const response = await this.assistentService.sendMessage(inputData);
            return { response };
        }catch(error){
            throw error;
        }
    }
}
