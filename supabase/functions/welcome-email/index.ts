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
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { record } = await req.json()
        const email = record.email
        const fullName = record.raw_user_meta_data?.full_name || record.full_name || 'utilisateur'

        if (!email) {
            console.error("No email provided in record:", record)
            return new Response(JSON.stringify({ error: "No email provided" }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            })
        }

        const { data, error } = await resend.emails.send({
            from: 'Recuro <onboarding@resend.dev>',
            to: [email],
            subject: "Bienvenue sur Recuro !",
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1e40af;">Bienvenue sur Recuro, ${fullName} !</h1>
          <p>Nous sommes ravis de vous compter parmi nous.</p>
          <p>Recuro vous aide à gérer vos factures et vos clients en toute simplicité.</p>
          <div style="margin-top: 30px;">
            <a href="https://recuro.vercel.app/dashboard" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Accéder à mon tableau de bord</a>
          </div>
          <p style="margin-top: 40px; color: #64748b; font-size: 0.875rem;">
            Si vous n'avez pas créé de compte, vous pouvez ignorer cet email.
          </p>
        </div>
      `
        })

        if (error) throw error

        return new Response(JSON.stringify(data), {
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
