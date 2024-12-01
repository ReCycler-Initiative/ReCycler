import { ChatResponse } from "@/types";
import axios from "axios";

export const chat = (
  conversationId: string,
  message: string
): Promise<ChatResponse> => {
  const options = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CHATLING_API_KEY}`,
      "Content-Type": "application/json",
    },
  };

  return axios
    .post<ChatResponse>(
      "https://api.chatling.ai/v2/chatbots/{chatbotId}/ai/kb/chat",

      {
        message,
        ai_model_id: process.env.CHATLING_AI_MODEL_ID,
        conversation_id: conversationId,
        temperature: 0,
      },
      options
    )
    .then((response) => response.data)
    .catch((err) => {
      console.error(err);
      throw new Error("Error occured while chatting with Chatling");
    });
};
