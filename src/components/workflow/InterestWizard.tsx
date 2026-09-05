import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Interest, InterestInput, OccupationType } from "@/lib/workflow/types";

const occupationTypes = [
  "Working Professional",
  "Student",
  "Business",
  "Family",
  "Other",
] as const satisfies readonly OccupationType[];

export const interestDraftSchema = z.object({
  moveInDate: z.string().trim().min(1, "Choose your expected move-in date."),
  occupants: z.coerce.number().int().positive("Enter at least one occupant."),
  occupationType: z.enum(occupationTypes, { required_error: "Tell us a little about yourself." }),
  leasePreference: z.string(),
  message: z.string(),
});

type InterestDraft = z.infer<typeof interestDraftSchema>;

type InterestPrefill = Pick<
  Interest,
  "moveInDate" | "occupants" | "occupationType" | "leasePreference"
>;

type InterestWizardProps = {
  propertyId: string;
  propertyTitle: string;
  recentInterest: InterestPrefill | undefined;
  isSubmitting: boolean;
  onSubmit: (input: InterestInput) => Promise<Interest>;
  onSubmitted: (interest: Interest) => void;
};

function draftStorageKey(propertyId: string) {
  return `bricxley.interest-draft.v1.${propertyId}`;
}

function readDraft(propertyId: string): Partial<InterestDraft> | undefined {
  if (typeof window === "undefined") return undefined;

  try {
    const stored = window.sessionStorage.getItem(draftStorageKey(propertyId));
    if (!stored) return undefined;
    const parsed: unknown = JSON.parse(stored);
    return typeof parsed === "object" && parsed !== null
      ? (parsed as Partial<InterestDraft>)
      : undefined;
  } catch {
    return undefined;
  }
}

export function getInitialInterestDraft(
  sessionDraft: Partial<InterestDraft> | undefined,
  recentInterest: InterestPrefill | undefined,
) {
  const previousValues = recentInterest
    ? {
        moveInDate: recentInterest.moveInDate,
        occupants: recentInterest.occupants,
        occupationType: recentInterest.occupationType,
        leasePreference: recentInterest.leasePreference ?? "",
      }
    : {};

  return {
    moveInDate: "",
    occupants: 1,
    leasePreference: "",
    message: "",
    ...previousValues,
    ...sessionDraft,
  };
}

export function getInterestSubmitLabel(isSubmitting: boolean) {
  return isSubmitting ? "Sending…" : "Send Interest";
}

