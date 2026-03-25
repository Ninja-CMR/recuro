<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useInvoiceStore } from '@/stores/invoice'
import { useClientStore } from '@/stores/client'
import { useSubscriptionStore } from '@/stores/subscription'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import { 
  Plus, 
  AlertCircle, 
  FileText, 
  ChevronDown
} from 'lucide-vue-next'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()
const subscriptionStore = useSubscriptionStore()

const period = ref('this-month')

onMounted(async () => {
    // Ensure data is loaded
    await Promise.all([
        invoiceStore.fetchInvoices(),
        clientStore.fetchClients(),
        subscriptionStore.fetchSubscriptions()
    ])
})

const userName = computed(() => {
    return authStore.userProfile?.full_name || t('nav.user')
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'XAF', 
    minimumFractionDigits: 0,
    maximumFractionDigits: 0 
  }).format(value)
}

const recentInvoices = computed(() => {
    return invoiceStore.invoices.slice(0, 5)
})

const getClientName = (id: string, clientObj?: any) => {
    if (clientObj?.name) return clientObj.name
    return clientStore.clients.find(c => c.id === id)?.name || t('dashboard.unknown_client')
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'overdue': return 'destructive'
    case 'sent': return 'secondary'
    default: return 'outline'
  }
}


</script>

<template>
  <div class="space-y-8 pb-10">
    <!-- 1️⃣ Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">{{ t('dashboard.greeting', { name: userName }) }}</h1>
            <p class="text-muted-foreground">{{ t('dashboard.subtitle') }}</p>
        </div>
        
        <div class="flex items-center gap-3">
            <div class="relative">
                 <select v-model="period" class="h-10 pl-3 pr-8 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-ring appearance-none cursor-pointer">
                    <option value="this-month">{{ t('dashboard.period_this_month') }}</option>
                    <option value="last-month">{{ t('dashboard.period_last_month') }}</option>
                </select>
                <ChevronDown class="w-4 h-4 absolute right-2 top-3 pointer-events-none opacity-50" />
            </div>
            <Button @click="router.push('/invoices/new')">
                <Plus class="w-4 h-4 mr-2" />
                {{ t('dashboard.new_invoice') }}
            </Button>
        </div>
    </div>

    <!-- 2️⃣ KPI Cards -->
    <div class="grid gap-4 md:grid-cols-3">
        <!-- Revenue -->
        <Card class="p-6 space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">{{ t('dashboard.revenue_received') }}</span>
                <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200">{{ t('dashboard.period_this_month') }}</Badge>
            </div>
            <div class="text-2xl font-bold">
                {{ formatCurrency(invoiceStore.totalRevenue) }}
            </div>
        </Card>

        <!-- Invoices Sent -->
        <Card class="p-6 space-y-2">
             <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">{{ t('dashboard.invoices_sent') }}</span>
                <FileText class="w-4 h-4 text-muted-foreground" />
            </div>
            <div class="text-2xl font-bold">
                {{ invoiceStore.invoices.length }}
            </div>
            <p class="text-xs text-muted-foreground">
                {{ invoiceStore.paidCount }} {{ t('dashboard.paid') }} / {{ invoiceStore.pendingCount }} {{ t('dashboard.pending') }}
            </p>
        </Card>

        <!-- Overdue -->
        <Card class="p-6 space-y-2 border-l-4 border-l-destructive/50">
             <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">{{ t('dashboard.overdue') }}</span>
                <AlertCircle class="w-4 h-4 text-destructive" />
            </div>
            <div class="text-2xl font-bold text-destructive">
                {{ invoiceStore.overdueCount }}
            </div>
            <p class="text-xs text-destructive/80">
                {{ t('dashboard.need_reminder') }}
            </p>
        </Card>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
        <!-- 3️⃣ Recent Invoices (Merged col-span-2) -->
        <div class="md:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold">{{ t('dashboard.recent_invoices') }}</h2>
                <Button variant="ghost" size="sm" class="text-xs" @click="router.push('/invoices')">{{ t('dashboard.see_all') }}</Button>
            </div>

            <!-- Empty State -->
            <Card v-if="invoiceStore.invoices.length === 0" class="p-8 text-center border-dashed">
                <div class="flex justify-center mb-4">
                    <div class="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                        <FileText class="w-6 h-6 text-muted-foreground" />
                    </div>
                </div>
                <h3 class="font-medium mb-1">{{ t('dashboard.no_invoices') }}</h3>
                <p class="text-sm text-muted-foreground mb-4">{{ t('dashboard.create_first_invoice') }}</p>
                <Button @click="router.push('/invoices/new')">{{ t('dashboard.btn_create_first') }}</Button>
            </Card>

            <!-- Table -->
            <Card v-else class="overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-muted/30 text-muted-foreground border-b">
                            <tr>
                                <th class="px-4 py-3 font-medium">{{ t('dashboard.col_client') }}</th>
                                <th class="px-4 py-3 font-medium">{{ t('dashboard.col_amount') }}</th>
                                <th class="px-4 py-3 font-medium">{{ t('dashboard.col_status') }}</th>
                                <th class="px-4 py-3 font-medium text-right">{{ t('dashboard.col_action') }}</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y">
                            <tr v-for="invoice in recentInvoices" :key="invoice.id" class="group hover:bg-muted/20 transition-colors">
                                <td class="px-4 py-3 font-medium">
                                    {{ getClientName(invoice.client_id, invoice.client) }}
                                </td>
                                <td class="px-4 py-3">
                                    {{ formatCurrency(invoice.total_amount) }}
                                </td>
                                <td class="px-4 py-3">
                                    <Badge :variant="getStatusVariant(invoice.status)" class="h-5 text-[10px] px-2">
                                        {{ invoice.status }}
                                    </Badge>
                                </td>
                                <td class="px-4 py-3 text-right">
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        class="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                        @click="router.push(`/invoices/${invoice.id}`)"
                                    >
                                        {{ t('dashboard.action_view') }}
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

        <!-- Right Column: Info -->
        <div class="space-y-6">

        </div>
    </div>
  </div>
</template>
