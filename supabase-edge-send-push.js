// ============================================================
// Supabase Edge Function: send-push
// ============================================================
// 1. Supabase Dashboard → Edge Functions → New Function → "send-push"
// 2. ჩასვი ეს კოდი
// 3. Secrets-ში დაამატე:
//    VAPID_PRIVATE_KEY = (npx web-push generate-vapid-keys-ის private key)
//    VAPID_PUBLIC_KEY  = (npx web-push generate-vapid-keys-ის public key)
//    VAPID_EMAIL       = mailto:studiasenaki@proton.me
// ============================================================

import webpush from 'npm:web-push@3.6.7';

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_EMAIL = Deno.env.get('VAPID_EMAIL') ?? 'mailto:studiasenaki@proton.me';

webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { payload, subscriptions } = await req.json();

    if (!payload || !subscriptions || subscriptions.length === 0) {
      return new Response(JSON.stringify({ error: 'Missing payload or subscriptions' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const results = await Promise.allSettled(
      subscriptions.map((sub) => webpush.sendNotification(sub, payload))
    );

    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return new Response(JSON.stringify({ sent, failed, total: subscriptions.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