export function InterestWizard({
  propertyId,
  propertyTitle,
  recentInterest,
  isSubmitting,
  onSubmit,
  onSubmitted,
}: InterestWizardProps) {
  const [step, setStep] = useState(1);
  const form = useForm<InterestDraft>({
    resolver: zodResolver(interestDraftSchema),
    defaultValues: getInitialInterestDraft(readDraft(propertyId), recentInterest),
  });
  const { errors } = form.formState;

  useEffect(() => {
    const subscription = form.watch((draft, { name }) => {
      if (name && typeof window !== "undefined") {
        window.sessionStorage.setItem(draftStorageKey(propertyId), JSON.stringify(draft));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, propertyId]);

  useEffect(() => {
    if (readDraft(propertyId)) return;
    form.reset(getInitialInterestDraft(undefined, recentInterest));
  }, [form, propertyId, recentInterest]);

  const moveToPreferences = async () => {
    const valid = await form.trigger(["moveInDate", "occupants", "occupationType"]);
    if (valid) setStep(2);
  };

  const moveToReview = async () => {
    const valid = await form.trigger();
    if (valid) setStep(3);
  };

  const submit = form.handleSubmit(async (draft: InterestDraft) => {
    try {
      const interest = await onSubmit({ propertyId, ...draft });
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(draftStorageKey(propertyId));
      }
      onSubmitted(interest);
    } catch {
      // The route surfaces the mutation error without discarding the saved draft.
    }
  });

  return (
    <form onSubmit={submit} className="surface-card p-5 sm:p-6" noValidate>
      <ol
        className="mb-6 flex items-center text-sm font-semibold"
        aria-label="Interest form progress"
      >
        {["Your Details", "Preferences", "Review"].map((label, index) => {
          const number = index + 1;
          return (
            <li
              key={label}
              className="flex min-w-0 flex-1 items-center last:flex-none"
              aria-current={step === number ? "step" : undefined}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                  step >= number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {number}
              </span>
              <span className="ml-2 hidden truncate sm:inline">{label}</span>
              {number < 3 ? <span className="mx-2 h-px flex-1 bg-border" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>
      <p id="interest-submit-status" className="sr-only" role="status" aria-live="polite">
        {isSubmitting ? "Sending your interest" : ""}
      </p>

      {step === 1 ? (
        <section
          key="details"
          aria-labelledby="interest-details-title"
          className="space-y-5 motion-safe:animate-step-in"
        >
          <div>
            <h2 id="interest-details-title" className="text-lg font-bold">
              Your details
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Just enough to help the owner review your request.
            </p>
          </div>
          <FieldError error={errors.moveInDate?.message}>
            <Label htmlFor="move-in-date">Expected move-in date</Label>
            <Input
              id="move-in-date"
              type="date"
              className="mt-1.5"
              disabled={isSubmitting}
              {...form.register("moveInDate")}
            />
          </FieldError>
          <FieldError error={errors.occupants?.message}>
            <Label htmlFor="occupants">Number of occupants</Label>
            <Input
              id="occupants"
              type="number"
              min={1}
              className="mt-1.5"
              disabled={isSubmitting}
              {...form.register("occupants", { valueAsNumber: true })}
            />
          </FieldError>
          <FieldError error={errors.occupationType?.message}>
            <Label htmlFor="occupation-type">About you</Label>
            <select
              id="occupation-type"
              className="mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              disabled={isSubmitting}
              {...form.register("occupationType")}
            >
              <option value="">Select one</option>
              {occupationTypes.map((occupation) => (
                <option key={occupation} value={occupation}>
                  {occupation}
                </option>
              ))}
            </select>
          </FieldError>
          <Button
            type="button"
            className="w-full sm:w-auto"
            disabled={isSubmitting}
            onClick={moveToPreferences}
          >
            Next →
          </Button>
        </section>
      ) : null}

      {step === 2 ? (
        <section
          key="preferences"
          aria-labelledby="interest-preferences-title"
          className="space-y-5 motion-safe:animate-step-in"
        >
          <div>
            <h2 id="interest-preferences-title" className="text-lg font-bold">
              Preferences
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">These details are optional.</p>
          </div>
          <div>
            <Label htmlFor="lease-preference">
              Preferred lease duration <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="lease-preference"
              className="mt-1.5"
              placeholder="For example, 11 months"
              disabled={isSubmitting}
              {...form.register("leasePreference")}
            />
          </div>
          <div>
            <Label htmlFor="interest-message">
              Message to the owner <span className="text-muted-foreground">(optional)</span>
            </Label>
            <textarea
              id="interest-message"
              className="mt-1.5 min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Anything useful for the owner to know?"
              disabled={isSubmitting}
              {...form.register("message")}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setStep(1)}
            >
              ← Back
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={moveToReview}>
              Review →
            </Button>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section
          key="review"
          aria-labelledby="interest-review-title"
          className="space-y-5 motion-safe:animate-step-in"
        >
          <div>
            <h2 id="interest-review-title" className="text-lg font-bold">
              Review your interest
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The owner will receive only these details.
            </p>
          </div>
          <dl className="divide-y divide-border rounded-xl border border-border text-sm">
            <ReviewRow label="Property" value={propertyTitle} />
            <ReviewRow label="Move-in" value={form.getValues("moveInDate")} />
            <ReviewRow label="Occupants" value={String(form.getValues("occupants"))} />
            <ReviewRow label="About you" value={form.getValues("occupationType")} />
            <ReviewRow
              label="Lease preference"
              value={form.getValues("leasePreference") || "Not specified"}
            />
            <ReviewRow label="Message" value={form.getValues("message") || "Not specified"} />
          </dl>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setStep(2)}
            >
              ← Back
            </Button>
            <Button type="submit" disabled={isSubmitting} aria-describedby="interest-submit-status">
              {getInterestSubmitLabel(isSubmitting)}
            </Button>
          </div>
        </section>
      ) : null}
    </form>
  );
}

function FieldError({ children, error }: { children: React.ReactNode; error: string | undefined }) {
  return (
    <div>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="flex gap-4 px-4 py-3">
      <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
