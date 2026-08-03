import axiosInstance from './axios';

export interface ChatMessage {
    id: string;
    text: string;
    isBot: boolean;
}

export const sendAiMessage = async (message: string): Promise<string> => {
    const response = await axiosInstance.post('/ai/chat', { message });
    return response.data.reply;
};
