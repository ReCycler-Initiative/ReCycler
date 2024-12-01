import * as chatgtp from "./chatgpt";
import * as chatling from "./chatling";

export const chat = (
  conversationId: string,
  message: string
): Promise<string> =>
  // chatling.chat(conversationId, message).then((response) => {
  //   return response.data.response;
  // });
  chatgtp.chat(message);
