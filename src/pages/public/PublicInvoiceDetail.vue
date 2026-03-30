<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { supabase } from '@/services/supabase'
import { generatePdf } from '@/services/pdfService'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import { FileDown, Printer } from 'lucide-vue-next'
import { getCurrencySymbol } from '@/utils/currencies'

const route = useRoute()
const invoice = ref<any>(null)
const profile = ref<any>(null)
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  const id = route.params.id as string
  
  try {
    // Fetch invoice with items and client
    const { data: inv, error: invErr } = await supabase
      .from('invoices')
      .select(`
        *,
        invoice_items (*),
        client:clients (*)
      `)
      .eq('id', id)
      .single()

    if (invErr) throw invErr
    invoice.value = inv

    // Fetch sender profile
    if (inv.user_id) {
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', inv.user_id)
        .single()
      profile.value = prof
    }
  } catch (err: any) {
    console.error('Error loading public invoice:', err)
    error.value = "Impossible de charger la facture. Le lien est peut-être invalide."
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const currentSymbol = computed(() => getCurrencySymbol(invoice.value?.currency))

const handleDownloadPdf = () => {
  if (invoice.value) {
    generatePdf(invoice.value, profile.value)
  }
}
</script>

<template>
  <div class="min-h-screen bg-muted/30 py-12 px-4">
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Navbar Public -->
      <div class="flex items-center justify-between bg-white p-4 rounded-xl border shadow-sm">
        <div class="flex items-center gap-2">
          <img src="/logo.svg" alt="Recuro" class="h-8 w-auto" />
          <span class="font-bold text-xl tracking-tight hidden sm:block">Recuro</span>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="handleDownloadPdf">
            <Printer class="w-4 h-4 mr-2" />
            Imprimer
          </Button>
          <Button size="sm" @click="handleDownloadPdf">
            <FileDown class="w-4 h-4 mr-2" />
            Télécharger PDF
          </Button>
        </div>
      </div>

      <div v-if="loading" class="flex justify-center py-24">
        <div class="animate-pulse text-muted-foreground">Chargement de la facture...</div>
      </div>

      <div v-else-if="error" class="text-center py-24 space-y-4">
        <div class="text-red-500 font-medium">{{ error }}</div>
        <Button variant="outline" @click="$router.push('/')">Retour à l'accueil</Button>
      </div>

      <template v-else-if="invoice">
        <Card class="p-8 md:p-12 space-y-12 bg-white shadow-xl border-none">
          <!-- Header -->
          <div class="flex flex-col md:flex-row justify-between gap-8">
            <div class="space-y-2">
              <h1 class="text-3xl font-black uppercase tracking-tighter">Facture</h1>
              <p class="text-muted-foreground font-medium">#{{ invoice.id.split('-')[0].toUpperCase() }}</p>
            </div>
            <div class="text-left md:text-right">
              <div class="text-2xl font-black text-primary">{{ profile?.company_name || 'RECURO' }}</div>
              <p class="text-muted-foreground text-sm">Émise le {{ formatDate(invoice.issue_date) }}</p>
            </div>
          </div>

          <!-- Parties -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 py-10 border-y border-zinc-100">
            <div class="space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-widest text-muted-foreground">De</h3>
              <div class="space-y-1">
                <p class="font-bold text-lg">{{ profile?.full_name || profile?.company_name }}</p>
                <p v-if="profile?.company_name && profile?.full_name" class="text-zinc-600">{{ profile.company_name }}</p>
                <p class="text-zinc-500">{{ profile?.email }}</p>
                <p v-if="profile?.address" class="text-zinc-500 whitespace-pre-line">{{ profile.address }}</p>
              </div>
            </div>
            <div class="space-y-4 md:text-right">
              <h3 class="text-xs font-bold uppercase tracking-widest text-muted-foreground">À</h3>
              <div class="space-y-1">
                <p class="font-bold text-lg">{{ invoice.client?.name }}</p>
                <p class="text-zinc-500">{{ invoice.client?.email }}</p>
                <p v-if="invoice.client?.address" class="text-zinc-500 whitespace-pre-line">{{ invoice.client.address }}</p>
              </div>
            </div>
          </div>

          <!-- Items -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-zinc-100 italic">
                  <th class="pb-4">Description</th>
                  <th class="pb-4 text-center">Qté</th>
                  <th class="pb-4 text-right">Prix U.</th>
                  <th class="pb-4 text-right">Montant</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-50">
                <tr v-for="item in invoice.invoice_items" :key="item.id">
                  <td class="py-6 font-medium">{{ item.description }}</td>
                  <td class="py-6 text-center text-zinc-500">{{ item.quantity }}</td>
                  <td class="py-6 text-right text-zinc-500">{{ Math.round(item.unit_price) }} {{ currentSymbol }}</td>
                  <td class="py-6 text-right font-bold">{{ Math.round(item.quantity * item.unit_price) }} {{ currentSymbol }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Total Section -->
          <div class="flex flex-col items-end pt-6 space-y-4">
            <div class="w-full md:w-80 space-y-3">
              <div class="flex justify-between text-zinc-500">
                <span>Sous-total</span>
                <span>{{ Math.round(invoice.total_amount) }} {{ currentSymbol }}</span>
              </div>
              <div class="flex justify-between text-zinc-500">
                <span>TVA (0%)</span>
                <span>0 {{ currentSymbol }}</span>
              </div>
              <div class="flex justify-between pt-4 border-t border-zinc-200 text-2xl font-black">
                <span>Total</span>
                <span class="text-primary">{{ Math.round(invoice.total_amount) }} {{ currentSymbol }}</span>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between gap-6 text-xs text-muted-foreground italic">
            <div>
              <p>Échéance : {{ formatDate(invoice.due_date) }}</p>
              <p class="mt-1">Status : {{ invoice.status === 'paid' ? 'Payée' : 'En attente' }}</p>
            </div>
            <div class="md:text-right">
              <p>Merci pour votre confiance.</p>
              <p class="mt-1">Généré via Recuro</p>
            </div>
          </div>
        </Card>

        <!-- Branding / CTA for recipient -->
        <div class="text-center pt-8">
            <p class="text-sm text-muted-foreground">Vous aussi, facturez avec élégance.</p>
            <Button variant="ghost" @click="$router.push('/register')" class="text-primary font-bold">Découvrir Recuro</Button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
@media print {
  .min-h-screen {
    background: white;
    padding: 0;
  }
  .max-w-4xl {
    max-width: 100%;
  }
  button, nav, .navbar-public, .branding-cta {
    display: none !important;
  }
  .shadow-xl {
    box-shadow: none !important;
  }
}
</style>
