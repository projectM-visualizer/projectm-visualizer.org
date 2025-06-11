<script setup lang="ts">
export interface LogoProps {
    src: string;
    alt: string;
    text: string;
    showText?: boolean;
    link?: string;
    enableLink?: boolean;
    size?: "sm" | "md" | "lg";
}

const props = defineProps<LogoProps>();

const size = computed(() => ({
  sm: "h-6",
  md: "h-8",
  lg: "h-10",
}[props.size ?? "md"]));
</script>

<template>
  <component
    :is="props.enableLink ? 'NuxtLink' : 'div'"
    :to="props.enableLink ? props.link : undefined"
    class="flex items-center gap-2 font-semibold md:text-base"
  >
    <NuxtImg
      v-if="props.src"
      :src="props.src"
      :alt="props.alt"
      :class="size"
      crossorigin="anonymous"
    />
    <span v-if="props.alt" class="sr-only">{{ props.alt }}</span>
    <span v-if="(props.showText || !props.src) && props.text" class="font-logo text-lg md:text-xl">{{ props.text }}</span>
  </component>
</template>
