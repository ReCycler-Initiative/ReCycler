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
import { toast } from "sonner";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const initialAssistantMessage: Message = {
  role: "assistant",
  content:
    "Hei! Voin auttaa ReCyclerin hinnoittelussa ja käyttöönotossa. Kerro vaikka organisaatiosi koko, käyttötapaus tai montako datalähdettä tarvitsette.",
};

export const PricingAiChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialAssistantMessage]);
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
      });

      setMessages([
        ...nextHistory,
        { role: "assistant", content: response.data.reply || "Voin auttaa tarkentamaan pakettia tarkemmin, jos kerrot vähän tarpeestasi." },
      ]);
    } catch {
      setMessages([
        ...nextHistory,
        {
          role: "assistant",
          content:
            "Tekoälychat ei ole juuri nyt käytettävissä. Voit silti jättää tarjouspyynnön tai kokeilla hetken päästä uudelleen.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const submitLead = async () => {
    if (!leadForm.name.trim() || !leadForm.email.trim()) {
      toast.error("Lisää vähintään nimi ja sähköposti.");
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
      toast.success("Yhteydenottopyyntö lähetetty.");
    } catch {
      toast.error("Yhteydenoton lähetys epäonnistui.");
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-900 transition hover:bg-gray-50">
          Kysy chatissa ja jätä yhteydenotto
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Kysy hinnoittelusta</DialogTitle>
          <DialogDescription>
            Voit kysyä esimerkiksi pilotista, käyttöönoton laajuudesta tai siitä,
            mikä palvelutaso sopisi teille. Jätä lopuksi yhteystietosi, niin
            myyntitiimi on yhteydessä.
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
                  Kirjoitetaan vastausta...
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
                placeholder="Esim. Meillä on yksi palvelu ja kaksi datalähdettä. Riittäisikö pilotti?"
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
                  Enter lähettää, Shift+Enter lisää rivinvaihdon.
                </div>
                <Button type="button" onClick={() => void sendMessage()} disabled={loading || !input.trim()}>
                  Lähetä
                  <SendHorizonal className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-3">
              <h3 className="text-sm font-semibold text-gray-900">Ota yhteyttä</h3>
              <p className="mt-1 text-sm text-gray-600">
                Kun jätät yhteystietosi, myyntitiimi voi palata keskusteluunne ja
                olla sinuun yhteydessä.
              </p>
            </div>

            {leadSubmitted ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                Kiitos. Yhteydenottopyyntösi on vastaanotettu ja palaamme asiaan.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pricing-lead-name">Nimi</Label>
                  <Input
                    id="pricing-lead-name"
                    value={leadForm.name}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Etunimi Sukunimi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing-lead-email">Sähköposti</Label>
                  <Input
                    id="pricing-lead-email"
                    type="email"
                    value={leadForm.email}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="nimi@organisaatio.fi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing-lead-organization">Organisaatio</Label>
                  <Input
                    id="pricing-lead-organization"
                    value={leadForm.organizationName}
                    onChange={(event) =>
                      setLeadForm((current) => ({
                        ...current,
                        organizationName: event.target.value,
                      }))
                    }
                    placeholder="Esim. Yritys Oy"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pricing-lead-phone">Puhelin</Label>
                  <Input
                    id="pricing-lead-phone"
                    value={leadForm.phone}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, phone: event.target.value }))
                    }
                    placeholder="040 123 4567"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="pricing-lead-message">Lisätiedot</Label>
                  <Textarea
                    id="pricing-lead-message"
                    value={leadForm.message}
                    onChange={(event) =>
                      setLeadForm((current) => ({ ...current, message: event.target.value }))
                    }
                    placeholder="Kerro lyhyesti tarpeestanne tai toivotusta aikataulusta."
                    className="min-h-24 resize-none"
                  />
                </div>
                <div className="sm:col-span-2 flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-500">
                    Keskusteluhistoria tallennetaan yhteydenoton tueksi.
                  </div>
                  <Button type="button" onClick={() => void submitLead()} disabled={leadLoading}>
                    {leadLoading ? "Lähetetään..." : "Lähetä yhteydenottopyyntö"}
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
