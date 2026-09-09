import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { WorkflowActor } from "@/lib/workflow/types";

export type CreatePropertyInput = {
  title: string;
  locality: string;
  propertyType: string;
  monthlyRent: number;
  deposit: number;
  brokerage: number;
  description: string;
  listedAs: "owner" | "agent";
};

export async function createProperty(actor: WorkflowActor, input: CreatePropertyInput) {
  if (actor.role !== input.listedAs) {
    throw new Error(`Switch to your ${input.listedAs} role before creating this listing.`);
  }
  const { data, error } = await getSupabaseBrowserClient().rpc("create_property", {
    p_title: input.title.trim(),
    p_locality: input.locality.trim(),
    p_property_type: input.propertyType,
    p_monthly_rent: input.monthlyRent,
    p_deposit: input.deposit,
    p_brokerage: input.brokerage,
    p_description: input.description.trim() || null,
    p_listed_as: input.listedAs,
  });
  if (error || !data) throw new Error(error?.message || "We couldn't save this listing draft.");
  return data;
}

export type ManagedProperty = {
  id: string;
  title: string;
  locality: string;
  propertyType: string;
  monthlyRent: number;
  brokerage: number;
  status: string;
  listedAs: "owner" | "agent";
};

export async function listManagedProperties(actor: WorkflowActor): Promise<ManagedProperty[]> {
  const { data, error } = await getSupabaseBrowserClient()
    .from("properties")
    .select("id,title,locality,property_type,monthly_rent,brokerage,status,listed_as")
    .eq("manager_id", actor.id)
    .order("updated_at", { ascending: false });
  if (error) throw new Error("We couldn't load your properties.");
  return ((data ?? []) as Array<Record<string, unknown>>).map((row: Record<string, unknown>) => ({
    id: String(row["id"]),
    title: String(row["title"]),
    locality: String(row["locality"]),
    propertyType: String(row["property_type"]),
    monthlyRent: Number(row["monthly_rent"]),
    brokerage: Number(row["brokerage"]),
    status: String(row["status"]),
    listedAs: row["listed_as"] as "owner" | "agent",
  }));
}
