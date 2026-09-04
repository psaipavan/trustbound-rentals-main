import { useState } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export const boundAiExamples = [
  "Find me a 2BHK under ₹35,000 near Financial District.",
  "I work at Knowledge City. Where should I live?",
  "Compare these three apartments.",
  "Which of my saved homes has the lowest total monthly cost?",
  "Find owner-direct homes near Gachibowli.",
];

type Msg = { role: "user" | "ai"; text: string };

export function BoundAiLauncher() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hi, I’m Bound AI. I can help you shortlist homes and understand localities. This is a design preview — answers are illustrative and not verified facts.",
    },
  ]);

  const ask = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      {
        role: "ai",
        text: "In the live product I’ll answer this using verified listing data, your saved homes and locality insights. For now, this preview doesn’t generate results — browse the verified rentals to explore matching homes.",
      },
    ]);
    setInput("");
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="lg"
        className="fixed bottom-5 right-5 z-40 rounded-full shadow-[var(--shadow-lift)]"
      >
        <Sparkles className="h-4 w-4" />
        Bound AI
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex w-full flex-col p-6 sm:max-w-md">
          <SheetHeader className="p-0 text-left">
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden /> Bound AI
            </SheetTitle>
            <SheetDescription>
              Preview assistant. Responses are illustrative and should not be treated as verified
              facts.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-5 flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                    : "max-w-[90%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm"
                }
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Try asking
            </p>
            <div className="flex flex-wrap gap-2">
              {boundAiExamples.slice(0, 3).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => ask(q)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs transition hover:border-primary hover:text-primary"
                >
                  {q}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2 pt-2"
              onSubmit={(e) => {
                e.preventDefault();
                ask(input);
              }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about homes or localities…"
              />
              <Button type="submit" size="icon" aria-label="Send">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
