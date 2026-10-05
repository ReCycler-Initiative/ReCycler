import db from "@/services/db";

export type ChatUsageTopic =
  | "location_finding"
  | "sorting_advice"
  | "material_identification"
  | "other_help";

export function classifyChatTopic(message: string, hasImage: boolean): ChatUsageTopic {
  if (hasImage) return "material_identification";

  const text = message.toLocaleLowerCase("fi");
  if (/missä|mista|mistä|lähin|lähimmät|osoite|kartta|where|nearest|location/.test(text)) {
    return "location_finding";
  }
  if (/lajittel|kierrät|kierrat|saako|saako|mihin laitan|miten hävit|recycl|sort|dispose/.test(text)) {
    return "sorting_advice";
  }
  if (/mikä tämä|mikä tää|mitä tämä|tunnista|what is this|identify/.test(text)) {
    return "material_identification";
  }
  return "other_help";
}

export async function recordChatUsage(
  useCaseId: string | undefined,
  sessionId: string | undefined,
  topic: ChatUsageTopic,
  hasImage: boolean,
  selectedMaterialCount: number
): Promise<void> {
  if (!useCaseId || !sessionId) return;
  try {
    await db("recycler.usage_events").insert({
      use_case_id: useCaseId,
      session_id: sessionId,
      event_type: "chat_message",
      metadata: { topic, hasImage, selectedMaterialCount },
    });
  } catch (error) {
    console.error("Could not record usage event:", error);
  }
}