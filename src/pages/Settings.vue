<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'

const loading = ref(true)
const userProfile = ref<any>(null)

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

      <!-- Info Section -->
      <Card class="p-6 bg-slate-50 border-slate-200">
        <h2 class="text-xl font-semibold mb-2">Période de test</h2>
        <p class="text-sm text-muted-foreground">
          Recuro est actuellement en phase de test. Toutes les fonctionnalités Premium sont offertes gratuitement. 
          Profitez d'un usage illimité pour nous aider à améliorer l'outil.
        </p>
      </Card>
    </div>
  </div>
</template>
