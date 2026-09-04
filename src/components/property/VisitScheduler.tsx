import { useState } from "react";
import { CalendarCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const slots = ["09:00 – 11:00", "11:00 – 13:00", "13:00 – 15:00", "15:00 – 17:00", "17:00 – 19:00"];

export function VisitScheduler({ propertyTitle }: { propertyTitle: string }) {
  const [open, setOpen] = useState(false);
  const [slot, setSlot] = useState<string>(slots[0] ?? "");
  const [visitors, setVisitors] = useState("1");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <CalendarCheck className="h-4 w-4" />
          Schedule Visit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a visit</DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            toast.success("Visit request sent", {
              description: "You’ll see the confirmation in your tenant dashboard.",
            });
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="visit-date">Date</Label>
              <Input id="visit-date" type="date" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="visit-slot">Time slot</Label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger id="visit-slot">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visitors">Number of visitors</Label>
            <Select value={visitors} onValueChange={setVisitors}>
              <SelectTrigger id="visitors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4"].map((v) => (
                  <SelectItem key={v} value={v}>
                    {v}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="visit-message">Message (optional)</Label>
            <Textarea id="visit-message" placeholder="Anything the owner should know?" rows={3} />
          </div>

          <div className="rounded-xl bg-verified/10 p-3.5">
            <p className="flex items-center gap-2 text-sm font-bold text-verified">
              <ShieldCheck className="h-4 w-4" aria-hidden /> ₹0 viewing fee
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Bricxley does not require tenants to pay money simply to view a property.
            </p>
          </div>

          <Button type="submit" className="w-full" size="lg">
            Request Visit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
