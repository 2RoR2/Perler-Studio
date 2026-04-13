<template>
  <div class="row g-4 g-xl-5 align-items-end hero-main">
    <div class="col-12 col-xl-7">
      <div class="hero-copy">
        <div class="hero-orbit hero-orbit-one" aria-hidden="true"></div>
        <div class="hero-orbit hero-orbit-two" aria-hidden="true"></div>
        <div class="headline-stack">
          <p class="hero-kicker">Plan your next bead masterpiece</p>
          <h1 class="hero-title">
            PERLER
            <span>BEADS</span>
            STUDIO
          </h1>
        </div>

        <div class="hero-copy-row row g-4 align-items-end">
          <div class="col-12 col-lg-7">
            <p class="hero-description">
              Design Perler Beads projects with a playful digital workspace for
              mapping colors, previewing pegboard layouts, and organizing your
              next bead pattern idea.
            </p>
            <div class="hero-chip-row d-flex flex-wrap gap-2 mt-4">
              <span
                v-for="item in chips"
                :key="item"
                class="hero-chip"
              >
                {{ item }}
              </span>
            </div>
          </div>
          <div class="col-12 col-lg-5">
            <div class="hero-actions d-flex flex-wrap gap-3 justify-content-lg-end">
              <RouterLink
                to="/store"
                class="btn btn-lg rounded-pill px-4 hero-button fw-semibold"
              >
                Shop Beads
              </RouterLink>
              <RouterLink
                to="/booking"
                class="btn btn-lg rounded-pill px-4 hero-ghost fw-semibold"
              >
                Book Studio
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-xl-5">
      <div class="hero-sidepanel">
        <div class="floating-card floating-card-primary card border-0 rounded-4 p-3 mb-3 backdrop-blur-xl">
          <div class="small text-uppercase text-light-emphasis fw-semibold mb-2">
            Bead palette
          </div>
          <div class="d-flex gap-2">
            <span
              v-for="(tone, index) in palette"
              :key="index"
              class="palette-dot"
              :class="tone"
            />
          </div>
        </div>

        <div class="floating-card secondary-card card border-0 rounded-4 p-3 ms-auto">
          <div class="small text-uppercase text-light-emphasis fw-semibold mb-1">
            Project note
          </div>
          <div class="secondary-copy">
            Use this page to sketch ideas before sorting beads by color and row.
          </div>
        </div>

        <div class="floating-card accent-card card border-0 rounded-4 p-3 mt-3">
          <div class="small text-uppercase fw-semibold mb-1">
            Maker tip
          </div>
          <div class="secondary-copy">
            Plan your palette first so the final Perler Beads pattern is easier
            to place and assemble.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { palette } from "../data/studio";

const chips = ["Board Planning", "Color Matching", "Fuse Prep"];
</script>
