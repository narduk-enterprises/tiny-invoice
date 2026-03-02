<script setup lang="ts">
useSeo({
  title: 'TinyInvoice — Simple Invoicing for Freelancers',
  description: 'Create and manage professional invoices, track clients, and get paid. Built for freelancers.',
  ogImage: { title: 'TinyInvoice', description: 'Simple invoicing for freelancers', icon: '📄' },
})
useWebPageSchema({
  name: 'TinyInvoice',
  description: 'Create and manage professional invoices for your freelance business.',
})
</script>

<template>
  <UPage>
    <UPageHero
      title="Invoicing made simple"
      description="Create professional invoices, manage clients, and track payments — all in one place. Built for freelancers on Nuxt 4 and Cloudflare."
    >
      <template #links>
        <UButton to="/register" color="primary" icon="i-lucide-plus">
          Get started
        </UButton>
        <UButton to="/login" color="neutral" variant="outline" icon="i-lucide-log-in">
          Log in
        </UButton>
      </template>
    </UPageHero>
    <section class="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <UCard class="card-base">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="size-5 text-primary" />
            <span class="font-semibold">Create invoices</span>
          </div>
        </template>
        <p class="text-muted text-sm">
          Add line items, set due dates, and send professional PDF-ready invoices to your clients.
        </p>
      </UCard>
      <UCard class="card-base">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="size-5 text-primary" />
            <span class="font-semibold">Manage clients</span>
          </div>
        </template>
        <p class="text-muted text-sm">
          Keep client details in one place and attach them to invoices with one click.
        </p>
      </UCard>
      <UCard class="card-base">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-trending-up" class="size-5 text-primary" />
            <span class="font-semibold">Track payments</span>
          </div>
        </template>
        <p class="text-muted text-sm">
          See revenue, outstanding balances, and invoice status at a glance on your dashboard.
        </p>
      </UCard>
    </section>
  </UPage>
</template>
