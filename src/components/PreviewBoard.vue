<template>
  <div class="studio-board rounded-5 p-4 p-lg-5">
    <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
      <div>
        <p class="mb-1 text-uppercase board-label">Preview board</p>
        <h2 class="h3 mb-0 fw-bold board-title">{{ title }}</h2>
      </div>
      <div class="d-flex gap-2 flex-wrap">
        <span
          v-for="tag in tags"
          :key="tag"
          class="badge board-badge rounded-pill px-3 py-2"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="row g-4 align-items-center">
      <div class="col-12 col-md-7">
        <div class="bead-grid">
          <div
            v-for="(bead, index) in beads"
            :key="index"
            class="bead-cell"
            :class="bead"
          />
        </div>
      </div>

      <div class="col-12 col-md-5">
        <div class="board-story">
          <p class="story-label">{{ label }}</p>
          <p class="story-copy">{{ copy }}</p>
          <div class="d-grid gap-3">
            <div
              v-for="item in panels"
              :key="item.kicker"
              class="mini-panel rounded-4 p-3"
            >
              <div class="mini-kicker">{{ item.kicker }}</div>
              <div class="mini-copy">{{ item.copy }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { beads } from "../data/studio";

defineProps({
  copy: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  panels: {
    type: Array,
    required: true
  },
  tags: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    required: true
  }
});
</script>
