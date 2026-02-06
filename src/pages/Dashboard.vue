<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useInvoiceStore } from '@/stores/invoice'
import { useClientStore } from '@/stores/client'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import { 
  Plus, 
  AlertCircle, 
  FileText, 
  CheckCircle2, 
  Lock,
  ChevronDown
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const invoiceStore = useInvoiceStore()
const clientStore = useClientStore()

const period = ref('this-month')

onMounted(async () => {
    // Ensure data is loaded
    await Promise.all([
        invoiceStore.fetchInvoices(),
        clientStore.fetchClients()
    ])
    
    // Simulate user Name if missing from auth (for demo)
    if (!authStore.user?.user_metadata?.full_name) {
        // mock for display if needed
    }
})

const userName = computed(() => {
    return authStore.user?.user_metadata?.full_name || 'Olivier' // Using "Olivier" as requested in prompt example if unknown
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value)
}

const recentInvoices = computed(() => {
    return invoiceStore.invoices.slice(0, 5)
})

const getClientName = (id: string, clientObj?: any) => {
    if (clientObj?.name) return clientObj.name
    return clientStore.clients.find(c => c.id === id)?.name || 'Client inconnu'
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'paid': return 'success'
    case 'overdue': return 'destructive'
    case 'sent': return 'secondary'
    default: return 'outline'
  }
}

// Subscription limits - new users start with 0 active subscriptions
const activeSubs = ref(0)
const maxSubs = ref(3) // Freemium plan limit

</script>

<template>
  <div class="space-y-8 pb-10">
    <!-- 1️⃣ Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight">Bonjour {{ userName }} 👋</h1>
            <p class="text-muted-foreground">Voici ce qu'il se passe sur votre compte.</p>
        </div>
        
        <div class="flex items-center gap-3">
            <div class="relative">
                 <select v-model="period" class="h-10 pl-3 pr-8 rounded-md border border-input bg-background text-sm focus:ring-2 focus:ring-ring appearance-none cursor-pointer">
                    <option value="this-month">Ce mois-ci</option>
                    <option value="last-month">Mois dernier</option>
                </select>
                <ChevronDown class="w-4 h-4 absolute right-2 top-3 pointer-events-none opacity-50" />
            </div>
            <Button @click="router.push('/invoices/new')">
                <Plus class="w-4 h-4 mr-2" />
                Nouvelle facture
            </Button>
        </div>
    </div>

    <!-- 2️⃣ KPI Cards -->
    <div class="grid gap-4 md:grid-cols-3">
        <!-- Revenue -->
        <Card class="p-6 space-y-2">
            <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">Revenus encaissés</span>
                <Badge variant="outline" class="bg-green-50 text-green-700 border-green-200">Ce mois-ci</Badge>
            </div>
            <div class="text-2xl font-bold">
                {{ formatCurrency(invoiceStore.totalRevenue) }}
            </div>
        </Card>

        <!-- Invoices Sent -->
        <Card class="p-6 space-y-2">
             <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">Factures envoyées</span>
                <FileText class="w-4 h-4 text-muted-foreground" />
            </div>
            <div class="text-2xl font-bold">
                {{ invoiceStore.invoices.length }}
            </div>
            <p class="text-xs text-muted-foreground">
                {{ invoiceStore.paidCount }} payées / {{ invoiceStore.pendingCount }} en attente
            </p>
        </Card>

        <!-- Overdue -->
        <Card class="p-6 space-y-2 border-l-4 border-l-destructive/50">
             <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-muted-foreground">En retard</span>
                <AlertCircle class="w-4 h-4 text-destructive" />
            </div>
            <div class="text-2xl font-bold text-destructive">
                {{ invoiceStore.overdueCount }}
            </div>
            <p class="text-xs text-destructive/80">
                Nécessitent une relance
            </p>
        </Card>
    </div>

    <div class="grid md:grid-cols-3 gap-8">
        <!-- 3️⃣ Recent Invoices (Merged col-span-2) -->
        <div class="md:col-span-2 space-y-4">
            <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold">Factures récentes</h2>
                <Button variant="ghost" size="sm" class="text-xs" @click="router.push('/invoices')">Tout voir</Button>
            </div>

            <!-- Empty State -->
            <Card v-if="invoiceStore.invoices.length === 0" class="p-8 text-center border-dashed">
                <div class="flex justify-center mb-4">
                    <div class="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                        <FileText class="w-6 h-6 text-muted-foreground" />
                    </div>
                </div>
                <h3 class="font-medium mb-1">Aucune facture pour le moment</h3>
                <p class="text-sm text-muted-foreground mb-4">Créez votre première facture pour commencer.</p>
                <Button @click="router.push('/invoices/new')">Créer ma première facture</Button>
            </Card>

            <!-- Table -->
            <Card v-else class="overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="bg-muted/30 text-muted-foreground border-b">
                            <tr>
                                <th class="px-4 py-3 font-medium">Client</th>
                                <th class="px-4 py-3 font-medium">Montant</th>
                                <th class="px-4 py-3 font-medium">Statut</th>
                                <th class="px-4 py-3 font-medium text-right">Action</th>
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
                                    <Button variant="ghost" size="sm" class="h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        Voir
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>

        <!-- Right Column: Subs & Upgrade -->
        <div class="space-y-6">
            
            <!-- 4️⃣ Subscriptions Status -->
            <Card class="p-5">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="font-semibold text-sm">Abonnements actifs</h3>
                    <Badge variant="secondary" class="font-normal">Freemium</Badge>
                </div>
                
                <div class="mb-2">
                    <span class="text-2xl font-bold">{{ activeSubs }}</span>
                    <span class="text-muted-foreground text-sm"> / {{ maxSubs }}</span>
                </div>
                
                <div class="w-full bg-secondary h-2 rounded-full overflow-hidden mb-2">
                    <div class="bg-primary h-full rounded-full" :style="{ width: (activeSubs / maxSubs) * 100 + '%' }"></div>
                </div>
                
                <p class="text-xs text-muted-foreground">
                    Vous avez utilisé {{ activeSubs }} de vos {{ maxSubs }} abonnements gratuits.
                </p>
            </Card>

            <!-- 5️⃣ Upgrade CTA -->
            <Card class="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 dark:from-indigo-950/20 dark:to-purple-950/20 dark:border-indigo-900/50">
                <div class="flex items-start gap-3 mb-4">
                    <div class="p-2 bg-white dark:bg-card rounded-md shadow-sm text-indigo-600">
                        <Lock class="w-5 h-5" />
                    </div>
                    <div>
                        <h3 class="font-bold text-indigo-950 dark:text-indigo-100 text-sm">Passez en Premium</h3>
                        <p class="text-xs text-indigo-700/80 dark:text-indigo-300">Levez toutes les limites.</p>
                    </div>
                </div>
                
                <ul class="space-y-2 mb-6">
                    <li class="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
                        <CheckCircle2 class="w-3.5 h-3.5 text-indigo-500" /> Abonnements illimités
                    </li>
                    <li class="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
                        <CheckCircle2 class="w-3.5 h-3.5 text-indigo-500" /> Relances automatiques
                    </li>
                    <li class="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-200">
                        <CheckCircle2 class="w-3.5 h-3.5 text-indigo-500" /> Dashboard avancé
                    </li>
                </ul>

                <Button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none shadow-md" @click="router.push('/settings')">
                    Découvrir Premium
                </Button>
            </Card>

        </div>
    </div>
  </div>
</template>
