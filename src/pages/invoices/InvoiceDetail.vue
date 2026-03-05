<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoice'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import { FileDown, Edit, ArrowLeft, Send, CheckCircle } from 'lucide-vue-next'
import { generatePdf } from '@/services/pdfService'

import { mailService } from '@/services/mailService'

const route = useRoute()
const router = useRouter()
const invoiceStore = useInvoiceStore()
const invoice = ref<any>(null)
const loading = ref(true)
const sendingEmail = ref(false)

onMounted(async () => {
  const id = route.params.id as string
  const { data, error } = await invoiceStore.fetchInvoiceById(id)
  if (error) {
    alert('Erreur lors du chargement de la facture')
    router.push('/invoices')
    return
  }
  invoice.value = data
  loading.value = false
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'sent':
      return 'bg-blue-100 text-blue-800'
    case 'overdue':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'paid':
      return 'Payée'
    case 'sent':
      return 'Envoyée'
    case 'overdue':
      return 'En retard'
    default:
      return 'Brouillon'
  }
}

const handleDownloadPdf = () => {
  if (invoice.value) {
    generatePdf(invoice.value)
  }
}

const handleMarkAsPaid = async () => {
  if (!invoice.value) return
  const { data, error } = await invoiceStore.updateInvoice(invoice.value.id, { status: 'paid' }, invoice.value.invoice_items)
  if (!error && data) {
    invoice.value.status = 'paid'
  } else {
    alert('Erreur: ' + error)
  }
}

const handleSendInvoice = async () => {
  if (!invoice.value) return
  
  const client = invoice.value.client
  if (!client) return alert('Client non trouvé')
  
  const method = client.preferred_method || 'email'
  const invoiceId = invoice.value.id.split('-')[0].toUpperCase()
  const amount = invoice.value.total_amount.toFixed(2)
  const message = `Bonjour ${client.name},\n\nVoici votre facture #${invoiceId} d'un montant de ${amount} €. \n\nVous pouvez nous contacter pour toute question.\n\nMerci pour votre confiance !\n\nL'équipe RECURO`
  
  // Mark as sent in DB
  if (invoice.value.status === 'draft') {
    const { error } = await invoiceStore.updateInvoice(invoice.value.id, { status: 'sent' }, invoice.value.invoice_items)
    if (!error) invoice.value.status = 'sent'
  }

  if (method === 'email') {
    sendingEmail.value = true
    const { data, error } = await mailService.sendInvoice({
      to: client.email,
      subject: `Facture #${invoiceId} - RECURO`,
      invoiceData: invoice.value
    })
    sendingEmail.value = false

    if (error) {
       // Fallback to mailto if Edge function fails or is not deployed
       console.warn('Edge function failed, falling back to mailto:', error)
       const subject = encodeURIComponent(`Facture #${invoiceId} - RECURO`)
       const body = encodeURIComponent(message)
       window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`
    } else {
       alert('Facture envoyée avec succès via Resend !')
    }

  } else if (method === 'whatsapp') {
    if (!client.phone) return alert('Numéro de téléphone requis pour WhatsApp')
    const text = encodeURIComponent(message)
    const cleanPhone = client.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
  } else if (method === 'iphone') {
    if (!client.phone) return alert('Numéro de téléphone requis pour iPhone')
    const body = encodeURIComponent(message)
    const cleanPhone = client.phone.replace(/\D/g, '')
    window.location.href = `sms:${cleanPhone}&body=${body}`
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    <div class="flex items-center justify-between">
      <Button variant="ghost" @click="router.push('/invoices')" class="-ml-2">
        <ArrowLeft class="w-4 h-4 mr-2" />
        Retour aux factures
      </Button>
      <div class="flex gap-2">
        <Button variant="outline" @click="router.push(`/invoices/${invoice?.id}/edit`)">
          <Edit class="w-4 h-4 mr-2" />
          Modifier
        </Button>
        <Button @click="handleDownloadPdf">
          <FileDown class="w-4 h-4 mr-2" />
          PDF
        </Button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <p class="text-muted-foreground">Chargement...</p>
    </div>

    <template v-else-if="invoice">
      <div class="grid gap-6 md:grid-cols-3">
        <!-- Status & Actions -->
        <Card class="p-6 space-y-6 h-fit">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-2">Statut</h3>
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusBadgeClass(invoice.status)]">
              {{ getStatusLabel(invoice.status) }}
            </span>
          </div>

          <div class="pt-4 border-t space-y-2">
            <Button v-if="invoice.status !== 'paid'" class="w-full justify-start" variant="outline" @click="handleMarkAsPaid">
              <CheckCircle class="w-4 h-4 mr-2" />
              Marquer comme payée
            </Button>
            <Button class="w-full justify-start" variant="outline" @click="handleSendInvoice" :disabled="sendingEmail">
              <Send class="w-4 h-4 mr-2" />
              {{ sendingEmail ? 'Envoi...' : 'Renvoyer au client' }}
            </Button>
          </div>
        </Card>

        <!-- Invoice Details -->
        <Card class="md:col-span-2 p-8 space-y-8">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold">Facture #{{ invoice.id.split('-')[0].toUpperCase() }}</h1>
              <p class="text-muted-foreground">Émise le {{ formatDate(invoice.issue_date) }}</p>
            </div>
            <div class="text-right">
              <div class="text-xl font-black text-primary">RECURO</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8 py-8 border-y">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">De</h3>
              <p class="font-semibold">Votre Entreprise</p>
              <p class="text-sm text-muted-foreground">contact@votreentreprise.com</p>
            </div>
            <div class="text-right">
              <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">À</h3>
              <p class="font-semibold">{{ invoice.client?.name }}</p>
              <p class="text-sm text-muted-foreground">{{ invoice.client?.email }}</p>
            </div>
          </div>

          <div>
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                  <th class="pb-3 text-left">Description</th>
                  <th class="pb-3 text-center w-20">Qté</th>
                  <th class="pb-3 text-right w-32">Prix Unitaire</th>
                  <th class="pb-3 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="item in invoice.invoice_items" :key="item.id">
                  <td class="py-4 text-sm">{{ item.description }}</td>
                  <td class="py-4 text-sm text-center">{{ item.quantity }}</td>
                  <td class="py-4 text-sm text-right">{{ item.unit_price.toFixed(2) }} €</td>
                  <td class="py-4 text-sm text-right font-medium">{{ (item.quantity * item.unit_price).toFixed(2) }} €</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end pt-4">
            <div class="w-64 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Sous-total</span>
                <span>{{ invoice.total_amount.toFixed(2) }} €</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">TVA (0%)</span>
                <span>0.00 €</span>
              </div>
              <div class="flex justify-between border-t pt-2 text-lg font-bold">
                <span>Total</span>
                <span class="text-primary">{{ invoice.total_amount.toFixed(2) }} €</span>
              </div>
            </div>
          </div>

          <div class="pt-8 text-xs text-muted-foreground border-t">
            <p>Date d'échéance : {{ formatDate(invoice.due_date) }}</p>
            <p class="mt-2">Merci pour votre confiance. En cas de question, n'hésitez pas à nous contacter.</p>
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>
