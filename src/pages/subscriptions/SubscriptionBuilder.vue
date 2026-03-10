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
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
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
      alert(t('sub_builder.err_load'))
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
      alert(t('sub_builder.freemium_limit'))
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
    alert(t('sub_builder.err_save', { msg: error }))
  }
})
</script>

<template>
  <div class="space-y-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">
        {{ isEditMode ? t('sub_builder.title_edit') : t('sub_builder.title_new') }}
      </h1>
    </div>

    <div v-if="!isEditMode && authStore.userProfile?.subscription_tier === 'freemium' && subscriptionStore.subscriptions.length >= 3" class="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md text-sm">
      {{ t('sub_builder.freemium_limit') }}
      <router-link to="/settings" class="font-bold underline ml-1">{{ t('sub_builder.freemium_upgrade') }}</router-link> {{ t('sub_builder.freemium_more') }}
    </div>

    <div class="grid gap-6 md:grid-cols-3">
      <!-- Subscription Details -->
      <Card class="md:col-span-1 p-6 space-y-4 h-fit">
        <Input v-model="name" v-bind="nameProps" :label="t('sub_builder.lbl_name')" :placeholder="t('sub_builder.ph_name')" :error="errors.name" />
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('sub_builder.lbl_client') }}</label>
          <select 
            v-model="clientId" 
            v-bind="clientIdProps"
            class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            :class="{ 'border-destructive': errors.clientId }"
          >
            <option value="" disabled>{{ t('sub_builder.choose_client') }}</option>
            <option v-for="client in clientStore.clients" :key="client.id" :value="client.id">
              {{ client.name }}
            </option>
          </select>
          <p v-if="errors.clientId" class="text-xs text-destructive mt-1">{{ errors.clientId }}</p>
          <p v-if="clientStore.clients.length === 0" class="text-xs text-muted-foreground mt-1">
            <router-link to="/clients" class="underline">{{ t('sub_builder.create_client_first') }}</router-link>
          </p>
        </div>
        <Input v-model="amount" v-bind="amountProps" type="number" :label="t('sub_builder.lbl_amount')" placeholder="100.00" :error="errors.amount" />
        <div>
          <label class="block text-sm font-medium mb-1">{{ t('sub_builder.lbl_currency') }}</label>
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
          <label class="block text-sm font-medium mb-1">{{ t('sub_builder.lbl_frequency') }}</label>
          <select 
            v-model="frequency" 
            v-bind="frequencyProps"
            class="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            :class="{ 'border-destructive': errors.frequency }"
          >
            <option value="monthly">{{ t('sub_builder.freq_monthly') }}</option>
            <option value="quarterly">{{ t('sub_builder.freq_quarterly') }}</option>
            <option value="yearly">{{ t('sub_builder.freq_yearly') }}</option>
          </select>
          <p v-if="errors.frequency" class="text-xs text-destructive mt-1">{{ errors.frequency }}</p>
        </div>
        <Input v-model="startDate" v-bind="startDateProps" type="date" :label="t('sub_builder.lbl_start_date')" :error="errors.startDate" />
      </Card>

      <!-- Placeholder for more details or actions -->
      <Card class="md:col-span-2 p-6 space-y-4">
        <h2 class="text-lg font-semibold">{{ t('sub_builder.extra_title') }}</h2>
        <p class="text-muted-foreground text-sm">{{ t('sub_builder.extra_desc') }}</p>
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
        <Button variant="secondary" @click="router.back()">{{ t('sub_builder.btn_cancel') }}</Button>
        <Button @click="handleSave" :disabled="saving || (!isEditMode && authStore.userProfile?.subscription_tier === 'freemium' && subscriptionStore.subscriptions.length >= 3)">
            {{ saving ? t('sub_builder.btn_saving') : (isEditMode ? t('sub_builder.btn_edit') : t('sub_builder.btn_create')) }}
        </Button>
    </div>
  </div>
</template>
