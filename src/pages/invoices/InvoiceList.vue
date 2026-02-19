<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoice'
import { useClientStore } from '@/stores/client'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import { Plus, FileText } from 'lucide-vue-next'
import type { Client } from '@/types'

const router = useRouter()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()

onMounted(() => {
  invoiceStore.fetchInvoices()
  clientStore.fetchClients()
})

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'overdue': return 'destructive'
    case 'sent': return 'secondary'
    default: return 'outline'
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

const getClientName = (clientId: string, clientObj?: any) => {
  if (clientObj?.name) return clientObj.name
  return clientStore.clients.find((c: Client) => c.id === clientId)?.name || 'Client inconnu'
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Factures</h1>
      <Button @click="router.push('/invoices/new')">
        <Plus class="w-4 h-4 mr-2" />
        Nouvelle Facture
      </Button>
    </div>

    <div v-if="invoiceStore.loading && invoiceStore.invoices.length === 0" class="text-center py-10 text-muted-foreground">
      Chargement...
    </div>

    <div v-else-if="invoiceStore.invoices.length === 0" class="rounded-md border p-12 text-center text-muted-foreground">
      <p class="mb-2">Aucune facture pour le moment.</p>
      <Button variant="ghost" @click="router.push('/invoices/new')">Créer votre première facture</Button>
    </div>

    <div v-else class="space-y-4">
      <Card v-for="invoice in invoiceStore.invoices" :key="invoice.id" 
        class="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
        @click="router.push(`/invoices/${invoice.id}`)"
      >
        <div class="flex items-center gap-4">
          <div class="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <FileText class="w-5 h-5" />
          </div>
          <div>
            <p class="font-medium">
              {{ getClientName(invoice.client_id, invoice.client) }}
            </p>
            <p class="text-xs text-muted-foreground">
               #{{ invoice.id.slice(0, 8) }} • {{ formatDate(invoice.issue_date) }}
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
            <div class="text-right">
                <p class="font-bold">{{ invoice.total_amount }} €</p>
                <Badge :variant="getStatusVariant(invoice.status)">{{ invoice.status }}</Badge>
            </div>
        </div>
      </Card>
    </div>
  </div>
</template>
