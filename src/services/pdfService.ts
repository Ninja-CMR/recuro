import type { Invoice } from '@/types'

export const generatePdf = (invoice: Invoice) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return alert('Pop-up bloqué')

  const html = `
    <html>
      <head>
        <title>Facture ${invoice.id}</title>
        <style>
          body { font-family: sans-serif; padding: 40px; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          h1 { margin: 0; }
          .meta { text-align: right; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border-bottom: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background: #f9f9f9; }
          .total { text-align: right; margin-top: 20px; font-size: 1.2em; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Recuro</h1>
            <p>Facture #${invoice.id.slice(0, 8)}</p>
          </div>
          <div class="meta">
            <p>Date: ${new Date(invoice.issue_date).toLocaleDateString()}</p>
            <p>Échéance: ${new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>
        
        <p><strong>Client:</strong> ${invoice.client?.name || invoice.client_id} </p>
        <p>${invoice.client?.address || ''}</p>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qté</th>
              <th>Prix U.</th>
              <th>Montant</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Service principal (Détails non chargés)</td>
              <td>1</td>
              <td>${invoice.total_amount} €</td>
              <td>${invoice.total_amount} €</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          Total: ${invoice.total_amount} €
        </div>

        <script>
          window.print();
        </script>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
}
