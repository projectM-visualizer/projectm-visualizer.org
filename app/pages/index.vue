<script setup lang="ts">
import { Hero } from '@/components/pages/home/hero';
import { Projects } from '@/components/pages/home/projects';
import { Contributors } from '@/components/pages/home/contributors';
import { About } from '@/components/pages/home/about';
import { Connect } from '@/components/pages/home/connect';

const { home } = useDataStore()

</script>

<template>
  <div>
    <!-- hero -->
    <Hero v-bind="home.hero" />

    <!-- projects -->
     <Projects v-bind="home.projects" />

    <!-- contributors -->
    <Contributors v-bind="home.contributors" />

    <!-- about -->
    <About v-bind="home.about" />

    <!-- connect -->
    <Connect v-bind="home.connect" />
  </div>
</template>
