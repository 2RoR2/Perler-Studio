<template>
  <div class="insight-column h-100">
    <div class="insight-block light-block rounded-5 p-4 mb-4">
      <p class="insight-kicker">{{ kicker }}</p>
      <h3 class="insight-title">
        {{ titleTop }}
        <span>{{ titleBottom }}</span>
      </h3>
      <p class="insight-copy">{{ copy }}</p>
    </div>

    <div class="insight-block dark-block rounded-5 p-4">
      <div class="row row-cols-1 g-3">
        <div
          v-for="item in stats"
          :key="item.label"
          class="col"
        >
          <div class="stat-card rounded-4 p-3">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { stats } from "../data/studio";

defineProps({
  copy: {
    type: String,
    required: true
  },
  kicker: {
    type: String,
    required: true
  },
  titleBottom: {
    type: String,
    required: true
  },
  titleTop: {
    type: String,
    required: true
  }
});
</script>
