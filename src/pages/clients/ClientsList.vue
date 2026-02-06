<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useClientStore } from '@/stores/client'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Input from '@/components/ui/Input.vue'
import { Plus, Trash2, Pencil } from 'lucide-vue-next'

import { useClientValidation } from '@/composables/useClientValidation'

const clientStore = useClientStore()
const showCreateForm = ref(false)
const editingClientId = ref<string | null>(null)

const { 
  errors, 
  name, nameProps, 
  email, emailProps, 
  address, addressProps, 
  handleSubmit, 
  resetForm,
  setValues
} = useClientValidation()

onMounted(() => {
  clientStore.fetchClients()
})

const startCreate = () => {
    editingClientId.value = null
    resetForm()
    showCreateForm.value = true
}

const startEdit = (client: any) => {
    editingClientId.value = client.id
    setValues({
      name: client.name,
      email: client.email || '',
      address: client.address || ''
    })
    showCreateForm.value = true
}

const onFormSubmit = handleSubmit(async (values) => {
  const action = editingClientId.value 
    ? clientStore.updateClient(editingClientId.value, values)
    : clientStore.createClient(values)
    
  const { error } = await action
  
  if (!error) {
    showCreateForm.value = false
    resetForm()
    editingClientId.value = null
  }
})

const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce client ?')) {
        await clientStore.deleteClient(id)
    }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Clients</h1>
      <Button @click="startCreate" v-if="!showCreateForm">
        <Plus class="w-4 h-4 mr-2" />
        Nouveau Client
      </Button>
    </div>

    <!-- Create/Edit Client Form -->
    <Card v-if="showCreateForm" class="p-6 bg-muted/30 border-dashed">
      <h3 class="font-medium mb-4">{{ editingClientId ? 'Modifier le client' : 'Ajouter un client' }}</h3>
      <form @submit="onFormSubmit" class="space-y-4">
        <div class="grid gap-4 md:grid-cols-2">
          <Input v-model="name" v-bind="nameProps" label="Nom" placeholder="Entreprise XYZ" :error="errors.name" />
          <Input v-model="email" v-bind="emailProps" label="Email" type="email" placeholder="contact@xyz.com" :error="errors.email" />
        </div>
        <Input v-model="address" v-bind="addressProps" label="Adresse" placeholder="123 Rue de la Paix" :error="errors.address" />
        <div class="flex justify-end gap-2">
          <Button type="button" variant="ghost" @click="showCreateForm = false">Annuler</Button>
          <Button type="submit" :disabled="clientStore.loading">
              {{ editingClientId ? 'Mettre à jour' : 'Créer' }}
          </Button>
        </div>
      </form>
    </Card>

    <!-- Client List -->
    <div v-if="clientStore.loading && clientStore.clients.length === 0" class="text-center py-10 text-muted-foreground">
      Chargement...
    </div>

    <div v-else-if="clientStore.clients.length === 0" class="rounded-md border p-12 text-center text-muted-foreground">
      <p class="mb-2">Aucun client pour le moment.</p>
      <p class="text-sm">Créez votre premier client pour commencer à facturer.</p>
    </div>

    <div v-else class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="client in clientStore.clients" :key="client.id" class="p-6 hover:shadow-md transition-shadow group relative">
        <div class="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-foreground" @click.stop="startEdit(client)">
                <Pencil class="w-3 h-3" />
            </Button>
            <Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-red-600 hover:bg-red-50" @click.stop="handleDelete(client.id)">
                <Trash2 class="w-3 h-3" />
            </Button>
        </div>
        
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg">{{ client.name }}</h3>
        </div>
        <div class="space-y-1 text-sm text-muted-foreground">
          <p v-if="client.email">{{ client.email }}</p>
          <p v-if="client.address">{{ client.address }}</p>
        </div>
      </Card>
    </div>
  </div>
</template>
