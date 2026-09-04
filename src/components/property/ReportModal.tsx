import { useState } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { reportReasons } from "@/data/properties";

export function ReportModal({ propertyId }: { propertyId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(reportReasons[0] ?? "");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="h-4 w-4" />
          Report Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Report this listing</DialogTitle>
          <DialogDescription>
            Reports go to the In Bound moderation queue for human review. Listings are never removed
            automatically.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
            toast.success("Report submitted for review", {
              description: `Reference: ${propertyId.toUpperCase()} · ${reason}`,
            });
          }}
        >
          <RadioGroup value={reason} onValueChange={setReason} className="space-y-1.5">
            {reportReasons.map((r) => (
              <div key={r} className="flex items-center gap-2.5">
                <RadioGroupItem value={r} id={`reason-${r}`} />
                <Label htmlFor={`reason-${r}`} className="font-normal">
                  {r}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Textarea placeholder="Add any detail that helps moderation (optional)" rows={3} />

          <Button type="submit" className="w-full">
            Submit report
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
