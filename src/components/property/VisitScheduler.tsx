import { useState } from "react";
import { CalendarCheck, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const slots = [
  { value: "09:00", label: "09:00 – 11:00" },
  { value: "11:00", label: "11:00 – 13:00" },
  { value: "13:00", label: "13:00 – 15:00" },
  { value: "15:00", label: "15:00 – 17:00" },
  { value: "17:00", label: "17:00 – 19:00" },
];

export function getVisitStartTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

type VisitSchedulerProps = {
  propertyTitle: string;
  onRequest?: (scheduledAt: string) => Promise<void>;
  isRequesting?: boolean;
};

export function VisitScheduler({
  propertyTitle,
  onRequest,
  isRequesting = false,
}: VisitSchedulerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setConfirmed(false);
  };

  const handleSubmitted = async (date: string, time: string) => {
    try {
      await onRequest?.(getVisitStartTime(date, time));
      setConfirmed(true);
      toast.success("Visit request sent", {
        description: "The listing manager can confirm the proposed time in Bricxley.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We couldn't request this visit.");
    }
  };

  const trigger = (
    <Button variant="outline" size="lg" className="w-full">
      <CalendarCheck className="h-4 w-4" />
      Schedule visit
    </Button>
  );
  const form = (
    <VisitRequestForm
      confirmed={confirmed}
      isRequesting={isRequesting}
      onClose={() => onOpenChange(false)}
      onSubmitted={handleSubmitted}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerTrigger asChild>{trigger}</DrawerTrigger>
        <DrawerContent className="max-h-[90vh] overflow-y-auto px-5 pb-6">
          <DrawerHeader className="px-0 text-left">
            <DrawerTitle>Schedule a visit</DrawerTitle>
            <DrawerDescription>{propertyTitle}</DrawerDescription>
          </DrawerHeader>
          {form}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a visit</DialogTitle>
          <DialogDescription>{propertyTitle}</DialogDescription>
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}

function VisitRequestForm({
  confirmed,
  isRequesting,
  onClose,
  onSubmitted,
}: {
  confirmed: boolean;
  isRequesting: boolean;
  onClose: () => void;
  onSubmitted: (date: string, time: string) => Promise<void>;
}) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(slots[0]?.value ?? "");

  if (confirmed) {
    return (
      <div className="space-y-5 py-6 text-center motion-safe:animate-step-in" role="status">
        <CheckCircle2
          className="mx-auto h-10 w-10 text-verified motion-safe:animate-badge-pop"
          aria-hidden
        />
        <div>
          <h3 className="text-lg font-bold">Visit request sent</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            The listing manager will confirm your selected time in the visits dashboard.
          </p>
        </div>
        <Button type="button" className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmitted(date, slot);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="visit-date">Date</Label>
          <Input
            id="visit-date"
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
            disabled={isRequesting}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="visit-slot">Preferred time</Label>
          <Select value={slot} onValueChange={setSlot} disabled={isRequesting} required>
            <SelectTrigger id="visit-slot">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {slots.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl bg-verified/10 p-3.5">
        <p className="flex items-center gap-2 text-sm font-bold text-verified">
          <ShieldCheck className="h-4 w-4" aria-hidden /> ₹0 viewing fee
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Bricxley does not require tenants to pay money simply to view a property.
        </p>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={isRequesting}>
        {isRequesting ? "Requesting…" : "Request visit"}
      </Button>
    </form>
  );
}
