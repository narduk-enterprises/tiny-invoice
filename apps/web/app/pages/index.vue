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
    <div class="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 mb-12 overflow-hidden rounded-b-2xl">
      <!-- Brand gradient atmosphere (diagonal flow) -->
      <div
        class="absolute inset-0 z-0 opacity-90 dark:opacity-95"
        style="background: linear-gradient(135deg, rgb(13 148 136 / 0.12) 0%, rgb(120 113 108 / 0.06) 50%, rgb(41 37 36 / 0.04) 100%);"
      />
      <div class="absolute inset-0 bg-default/85 dark:bg-default/88 z-1" />
      <NuxtImg
        src="/images/hero-bg.webp"
        alt=""
        class="absolute inset-0 w-full h-full object-cover object-center z-0"
        width="1200"
        height="480"
        fetchpriority="high"
        format="webp"
      />
      <div class="relative z-2 px-4 sm:px-6 lg:px-8 pt-12 pb-16 sm:pt-16 sm:pb-20">
        <UPageHero
          title="Invoicing made simple"
          description="Create professional invoices, manage clients, and track payments — all in one place. Built for freelancers."
        >
          <template #links>
            <UButton to="/register" color="primary" icon="i-lucide-plus" size="lg" class="transition-base">
              Get started
            </UButton>
            <UButton to="/login" color="neutral" variant="outline" icon="i-lucide-log-in" size="lg" class="transition-base">
              Log in
            </UButton>
            <ULink to="/login?demo=1" class="text-sm text-muted hover:text-primary transition-base">
              Or try the demo
            </ULink>
          </template>
        </UPageHero>
      </div>
    </div>
    <section class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <UCard class="card-base animate-count-in" style="animation-delay: 0.1s">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-file-text" class="size-5 text-primary" />
            <span class="font-semibold">Create invoices</span>
          </div>
        </template>
        <div class="p-5">
          <p class="text-muted text-sm">
            Add line items, set due dates, and send professional PDF-ready invoices to your clients.
          </p>
        </div>
      </UCard>
      <UCard class="card-base animate-count-in" style="animation-delay: 0.2s">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-users" class="size-5 text-primary" />
            <span class="font-semibold">Manage clients</span>
          </div>
        </template>
        <div class="p-5">
          <p class="text-muted text-sm">
            Keep client details in one place and attach them to invoices with one click.
          </p>
        </div>
      </UCard>
      <UCard class="card-base animate-count-in" style="animation-delay: 0.3s">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-trending-up" class="size-5 text-primary" />
            <span class="font-semibold">Track payments</span>
          </div>
        </template>
        <div class="p-5">
          <p class="text-muted text-sm">
            See revenue, outstanding balances, and invoice status at a glance on your dashboard.
          </p>
        </div>
      </UCard>
    </section>
  </UPage>
</template>
