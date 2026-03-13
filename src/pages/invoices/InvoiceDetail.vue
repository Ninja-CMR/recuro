<script setup lang="ts">
import { ref, onMounted , computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoice'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import { FileDown, Edit, ArrowLeft, Send, CheckCircle } from 'lucide-vue-next'
import { generatePdf } from '@/services/pdfService'
import { useSendInvoice } from '@/composables/useSendInvoice'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()
const invoice = ref<any>(null)
const loading = ref(true)
const sendingEmail = ref(false)
const { sendInvoice } = useSendInvoice()

onMounted(async () => {
  const id = route.params.id as string
  const { data, error } = await invoiceStore.fetchInvoiceById(id)
  if (error) {
    alert(t('invoice_detail.err_load'))
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
    case 'paid':    return t('invoice_detail.status_paid')
    case 'sent':    return t('invoice_detail.status_sent')
    case 'overdue': return t('invoice_detail.status_overdue')
    default:        return t('invoice_detail.status_draft')
  }
}

const currentSymbol = computed(() => {
  const currencies = [
    { value: 'EUR', symbol: '€' },
    { value: 'USD', symbol: '$' },
    { value: 'XOF', symbol: 'FCFA' },
    { value: 'JPY', symbol: '¥' }
  ]
  const cur = currencies.find(c => c.value === invoice.value?.currency)
  return cur ? cur.symbol : '€'
})

const handleDownloadPdf = () => {
  if (invoice.value) {
    generatePdf(invoice.value, authStore.userProfile)
  }
}

const handleMarkAsPaid = async () => {
  if (!invoice.value) return
  const { data, error } = await invoiceStore.updateInvoice(invoice.value.id, { status: 'paid' }, invoice.value.invoice_items)
  if (!error && data) {
    invoice.value.status = 'paid'
  } else {
    alert(t('invoice_detail.err_send', { msg: error }))
  }
}

const handleSendInvoice = async () => {
  if (!invoice.value) return
  
  sendingEmail.value = true
  try {
    const result = await sendInvoice(invoice.value)
    if (result.success && !result.manual) {
      alert(t('invoice_detail.success_send'))
    }
    // Update local status if it was sent
    if (invoice.value.status === 'draft') {
      invoice.value.status = 'sent'
    }
  } catch (err: any) {
    alert(t('invoice_detail.err_send', { msg: err.message }))
  } finally {
    sendingEmail.value = false
  }
}
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto pb-12">
    <div class="flex items-center justify-between">
      <Button variant="ghost" @click="router.push('/invoices')" class="-ml-2">
        <ArrowLeft class="w-4 h-4 mr-2" />
        {{ t('invoice_detail.btn_back') }}
      </Button>
      <div class="flex gap-2">
        <Button variant="outline" @click="router.push(`/invoices/${invoice?.id}/edit`)">
          <Edit class="w-4 h-4 mr-2" />
          {{ t('invoice_detail.btn_edit') }}
        </Button>
        <Button @click="handleDownloadPdf">
          <FileDown class="w-4 h-4 mr-2" />
          {{ t('invoice_detail.btn_pdf') }}
        </Button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <p class="text-muted-foreground">{{ t('invoice_detail.loading') }}</p>
    </div>

    <template v-else-if="invoice">
      <div class="grid gap-6 md:grid-cols-3">
        <!-- Status & Actions -->
        <Card class="p-6 space-y-6 h-fit">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground mb-2">{{ t('invoice_detail.lbl_status') }}</h3>
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-medium', getStatusBadgeClass(invoice.status)]">
              {{ getStatusLabel(invoice.status) }}
            </span>
          </div>

          <div class="pt-4 border-t space-y-2">
            <Button v-if="invoice.status !== 'paid'" class="w-full justify-start" variant="outline" @click="handleMarkAsPaid">
              <CheckCircle class="w-4 h-4 mr-2" />
              {{ t('invoice_detail.btn_mark_paid') }}
            </Button>
            <Button class="w-full justify-start" variant="outline" @click="handleSendInvoice" :disabled="sendingEmail">
              <Send class="w-4 h-4 mr-2" />
              {{ sendingEmail ? t('invoice_detail.btn_sending') : t('invoice_detail.btn_send') }}
            </Button>
          </div>
        </Card>

        <!-- Invoice Details -->
        <Card class="md:col-span-2 p-8 space-y-8">
          <div class="flex justify-between items-start">
            <div>
              <h1 class="text-2xl font-bold">{{ t('invoice_detail.title', { id: invoice.id.split('-')[0].toUpperCase() }) }}</h1>
              <p class="text-muted-foreground">{{ t('invoice_detail.issued_on', { date: formatDate(invoice.issue_date) }) }}</p>
            </div>
            <div class="text-right">
              <div class="text-xl font-black text-primary">{{ authStore.userProfile?.company_name || 'RECURO' }}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8 py-8 border-y">
            <div>
              <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{{ t('invoice_detail.lbl_from') }}</h3>
              <p class="font-semibold">{{ authStore.userProfile?.full_name || authStore.userProfile?.company_name || 'Votre Entreprise' }}</p>
              <p v-if="authStore.userProfile?.company_name && authStore.userProfile?.full_name" class="text-sm font-medium">{{ authStore.userProfile?.company_name }}</p>
              <p class="text-sm text-muted-foreground">{{ authStore.userProfile?.email || 'contact@votreentreprise.com' }}</p>
            </div>
            <div class="text-right">
              <h3 class="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">{{ t('invoice_detail.lbl_to') }}</h3>
              <p class="font-semibold">{{ invoice.client?.name }}</p>
              <p class="text-sm text-muted-foreground">{{ invoice.client?.email }}</p>
            </div>
          </div>

          <div>
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                  <th class="pb-3 text-left">{{ t('invoice_detail.col_desc') }}</th>
                  <th class="pb-3 text-center w-20">{{ t('invoice_detail.col_qty') }}</th>
                  <th class="pb-3 text-right w-32">{{ t('invoice_detail.col_price') }}</th>
                  <th class="pb-3 text-right w-32">{{ t('invoice_detail.col_total') }}</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="item in invoice.invoice_items" :key="item.id">
                  <td class="py-4 text-sm">{{ item.description }}</td>
                  <td class="py-4 text-sm text-center">{{ item.quantity }}</td>
                  <td class="py-4 text-sm text-right">{{ item.unit_price.toFixed(2) }} {{ currentSymbol }}</td>
                  <td class="py-4 text-sm text-right font-medium">{{ (item.quantity * item.unit_price).toFixed(2) }} {{ currentSymbol }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex justify-end pt-4">
            <div class="w-64 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">{{ t('invoice_detail.lbl_subtotal') }}</span>
                <span>{{ invoice.total_amount.toFixed(2) }} {{ currentSymbol }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">{{ t('invoice_detail.lbl_tax') }}</span>
                <span>0.00 {{ currentSymbol }}</span>
              </div>
              <div class="flex justify-between border-t pt-2 text-lg font-bold">
                <span>{{ t('invoice_detail.lbl_total') }}</span>
                <span class="text-primary">{{ invoice.total_amount.toFixed(2) }} {{ currentSymbol }}</span>
              </div>
            </div>
          </div>

          <div class="pt-8 text-xs text-muted-foreground border-t">
            <p>{{ t('invoice_detail.due_date', { date: formatDate(invoice.due_date) }) }}</p>
            <p class="mt-2">{{ t('invoice_detail.footer_msg') }}</p>
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>
