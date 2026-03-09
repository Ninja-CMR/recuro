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
    const { to, subject, invoice } = await req.json()

    const { data, error } = await resend.emails.send({
      from: 'Recuro <onboarding@resend.dev>', // Update with your verified sender
      to: [to],
      subject: subject || `Facture #${invoice.id.split('-')[0].toUpperCase()} - RECURO`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            <h1 style="color: #1e40af; margin: 0;">RECURO</h1>
            <div style="text-align: right; color: #64748b; font-size: 0.875rem;">
              Facture #${invoice.id.split('-')[0].toUpperCase()}
            </div>
          </div>
          <div style="margin-bottom: 30px;">
            <p style="font-size: 1.125rem; color: #1e293b;">Bonjour <strong>${invoice.client?.name || 'Client'}</strong>,</p>
            <p style="color: #475569; line-height: 1.6;">
              Veuillez trouver ci-joint votre facture d'un montant de <strong>${invoice.total_amount.toFixed(2)} €</strong>.
            </p>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f8fafc; text-align: left;">
                <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 0.75rem; text-transform: uppercase;">Description</th>
                <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 0.75rem; text-transform: uppercase; text-align: center;">Qté</th>
                <th style="padding: 12px; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 0.75rem; text-transform: uppercase; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.invoice_items?.map((item: any) => `
                <tr>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155;">${item.description}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; color: #334155; text-align: right;">${(item.quantity * item.unit_price).toFixed(2)} €</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; color: #1e293b;">Total</td>
                <td style="padding: 12px; text-align: right; font-weight: bold; color: #1e40af; font-size: 1.25rem;">${invoice.total_amount.toFixed(2)} €</td>
              </tr>
            </tfoot>
          </table>
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; margin-bottom: 30px;">
            <p style="margin: 0; color: #1e40af; font-size: 0.875rem;">
              <strong>Date d'échéance :</strong> ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div style="text-align: center; color: #94a3b8; font-size: 0.75rem; border-top: 1px solid #f1f5f9; pt: 20px;">
            <p>Merci pour votre confiance !</p>
            <p>L'équipe Recuro</p>
          </div>
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
