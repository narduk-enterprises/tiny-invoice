<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <div class="py-12 text-center">
    <div
      v-if="icon"
      class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
      aria-hidden="true"
    >
      <UIcon :name="icon" class="size-7" />
    </div>
    <p class="font-medium text-default">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
    <div class="mt-5">
      <slot />
    </div>
  </div>
</template>
