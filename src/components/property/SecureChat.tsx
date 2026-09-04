import { useState } from "react";
import { Lock, MessagesSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { presetChatQuestions } from "@/data/properties";

type Msg = { role: "you" | "them"; text: string };

export function SecureChat({ listerLabel }: { listerLabel: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "you", text },
      {
        role: "them",
        text: "Message delivered through Bricxley chat. In the live product the owner or agent replies here — your phone number stays private until you choose to share it.",
      },
    ]);
    setInput("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <MessagesSquare className="h-4 w-4" />
          Start Secure Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bricxley Chat</DialogTitle>
          <DialogDescription>
            You’re messaging {listerLabel}. Numbers are never revealed automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl bg-muted/60 p-3">
          {messages.length === 0 ? (
            <p className="p-4 text-center text-sm text-muted-foreground">
              Pick a question below to start the conversation.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "you"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2 text-sm text-primary-foreground"
                    : "max-w-[90%] rounded-2xl rounded-bl-md bg-card px-3.5 py-2 text-sm"
                }
              >
                {m.text}
              </div>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {presetChatQuestions.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-primary hover:text-primary"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Write a message…"
          />
          <Button type="submit" size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </form>

        <p className="flex gap-2 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Phone numbers can be exchanged later, only when both sides agree.
        </p>
      </DialogContent>
    </Dialog>
  );
}
