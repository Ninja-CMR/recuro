// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { Resend } from "npm:resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders
    })
  }

  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Tous les champs sont requis" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const { data, error } = await resend.emails.send({
      from: 'Recuro Contact <onboarding@resend.dev>',
      to: ['oliviermevaa0@gmail.com'],
      subject: `Nouveau message de contact : ${name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e40af; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Nouveau message de contact</h2>
          <div style="margin-top: 20px;">
            <p><strong>Nom :</strong> ${name}</p>
            <p><strong>Email :</strong> ${email}</p>
            <p><strong>Message :</strong></p>
            <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin-top: 10px; white-space: pre-wrap;">
              ${message}
            </div>
          </div>
          <p style="margin-top: 30px; color: #64748b; font-size: 0.875rem; border-top: 1px solid #e2e8f0; pt-15px;">
            Cet email a été envoyé depuis le formulaire de contact de Recuro.
          </p>
        </div>
      `
    })

    if (error) throw error

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
