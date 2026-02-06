<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  as?: string
}>()

const baseClass = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background"

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return "bg-secondary text-secondary-foreground hover:bg-secondary/80"
    case 'ghost':
      return "hover:bg-accent hover:text-accent-foreground"
    case 'destructive':
      return "bg-destructive text-destructive-foreground hover:bg-destructive/90"
    case 'outline':
      return "border border-input hover:bg-accent hover:text-accent-foreground"
    default: // primary
      return "bg-primary text-primary-foreground hover:bg-primary/90"
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return "h-9 px-3"
    case 'lg':
      return "h-11 px-8"
    case 'icon':
      return "h-10 w-10"
    default:
      return "h-10 py-2 px-4"
  }
})
</script>

<template>
  <component 
    :is="as || 'button'"
    :class="[baseClass, variantClass, sizeClass]"
    :disabled="disabled"
  >
    <slot />
  </component>
</template>
