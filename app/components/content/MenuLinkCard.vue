<script setup lang="ts">
export interface FileCardProps {
  icon: string
  name: string
  description: string
  to: string
  toCode: string
}

const props = defineProps<FileCardProps>()
</script>

<template>
  <div class="flex flex-1">
    <UPageCard
      variant="ghost"
      :to="props.to"
      class="flex-1"
    >
      <template #body>
        <UUser
          :name="props.name"
          :description="props.description"
          size="xl"
          class="gap-4"
        >
          <template #avatar>
            <UIcon
              :name="props.icon"
              class="size-6"
            />
          </template>
        </UUser>
      </template>
    </UPageCard>

    <UButton
      variant="link"
      size="lg"
      :to="props.toCode"
      class="min-w-12 sm:min-w-16 items-center justify-center"
    >
      <UTooltip text="Open source on GitHub">
        <UIcon
          name="i-lucide-code-xml"
          class="size-5"
        />
      </UTooltip>
    </UButton>
  </div>
</template>
