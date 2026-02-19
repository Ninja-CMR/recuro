<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import { useSubscriptionValidation } from '@/composables/useSubscriptionValidation'
import { useSubscriptionStore } from '@/stores/subscription'
import { useClientStore } from '@/stores/client'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const subscriptionStore = useSubscriptionStore()
const clientStore = useClientStore()
const authStore = useAuthStore()
const saving = ref(false)

const subscriptionId = computed(() => route.params.id as string | undefined)
const isEditMode = computed(() => !!subscriptionId.value)

const {
  errors,
  clientId, clientIdProps,
  name, nameProps,
  amount, amountProps,
  currency, currencyProps,
  frequency, frequencyProps,
  startDate, startDateProps,
  description, descriptionProps,
  handleSubmit,
  setValues
} = useSubscriptionValidation()

onMounted(async () => {
  clientStore.fetchClients()
  
  if (isEditMode.value && subscriptionId.value) {
    const { data, error } = await subscriptionStore.fetchSubscriptionById(subscriptionId.value)
    if (error) {
      alert('Erreur lors du chargement de l\'abonnement')
      router.push('/subscriptions')
      return
    }
    if (data) {
      setValues({
        clientId: data.client_id,
        name: data.name,
        amount: data.amount,
        currency: data.currency,
        frequency: data.frequency,
        startDate: data.start_date,
        description: data.description || ''
      })
    }
  }
})

const handleSave = handleSubmit(async (formValues) => {
  // Enforce Freemium limit ONLY on creation
  if (!isEditMode.value && authStore.userProfile?.subscription_tier === 'freemium') {
    if (subscriptionStore.subscriptions.length >= 3) {
      alert('Limite Freemium atteinte : Vous ne pouvez pas créer plus de 3 abonnements. Veuillez passer au forfait Premium pour une utilisation illimitée.')
      router.push('/settings')
      return
    }
  }

  saving.value = true
  
  const payload = {
    client_id: formValues.clientId,
    name: formValues.name,
    amount: formValues.amount,
    currency: formValues.currency,
    frequency: formValues.frequency,
    start_date: formValues.startDate,
    description: formValues.description
  }

  let error = null
  if (isEditMode.value && subscriptionId.value) {
    const result = await subscriptionStore.updateSubscription(subscriptionId.value, payload)
    error = result.error
  } else {
    const result = await subscriptionStore.createSubscription(payload)
    error = result.error
  }

  saving.value = false
  
  if (!error) {
    router.push('/subscriptions')
  } else {
    alert('Erreur: ' + error)
  }
})
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">
        {{ isEditMode ? 'Modifier l\'Abonnement' : 'Nouvel Abonnement' }}
      </h1>
    </div>

    <div v-if="!isEditMode && authStore.userProfile?.subscription_tier === 'freemium' && subscriptionStore.subscriptions.length >= 3" class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm">
      Vous avez atteint la limite de 3 abonnements pour le plan Freemium. 
      <router-link to="/settings" class="font-bold underline ml-1">Passez au Premium</router-link> pour en créer plus.
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <!-- Subscription Details -->
      <Card class="md:col-span-1 p-6 space-y-4 h-fit">
        <Input v-model="name" v-bind="nameProps" label="Nom de l'abonnement" placeholder="Maintenance Premium" :error="errors.name" />
        <div>
          <label class="block text-sm font-medium mb-1">Client</label>
          <select 
            v-model="clientId" 
            v-bind="clientIdProps"
            class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            :class="{ 'border-destructive': errors.clientId }"
          >
            <option value="" disabled>Choisir un client...</option>
            <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
          <p v-if="errors.clientId" class="text-xs text-destructive mt-1">{{ errors.clientId }}</p>
          <p v-if="clientStore.clients.length === 0" class="text-xs text-muted-foreground mt-1">
            <router-link to="/clients" class="underline">Créer un client d'abord</router-link>
          </p>
        </div>
        <Input v-model="amount" v-bind="amountProps" type="number" label="Montant" placeholder="100.00" :error="errors.amount" />
        <div>
          <label class="block text-sm font-medium mb-1">Devise</label>
          <select 
            v-model="currency" 
            v-bind="currencyProps"
            class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            :class="{ 'border-destructive': errors.currency }"
          >
            <option value="EUR">EUR</option>
            <option value="USD">USD</option>
          </select>
          <p v-if="errors.currency" class="text-xs text-destructive mt-1">{{ errors.currency }}</p>
        </div>
        <div>
          <label class="block text-sm font-medium mb-1">Fréquence</label>
          <select 
            v-model="frequency" 
            v-bind="frequencyProps"
            class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            :class="{ 'border-destructive': errors.frequency }"
          >
            <option value="monthly">Mensuel</option>
            <option value="quarterly">Trimestriel</option>
            <option value="yearly">Annuel</option>
          </select>
          <p v-if="errors.frequency" class="text-xs text-destructive mt-1">{{ errors.frequency }}</p>
        </div>
        <Input v-model="startDate" v-bind="startDateProps" type="date" label="Date de début" :error="errors.startDate" />
      </Card>

      <!-- Placeholder for more details or actions -->
      <Card class="md:col-span-2 p-6 space-y-4">
        <h2 class="text-lg font-semibold">Détails supplémentaires</h2>
        <p class="text-muted-foreground text-sm">Ajoutez des notes ou des termes spécifiques à l'abonnement.</p>
        <textarea 
          v-model="description"
          v-bind="descriptionProps"
          class="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Notes..."
        ></textarea>
        <p v-if="errors.description" class="text-xs text-destructive mt-1">{{ errors.description }}</p>
      </Card>
    </div>

    <div class="flex justify-end gap-3 pt-4">
        <Button variant="secondary" @click="router.back()">Annuler</Button>
        <Button @click="handleSave" :disabled="saving || (!isEditMode && authStore.userProfile?.subscription_tier === 'freemium' && subscriptionStore.subscriptions.length >= 3)">
            {{ saving ? 'Enregistrement...' : (isEditMode ? 'Modifier l\'Abonnement' : 'Créer Abonnement') }}
        </Button>
    </div>
  </div>
</template>
