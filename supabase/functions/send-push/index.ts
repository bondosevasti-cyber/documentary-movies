import { serve } from "https://deno.land/std@0.131.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import webpush from "https://esm.sh/web-push"

serve(async (req) => {
  // CORS-ის მოგვარება (რომ ბრაუზერიდან გამოძახება შევძლოთ)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { title, body, icon, url, image } = await req.json()

    // VAPID keys are stored in Supabase Edge Function Secrets (never in source code)
    const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY') ?? ''
    const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY') ?? ''

    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return new Response(JSON.stringify({ error: 'VAPID keys not configured in Edge Function secrets.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    webpush.setVapidDetails(
      'mailto:contact@cyron.dev',
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    )

    // 2. Supabase-თან დაკავშირება (ბაზიდან სუბსკრიფციების ამოსაღებად)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 3. ყველა გამომწერის წამოღება ბაზიდან
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) throw error

    // 4. შეტყობინებების დაგზავნა ყველასთან
    const notifications = subscriptions.map((sub) => {
      const payload = JSON.stringify({ title, body, icon, url, image: image || null })
      return webpush.sendNotification(sub.subscription_data, payload)
        .catch((err) => console.error('Error sending push:', err))
    })

    await Promise.all(notifications)

    return new Response(JSON.stringify({ success: true, count: subscriptions.length }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    })
  }
})