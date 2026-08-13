import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function subscribeEmail(email: string) {
  const { error } = await supabaseAdmin.from("newsletter_subscribers").insert({ email });

  if (error) {
    // Duplicate email: treat as success, do not leak details to the client.
    if (error.code === "23505") return { ok: true as const, alreadySubscribed: true };
    console.error("[newsletter] insert failed", error);
    throw new Error("Could not subscribe");
  }

  return { ok: true as const, alreadySubscribed: false };
}
