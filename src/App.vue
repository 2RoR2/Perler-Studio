<template>
  <main class="landing-shell overflow-hidden">
    <AuroraCursor />
    <transition name="opening-fade">
      <WebGlIntro
        v-if="showOpening"
        @complete="handleEnterSite"
      />
    </transition>

    <div class="container-fluid px-3 px-lg-4 py-3 py-lg-4 position-relative">
      <section class="hero-panel mx-auto">
        <AppHeader />
        <router-view v-slot="{ Component, route }">
          <transition name="route-fade" mode="out-in">
            <div :key="route.fullPath" class="route-stage">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </section>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import AppHeader from "./components/AppHeader.vue";
import AuroraCursor from "./components/AuroraCursor.vue";
import WebGlIntro from "./components/WebGlIntro.vue";

const showOpening = ref(true);

function handleEnterSite() {
  showOpening.value = false;
}
</script>
