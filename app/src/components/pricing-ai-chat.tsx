"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export const PricingAiChat = () => {
  const { locale } = useLocale();
  const dictionary = useMessages();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: dictionary.pricingChat.initialAssistantMessage,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadForm, setLeadForm] = useState({
    name: "",
    email: "",
    organizationName: "",
    phone: "",
    message: "",
  });
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: dictionary.pricingChat.initialAssistantMessage,
      },
    ]);
  }, [dictionary.pricingChat.initialAssistantMessage]);

  useEffect(() => {
    if (!open) return;
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const nextHistory = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(nextHistory);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/pricing-chat", {
        message: trimmed,
        history: messages,
        locale,
      });

      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: response.data.reply || dictionary.pricingChat.assistantFallback,
        },
      ]);
    } catch {
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content: dictionary.pricingChat.unavailableFallback,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitLead = async () => {
    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      toast.error(dictionary.pricingChat.missingLeadFields);
      return;
    }

    setLeadLoading(true);
    try {
      await axios.post("/api/pricing-leads", {
        ...leadForm,
        source: "pricing-chat",
        chatHistory: messages,
      });
      setLeadSubmitted(true);
      toast.success(dictionary.pricingChat.leadSuccess);
    } catch {
      toast.error(dictionary.pricingChat.leadError);
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50">
          {dictionary.pricingChat.dialogTrigger}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dictionary.pricingChat.dialogTitle}</DialogTitle>
          <DialogDescription>
            {dictionary.pricingChat.dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex max-h-[45vh] min-h-[320px] flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={message.role === "assistant" ? "pr-10" : "pl-10"}
              >
                <div
                  className={
                    message.role === "assistant"
                      ? "rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm leading-6 text-gray-800"
                      : "rounded-2xl rounded-tr-md bg-gray-900 px-4 py-3 text-sm leading-6 text-white"
                  }
                >
                  {message.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="pr-10">
                <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 text-sm text-gray-500">
                  {dictionary.pricingChat.loadingReply}
                </div>
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          <div className="border-t border-gray-200 bg-white p-4">
            <div className="flex flex-col gap-3">
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={dictionary.pricingChat.placeholder}
                className="min-h-24 resize-none bg-white"
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-gray-500">
                  {dictionary.pricingChat.enterHint}
                </div>
                <Button type="button" onClick={() => void sendMessage()} disabled={loading || !input.trim()}>
                  {dictionary.pricingChat.send}
                  <SendHorizonal className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">{dictionary.pricingChat.contactTitle}</h3>
              <p className="mt-1 text-sm text-gray-600">
                {dictionary.pricingChat.contactDescription}
              </p>
            </div>

            {leadSubmitted ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {dictionary.pricingChat.contactSubmitted}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pricing-lead-name">{dictionary.pricingChat.nameLabel}</Label>
                  <Input
                    id="pricing-lead-name"
                    value={leadForm.name}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder={dictionary.pricingChat.namePlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing-lead-email">{dictionary.pricingChat.emailLabel}</Label>
                  <Input
                    id="pricing-lead-email"
                    type="email"
                    value={leadForm.email}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder={dictionary.pricingChat.emailPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing-lead-organization">{dictionary.pricingChat.organizationLabel}</Label>
                  <Input
                    id="pricing-lead-organization"
                    value={leadForm.organizationName}
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        organizationName: event.target.value,
                      }))
                    }
                    placeholder={dictionary.pricingChat.organizationPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing-lead-phone">{dictionary.pricingChat.phoneLabel}</Label>
                  <Input
                    id="pricing-lead-phone"
                    value={leadForm.phone}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder={dictionary.pricingChat.phonePlaceholder}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pricing-lead-message">{dictionary.pricingChat.detailsLabel}</Label>
                  <Textarea
                    id="pricing-lead-message"
                    value={leadForm.message}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, message: event.target.value }))
                    }
                    placeholder={dictionary.pricingChat.detailsPlaceholder}
                    className="min-h-24 resize-none"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-500">
                    {dictionary.pricingChat.historySavedHint}
                  </div>
                  <Button type="button" onClick={() => void submitLead()} disabled={leadLoading}>
                    {leadLoading
                      ? dictionary.pricingChat.sendingContactRequest
                      : dictionary.pricingChat.sendContactRequest}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
