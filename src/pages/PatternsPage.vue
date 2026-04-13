<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-8">
        <p class="hero-kicker">Pattern workflow</p>
        <h1 class="page-title">PATTERNS</h1>
        <p class="page-copy">
          Follow a simple planning flow for turning a Perler Beads idea into a
          bead-by-bead layout you can build on a real pegboard.
        </p>
      </div>
    </div>

    <div class="row g-4 mt-2">
      <div class="col-12 col-lg-7">
        <PreviewBoard
          title="Pattern building steps"
          label="How it works"
          copy="These steps help users move from idea to board plan while keeping the current app lightweight and easy to understand."
          :tags="['Plan first', 'Build next']"
          :panels="panels"
        />
      </div>

      <div class="col-12 col-lg-5">
        <div class="pattern-steps rounded-5 p-4 p-lg-5 h-100">
          <div
            v-for="step in patternSteps"
            :key="step.label"
            class="pattern-step"
          >
            <p class="pattern-label">{{ step.label }}</p>
            <h2 class="pattern-title">{{ step.title }}</h2>
            <p class="pattern-copy">{{ step.copy }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <PatternGenerator />
    </div>
  </div>
</template>

<script setup>
import PatternGenerator from "../components/PatternGenerator.vue";
import PreviewBoard from "../components/PreviewBoard.vue";
import { patternSteps } from "../data/studio";

const panels = [
  {
    kicker: "Reference",
    copy: "Choose a simple shape, sprite, flower, or icon as the pattern guide"
  },
  {
    kicker: "Placement",
    copy: "Refine spacing and color rows before starting the physical build"
  }
];
</script>
