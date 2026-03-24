import type { Invoice, InvoiceItem } from '@/types'

export const generatePdf = (invoice: Invoice & { invoice_items?: InvoiceItem[], currency?: string }, profile?: any) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return alert('Pop-up bloqué')

  const currencyMap: Record<string, string> = {
    'EUR': '€',
    'USD': '$',
    'XOF': 'FCFA',
    'JPY': '¥'
  }
  const symbol = currencyMap[invoice.currency || 'EUR'] || '€'

  const itemsHtml = invoice.invoice_items && invoice.invoice_items.length > 0 ? invoice.invoice_items.map(item => `
    <tr>
      <td>${item.description}</td>
      <td style="text-align: center;">${item.quantity}</td>
      <td style="text-align: right;">${item.unit_price} ${symbol}</td>
      <td style="text-align: right;">${(item.quantity * item.unit_price).toFixed(2)} ${symbol}</td>
    </tr>
  `).join('') : `
    <tr>
      <td colspan="4">Aucun article détaillé.</td>
    </tr>
  `

  const html = `
    <html>
      <head>
        <title>Facture ${invoice.id}</title>
        <style>
          body { 
            font-family: sans-serif; 
            padding: 40px; 
            color: #333; 
            line-height: 1.5; 
            position: relative;
          }

          .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          h1 { margin: 0; color: #000; }
          .meta { text-align: right; }
          .company-info { margin-bottom: 30px; }
          .client-info { margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border-bottom: 1px solid #eee; padding: 12px 10px; text-align: left; }
          th { background: #fcfcfc; font-size: 12px; text-transform: uppercase; color: #666; }
          .total { text-align: right; margin-top: 30px; font-size: 1.2em; font-weight: bold; }
          .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 style="color: #000; font-weight: 900; letter-spacing: -1px;">${profile?.company_name || 'RECURO'}</h1>
            <p style="margin: 5px 0 0 0; color: #666;">Facture #${invoice.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div class="meta">
            <p><strong>Date:</strong> ${new Date(invoice.issue_date).toLocaleDateString()}</p>
            <p><strong>Échéance:</strong> ${new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
          <div class="company-info">
            <h3 style="font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 10px;">De</h3>
            <p><strong>${profile?.full_name || profile?.company_name || 'Votre Entreprise'}</strong></p>
            ${profile?.company_name && profile?.full_name ? `<p>${profile.company_name}</p>` : ''}
            <p>${profile?.email || 'contact@votreentreprise.com'}</p>
            ${profile?.address ? `<p>${profile.address}</p>` : ''}
          </div>
          
          <div class="client-info" style="text-align: right;">
            <h3 style="font-size: 10px; text-transform: uppercase; color: #999; margin-bottom: 10px;">À</h3>
            <p><strong>${invoice.client?.name || invoice.client_id}</strong></p>
            <p>${invoice.client?.email || ''}</p>
            <p>${invoice.client?.address || ''}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: center;">Qté</th>
              <th style="text-align: right;">Prix U.</th>
              <th style="text-align: right;">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total">
          Total: ${invoice.total_amount.toFixed(2)} ${symbol}
        </div>

        <div class="footer">
          Merci pour votre confiance.
        </div>

        <script>
          setTimeout(() => { window.print(); }, 500);
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
