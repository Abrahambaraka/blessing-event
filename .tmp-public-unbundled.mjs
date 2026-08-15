import { json } from "../_lib/auth";
import { assertSupabaseAdmin } from "../_lib/supabaseAdmin";
async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { error: "Method not allowed" });
  }
  try {
    const admin = assertSupabaseAdmin();
    const slug = typeof req.query.slug === "string" ? req.query.slug : void 0;
    let query = admin.from("be_events").select("data").eq("status", "published").order("updated_at", { ascending: false });
    if (slug) {
      query = query.eq("slug", slug);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    const events = (data ?? []).map((r) => r.data);
    if (slug && events.length === 0) {
      const { data: byId, error: idError } = await admin.from("be_events").select("data").eq("status", "published").eq("id", slug).maybeSingle();
      if (idError) throw new Error(idError.message);
      if (byId) {
        return json(res, 200, { events: [byId.data] });
      }
    }
    return json(res, 200, { events });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur chargement \xE9v\xE9nements.";
    return json(res, 500, { error: message });
  }
}
export {
  handler as default
};
