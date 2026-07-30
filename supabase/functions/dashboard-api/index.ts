import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const url = new URL(req.url);
  const path = url.pathname.replace("/functions/v1/dashboard-api", "");

  try {
    // GET /provider-status — status of all providers
    if (req.method === "GET" && path === "/provider-status") {
      const { data, error } = await supabase
        .from("provider_status")
        .select("*, provider:providers(name, slug, logo_url, website)")
        .order("updated_at", { ascending: false });

      if (error) throw new Error(error.message);
      return jsonResponse(data);
    }

    // GET /last-sync — most recent sync run
    if (req.method === "GET" && path === "/last-sync") {
      const { data, error } = await supabase
        .from("sync_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw new Error(error.message);
      return jsonResponse(data);
    }

    // GET /imported-today — count of listings imported today
    if (req.method === "GET" && path === "/imported-today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart.toISOString());

      if (error) throw new Error(error.message);
      return jsonResponse({ count: count ?? 0 });
    }

    // GET /listings-today — count of listings first seen today
    if (req.method === "GET" && path === "/listings-today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .gte("first_seen_at", todayStart.toISOString());

      if (error) throw new Error(error.message);
      return jsonResponse({ count: count ?? 0 });
    }

    // GET /price-changes-today — count of price changes today
    if (req.method === "GET" && path === "/price-changes-today") {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count, error } = await supabase
        .from("price_history")
        .select("id", { count: "exact", head: true })
        .gte("detected_at", todayStart.toISOString());

      if (error) throw new Error(error.message);
      return jsonResponse({ count: count ?? 0 });
    }

    // GET /recent-logs — recent sync logs
    if (req.method === "GET" && path === "/recent-logs") {
      const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
      const { data, error } = await supabase
        .from("sync_logs")
        .select("*, provider:providers(name, slug)")
        .order("started_at", { ascending: false })
        .limit(limit);

      if (error) throw new Error(error.message);
      return jsonResponse(data);
    }

    // GET / — aggregated dashboard data
    if (req.method === "GET" && (path === "" || path === "/")) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const [providerStatus, lastSync, recentLogs, importedToday, listingsToday, priceChangesToday] =
        await Promise.all([
          supabase.from("provider_status").select("*, provider:providers(name, slug, logo_url, website)").order("updated_at", { ascending: false }),
          supabase.from("sync_runs").select("*").order("started_at", { ascending: false }).limit(1).maybeSingle(),
          supabase.from("sync_logs").select("*, provider:providers(name, slug)").order("started_at", { ascending: false }).limit(10),
          supabase.from("listings").select("id", { count: "exact", head: true }).gte("created_at", todayStart.toISOString()),
          supabase.from("listings").select("id", { count: "exact", head: true }).gte("first_seen_at", todayStart.toISOString()),
          supabase.from("price_history").select("id", { count: "exact", head: true }).gte("detected_at", todayStart.toISOString()),
        ]);

      return jsonResponse({
        providerStatus: providerStatus.data ?? [],
        lastSync: lastSync.data,
        importedToday: importedToday.count ?? 0,
        listingsToday: listingsToday.count ?? 0,
        priceChangesToday: priceChangesToday.count ?? 0,
        recentLogs: recentLogs.data ?? [],
      });
    }

    return jsonResponse({ error: "Not found" }, 404);
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : "Unknown error" },
      500,
    );
  }
});

function jsonResponse(data: unknown, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
