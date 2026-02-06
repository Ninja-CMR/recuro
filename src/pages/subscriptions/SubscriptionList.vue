<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import { Repeat } from 'lucide-vue-next'
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold tracking-tight">Abonnements Clients</h1>
      <Button>
        <Repeat class="w-4 h-4 mr-2" />
        Nouvel Abonnement
      </Button>
    </div>

    <!-- Empty State / Placeholder -->
    <div class="rounded-md border p-12 text-center text-muted-foreground bg-muted/10">
      <div class="flex justify-center mb-4">
        <div class="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
            <Repeat class="w-6 h-6" />
        </div>
      </div>
      <h3 class="text-lg font-medium mb-2">Automatisez votre facturation</h3>
      <p class="max-w-sm mx-auto mb-6">Créez des abonnements pour vos clients et laissez Recuro générer les factures automatiquement chaque mois.</p>
      <Button variant="outline">Créer un abonnement (Démo)</Button>
    </div>
    
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 opacity-50 pointer-events-none select-none filter blur-[2px]">
        <!-- Fake items to show what it looks like -->
        <Card class="p-6">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold">Maintenance Web</h3>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Actif</span>
            </div>
            <p class="text-sm text-muted-foreground mb-4">Client: Acme Corp</p>
            <div class="flex justify-between items-end">
                <p class="font-bold text-lg">150.00 € <span class="text-xs font-normal text-muted-foreground">/ mois</span></p>
            </div>
        </Card>
         <Card class="p-6">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold">Coaching SEO</h3>
                <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Actif</span>
            </div>
            <p class="text-sm text-muted-foreground mb-4">Client: StartUp Inc</p>
            <div class="flex justify-between items-end">
                <p class="font-bold text-lg">300.00 € <span class="text-xs font-normal text-muted-foreground">/ mois</span></p>
            </div>
        </Card>
    </div>
     <p class="text-center text-xs text-muted-foreground mt-2">(Aperçu de la fonctionnalité)</p>
  </div>
</template>
