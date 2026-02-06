<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'

const loading = ref(true)
const userProfile = ref<any>(null)
const stripeLoading = ref(false)

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    userProfile.value = data
  }
  loading.value = false
})

const handleUpgrade = async () => {
  stripeLoading.value = true
  // In a real app, call your backend to create a Stripe Checkout Session
  // const { sessionId } = await fetch('/api/create-checkout-session').then(r => r.json())
  // const stripe = await getStripe()
  // stripe?.redirectToCheckout({ sessionId })
  
  // For demo:
  setTimeout(() => {
    alert('Redirection vers Stripe Checkout...')
    stripeLoading.value = false
  }, 1000)
}
</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <h1 class="text-3xl font-bold tracking-tight">Paramètres</h1>

    <div v-if="loading" class="text-muted-foreground">Chargement...</div>
    
    <div v-else class="space-y-6">
      <!-- Profile Section -->
      <Card class="p-6 space-y-4">
        <h2 class="text-xl font-semibold">Profil</h2>
        <div class="grid gap-4">
          <Input :model-value="userProfile?.full_name" label="Nom complet" readonly />
          <Input :model-value="userProfile?.company_name || ''" label="Nom de l'entreprise" placeholder="Non renseigné" />
          <Input :model-value="userProfile?.address || ''" label="Adresse" placeholder="Non renseignée" />
        </div>
        <Button variant="outline">Sauvegarder</Button>
      </Card>

      <!-- Subscription Section -->
      <Card class="p-6 space-y-4 border-primary/20">
        <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold">Abonnement</h2>
            <Badge :variant="userProfile?.subscription_tier === 'premium' ? 'default' : 'secondary'">
                {{ userProfile?.subscription_tier === 'premium' ? 'Premium' : 'Freemium' }}
            </Badge>
        </div>
        
        <div v-if="userProfile?.subscription_tier !== 'premium'" class="bg-muted/50 p-4 rounded-md space-y-2">
            <h3 class="font-medium">Passez à la vitesse supérieure</h3>
            <p class="text-sm text-muted-foreground">Obtenez des clients illimités, des relances automatiques et plus encore.</p>
            <ul class="text-sm list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>Clients illimités</li>
                <li>Facturation récurrente</li>
                <li>Support prioritaire</li>
            </ul>
            <Button class="w-full mt-4" @click="handleUpgrade" :disabled="stripeLoading">
                Devenir Premium (9€/mois)
            </Button>
        </div>
        
        <div v-else class="text-sm text-muted-foreground">
            Vous bénéficiez de toutes les fonctionnalités Premium. Merci de votre confiance !
        </div>
      </Card>
    </div>
  </div>
</template>
