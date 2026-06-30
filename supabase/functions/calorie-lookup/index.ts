import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { food, qty } = await req.json();

    if (!food || !qty) {
      return new Response(JSON.stringify({ error: "food və qty tələb olunur" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) throw new Error("ANTHROPIC_API_KEY tapılmadı");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `"${food}" adlı qida üçün ${qty}q/ml-ə düşən ortalama qiymətlər ver. Azərbaycan, türk və ingilis adlarını tanı. Yalnız JSON formatında cavab ver, başqa heç nə yazma, markdown işlətmə:
{"kcal":NUMBER,"protein":NUMBER,"carbs":NUMBER,"fat":NUMBER,"name_az":"STRING"}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic xətası: ${err}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "";
    const match = text.match(/\{[\s\S]*?\}/);
    if (!match) throw new Error("JSON parse xətası");

    const result = JSON.parse(match[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});