"use client";

import { Bot, Trash } from "lucide-react";
import { Button } from "./ui/button";
import { useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { useMutation } from "@tanstack/react-query";
import { chat } from "@/services/api";
import LoadingSpinner from "./loading-spinner";
import { cn } from "@/lib/utils";

type Message = {
  from: "user" | "bot";
  content: string;
};

export const Chat = () => {
  const conversationIdRef = useRef<string>(
    (typeof window !== "undefined" &&
      window.localStorage.getItem("conversationId")) ||
      uuid()
  );
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const chatMutation = useMutation({
    mutationKey: [conversationIdRef.current],
    mutationFn: chat,
    onSuccess: (response) => {
      setMessages([...messages, { from: "bot", content: response }]);
      if (messageContainerRef.current) {
        messageContainerRef.current.scrollTo({
          top:
            messageContainerRef.current.scrollHeight +
            messageContainerRef.current.offsetHeight,
          behavior: "smooth",
        });
      }
    },
  });

  const handleMessage = () => {
    setMessages([...messages, { from: "user", content: message }]);
    chatMutation.mutate({ conversationId: conversationIdRef.current, message });
    setMessage("");
  };

  return (
    <div>
      <Button
        className="rounded-full h-12 w-12 border-2 border-black "
        size="icon"
        onClick={() => setShowChat(!showChat)}
      >
        <Bot />
      </Button>
      {showChat && (
        <div className="fixed bottom-2 right-2 bg-white border border-primary left-4 p-4 max-h-[80dvh] flex flex-col">
          <h2 className="font-bold mb-2">Apuri</h2>
          <div
            ref={messageContainerRef}
            className="overflow-y-auto max-h-full flex-1 mb-4 w-full"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn("bg-gray-100 p-2 my-2", {
                  "ml-12": msg.from === "user",
                  "mr-12 bg-primary text-white": msg.from === "bot",
                })}
              >
                {msg.content}
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="py-2 flex justify-center">
                <LoadingSpinner />
              </div>
            )}
          </div>
          <div className="flex gap-4">
            <input
              className="w-full border border-gray-400 p-2 mb-4"
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Mitäs sulla siinä on?"
              type="text"
              value={message}
            />
            <Button onClick={handleMessage}>Kysy</Button>
          </div>
        </div>
      )}
    </div>
  );
};
