<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import { Repeat, Plus, Edit, Trash2 } from 'lucide-vue-next'

const router = useRouter()
const subscriptionStore = useSubscriptionStore()

onMounted(() => {
  subscriptionStore.fetchSubscriptions()
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('fr-FR')
}

const handleDelete = async (id: string) => {
  if (confirm('Voulez-vous vraiment supprimer cet abonnement ?')) {
    const { error } = await subscriptionStore.deleteSubscription(id)
    if (error) alert('Erreur: ' + error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Abonnements Clients</h1>
      <Button @click="router.push('/subscriptions/new')">
        <Plus class="w-4 h-4 mr-2" />
        Nouvel Abonnement
      </Button>
    </div>

    <div v-if="subscriptionStore.loading && subscriptionStore.subscriptions.length === 0" class="text-center py-12">
      <p class="text-muted-foreground">Chargement des abonnements...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="subscriptionStore.subscriptions.length === 0" class="rounded-md border p-12 text-center text-muted-foreground bg-muted/10">
      <div class="flex justify-center mb-4">
        <div class="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Repeat class="w-6 h-6" />
        </div>
      </div>
      <h3 class="text-lg font-medium mb-2">Automatisez votre facturation</h3>
      <p class="max-w-sm mx-auto mb-6">Créez des abonnements pour vos clients et laissez Recuro générer les factures automatiquement chaque mois.</p>
      <Button variant="outline" @click="router.push('/subscriptions/new')">Créer votre premier abonnement</Button>
    </div>
    
    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="sub in subscriptionStore.subscriptions" :key="sub.id" class="p-6 hover:shadow-md transition-shadow relative group">
            <div class="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-primary" @click="router.push(`/subscriptions/${sub.id}/edit`)">
                    <Edit class="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-destructive" @click="handleDelete(sub.id)">
                    <Trash2 class="w-4 h-4" />
                </Button>
            </div>
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg pr-16">{{ sub.name }}</h3>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">Actif</span>
            </div>
            <p class="text-sm text-muted-foreground mb-4">Client: {{ sub.client?.name || 'Inconnu' }}</p>
            <div class="flex justify-between items-end border-t pt-4">
                <div>
                  <p class="text-xs text-muted-foreground uppercase font-bold tracking-wider">Prochaine facture</p>
                  <p class="text-sm font-medium">{{ formatDate(sub.start_date) }}</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-xl text-primary">{{ sub.amount.toFixed(2) }} {{ sub.currency }}</p>
                  <p class="text-xs text-muted-foreground">/ {{ sub.frequency === 'monthly' ? 'mois' : sub.frequency }}</p>
                </div>
            </div>
        </Card>
    </div>
  </div>
</template>
