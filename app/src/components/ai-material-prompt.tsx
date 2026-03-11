"use client";

import { chat, getMaterials } from "@/services/api";
import { Material } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Camera, Mic, MicOff, RecycleIcon, SendHorizonal, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { hexToRgba, iconMap } from "./materials";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

type Message = { role: "user" | "assistant"; content: string; imagePreview?: string };
type CartMaterial = Material & { baseHex?: string; icon?: React.ReactNode };
type PendingImage = { base64: string; mimeType: string; previewUrl: string };

export const AiMaterialPrompt = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [cartCodes, setCartCodes] = useState<number[]>([]);
  const [preparationTips, setPreparationTips] = useState<
    { materialName: string; tip: string }[]
  >([]);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const initialized = useRef(false);

  const { data: materials } = useQuery({
    queryKey: ["materials"],
    queryFn: getMaterials,
    staleTime: Infinity,
  });

  const cartMaterials: CartMaterial[] = (materials ?? [])
    .filter((m) => cartCodes.includes(m.code))
    .map((m) => {
      const match = iconMap.find((i) => i.code === m.code);
      return { ...m, baseHex: match?.baseHex, icon: match?.icon };
    });

  const resultsHref = `/recycler/results?materials=${encodeURIComponent(
    cartCodes.join(",")
  )}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Fetch greeting on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    setLoading(true);
    chat({ message: "", history: [] })
      .then((res) => {
        setMessages([{ role: "assistant", content: res.reply }]);
        setCartCodes(res.suggestedCodes);
        setPreparationTips(res.preparationTips);
      })
      .catch(() => {
        setMessages([
          {
            role: "assistant",
            content: "Hei! Kerro mitä sinulla on kierrätettävänä.",
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      setPendingImage({ base64, mimeType: file.type, previewUrl: dataUrl });
    };
    reader.readAsDataURL(file);
    // Reset so the same file can be re-selected
    e.target.value = "";
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      setShowCamera(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 50);
    } catch {
      // Fallback: open file picker if camera access denied or unavailable
      fileInputRef.current?.click();
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setShowCamera(false);
  };

  const toggleListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SR = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SR();
    recognition.lang = "fi-FI";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    let finalTranscript = "";
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalTranscript += t;
        else interim = t;
      }
      setInput(finalTranscript || interim);
    };
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.start();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setPendingImage({ base64: dataUrl.split(",")[1], mimeType: "image/jpeg", previewUrl: dataUrl });
    stopCamera();
  };

  const sendMessage = async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if ((!text && !pendingImage) || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text || "📷 Kuva",
      imagePreview: pendingImage?.previewUrl,
    };
    const newMessages: Message[] = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    const imageToSend = pendingImage;
    setPendingImage(null);
    setLoading(true);

    try {
      const res = await chat({
        message: text,
        history: messages,
        imageBase64: imageToSend?.base64,
        imageMimeType: imageToSend?.mimeType,
      });
      setMessages([...newMessages, { role: "assistant", content: res.reply }]);
      setCartCodes(res.suggestedCodes);
      setPreparationTips(res.preparationTips);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Jokin meni pieleen. Kokeile hetken kuluttua uudelleen.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Kameramodaali */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-6 p-4">
          <video
            ref={videoRef}
            className="rounded-xl w-full max-w-lg max-h-[65vh] object-cover"
            autoPlay
            playsInline
            muted
          />
          <div className="flex gap-3">
            <Button size="lg" onClick={capturePhoto}>
              Ota kuva
            </Button>
            <Button size="lg" variant="outline" onClick={stopCamera} className="bg-white text-black">
              Peruuta
            </Button>
          </div>
        </div>
      )}

      {/* Viestihistoria */}
      <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto pr-1">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed flex flex-col gap-2 ${
                msg.role === "user"
                  ? "bg-black text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.imagePreview && (
                <img
                  src={msg.imagePreview}
                  alt="Lähetetty kuva"
                  className="rounded-lg max-h-48 object-contain"
                />
              )}
              {msg.content !== "📷 Kuva" && <span>{msg.content}</span>}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Syöttökenttä */}
      <form
        onSubmit={sendMessage}
        className="flex flex-col gap-2 border border-gray-200 rounded-xl p-2 bg-white focus-within:ring-2 focus-within:ring-black focus-within:ring-offset-1"
      >
        {pendingImage && (
          <div className="relative self-start">
            <img
              src={pendingImage.previewUrl}
              alt="Valittu kuva"
              className="h-24 w-24 object-cover rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => setPendingImage(null)}
              className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full p-0.5 hover:bg-gray-900"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Textarea
          placeholder="Kirjoita viesti tai ota kuva… (Enter lähettää)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          className="resize-none text-sm border-0 shadow-none focus-visible:ring-0 p-1 w-full"
          disabled={loading}
        />
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-gray-500 hover:text-black"
              onClick={() => startCamera()}
              disabled={loading}
              title="Ota kuva"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className={`h-8 w-8 transition-colors ${
                isListening
                  ? "text-red-500 hover:text-red-600 animate-pulse"
                  : "text-gray-500 hover:text-black"
              }`}
              onClick={toggleListening}
              disabled={loading || typeof window === "undefined" || !("SpeechRecognition" in window || "webkitSpeechRecognition" in window)}
              title={isListening ? "Lopeta kuuntelu" : "Puhu viesti"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={loading || (!input.trim() && !pendingImage)}
            className="shrink-0 h-8 w-8"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </form>

      {/* Valitut materiaalit */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 flex flex-col gap-3">
        <p className="text-sm font-medium text-gray-700">
          Valitut materiaalit{" "}
          {cartMaterials.length > 0 && (
            <span className="ml-1 rounded-full bg-yellow-400 text-black text-xs font-bold px-2 py-0.5">
              {cartMaterials.length}
            </span>
          )}
        </p>

        {cartMaterials.length === 0 ? (
          <p className="text-xs text-gray-400 italic">
            Kerro chatissa mitä kierrätät — valinnat ilmestyvät tähän.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {cartMaterials.map((m) => (
              <div
                key={m.code}
                className="flex aspect-square flex-col items-center justify-center rounded-sm px-2 py-2 text-center text-white ring-4 ring-yellow-400"
                style={{
                  backgroundColor: m.baseHex
                    ? hexToRgba(m.baseHex, 1)
                    : "#4b5563",
                }}
              >
                <div className="mb-2 transform scale-125">
                  {m.icon ?? <RecycleIcon />}
                </div>
                <span className="text-sm">{m.name}</span>
              </div>
            ))}
          </div>
        )}

        {preparationTips.length > 0 && (
          <ul className="flex flex-col gap-1.5 border-t border-gray-200 pt-3">
            {preparationTips.map((t) => (
              <li
                key={t.materialName}
                className="text-xs text-gray-600 flex gap-1.5"
              >
                <span className="font-semibold shrink-0">{t.materialName}:</span>
                <span>{t.tip}</span>
              </li>
            ))}
          </ul>
        )}

        {cartCodes.length > 0 && (
          <Button asChild size="lg" className="w-full mt-1">
            <Link href={resultsHref}>
              Lähde kierrättämään
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
};
