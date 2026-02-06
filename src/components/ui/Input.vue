<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  label?: string
  id?: string
  error?: string
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" :for="id" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {{ label }}
    </label>
    <input
      :id="id"
      :type="type || 'text'"
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      :class="{ 'border-destructive': error }"
    />
    <p v-if="error" class="text-sm font-medium text-destructive">{{ error }}</p>
  </div>
</template>
