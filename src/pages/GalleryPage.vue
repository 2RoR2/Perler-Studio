<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-8">
        <p class="hero-kicker">Pattern gallery</p>
        <h1 class="page-title">GALLERY</h1>
        <p class="page-copy">
          Explore example Perler Beads directions for flowers, pixel icons, and
          playful color themes that can inspire your next craft project.
        </p>
      </div>
    </div>

    <div class="row g-4 mt-2">
      <div
        v-for="card in galleryCards"
        :key="card.title"
        class="col-12 col-md-6 col-xl-4"
      >
        <article class="gallery-card rounded-5 p-4 h-100">
          <div
            v-if="card.image"
            class="gallery-swatch gallery-photo rounded-4 mb-4"
          >
            <img
              :src="galleryImages[card.image]"
              :alt="`${card.title} idea`"
              class="gallery-photo-image"
            />
          </div>
          <div
            v-else
            class="gallery-swatch rounded-4 mb-4"
            :class="card.toneClass"
          />
          <p class="gallery-kicker">Pattern idea</p>
          <h2 class="gallery-title">{{ card.title }}</h2>
          <p class="gallery-copy">{{ card.copy }}</p>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup>
import hairClip from "../images/hair_clip.jpg";
import magneticLightDecorative from "../images/magnetic_light_decorative.jpg";
import wireTie from "../images/wire_tie.jpg";
import { galleryCards } from "../data/studio";

const galleryImages = {
  "hair-clip": hairClip,
  "magnetic-light-decorative": magneticLightDecorative,
  "wire-tie": wireTie
};
</script>
