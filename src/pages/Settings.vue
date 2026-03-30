<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const loading = ref(true)
const saving = ref(false)
const userProfile = ref<any>(null)
const { t } = useI18n()

const currencies = [
  { value: 'XAF', label: 'Franc CFA (FCFA)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'Dollar US ($)' },
  { value: 'JPY', label: 'Yen Japonais (¥)' }
]

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    userProfile.value = {
      ...data,
      currency: data?.currency || 'XAF'
    }
  }
  loading.value = false
})

const handleSave = async () => {
  saving.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        company_name: userProfile.value.company_name,
        address: userProfile.value.address,
        currency: userProfile.value.currency
      })
      .eq('id', user.id)

    if (error) throw error
    
    await authStore.fetchUser()
    alert(t('settings.success_save'))
  } catch (err: any) {
    alert(t('settings.err_save') + ': ' + err.message)
  } finally {
    saving.value = false
  }
}

</script>

<template>
  <div class="space-y-6 max-w-2xl">
    <h1 class="text-3xl font-bold tracking-tight">{{ t('settings.title') }}</h1>

    <div v-if="loading" class="text-muted-foreground">{{ t('settings.loading') }}</div>
    
    <div v-else class="space-y-6">
      <!-- Profile Section -->
      <Card class="p-6 space-y-4">
        <h2 class="text-xl font-semibold">{{ t('settings.profile_title') }}</h2>
        <div class="grid gap-4">
          <Input :model-value="userProfile?.full_name" :label="t('settings.lbl_fullname')" readonly />
          <Input v-model="userProfile.company_name" :label="t('settings.lbl_company')" :placeholder="t('settings.ph_company')" />
          <Input v-model="userProfile.address" :label="t('settings.lbl_address')" :placeholder="t('settings.ph_address')" />
          
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-1.5">{{ t('settings.lbl_currency') }}</label>
            <select 
              v-model="userProfile.currency" 
              class="w-full h-11 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-shadow"
            >
              <option v-for="c in currencies" :key="c.value" :value="c.value">
                {{ c.label }}
              </option>
            </select>
          </div>
        </div>
        <Button @click="handleSave" :disabled="saving" class="w-full sm:w-auto">
          {{ saving ? t('settings.btn_saving') : t('settings.btn_save') }}
        </Button>
      </Card>

    </div>
  </div>
</template>
