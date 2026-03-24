<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import { useI18n } from 'vue-i18n'

const loading = ref(true)
const userProfile = ref<any>(null)
const { t } = useI18n()

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
          <Input :model-value="userProfile?.company_name || ''" :label="t('settings.lbl_company')" :placeholder="t('settings.ph_company')" />
          <Input :model-value="userProfile?.address || ''" :label="t('settings.lbl_address')" :placeholder="t('settings.ph_address')" />
        </div>
        <Button variant="outline">{{ t('settings.btn_save') }}</Button>
      </Card>

    </div>
  </div>
</template>
