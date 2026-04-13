<template>
  <div>
    <HeroIntro />

    <section class="marquee-band mt-4" aria-label="Creative highlights">
      <div class="marquee-track">
        <span
          v-for="(item, index) in marqueeItems"
          :key="`${item}-${index}`"
          class="marquee-item"
        >
          {{ item }}
        </span>
      </div>
    </section>

    <div class="row g-4 mt-2 align-items-stretch">
      <div class="col-12 col-lg-8">
        <PreviewBoard
          title="Pattern preview board"
          label="Pattern planning"
          copy="Map bead colors on a simple board before building your real piece, so you can test balance, spacing, and contrast first."
          :tags="['Bead layout', 'Color preview']"
          :panels="panels"
        />
      </div>

      <div class="col-12 col-lg-4">
        <StatsSidebar
          kicker="What the app does"
          title-top="PLAN"
          title-bottom="AND BUILD"
          copy="Users can prepare Perler Beads ideas, compare palettes, and preview a pegboard design before starting the final craft."
        />
      </div>
    </div>

    <section class="landing-section mt-4">
      <div class="tile-layout">
        <article class="tile-card tile-card-large tile-card-warm rounded-5 p-4 p-lg-5">
          <p class="tile-label">Pattern setup</p>
          <h2 class="tile-title">Build a bead board plan that reads clearly at first glance.</h2>
          <p class="tile-copy">
            Sketch your Perler Beads design digitally first so the final board
            layout is easier to follow when you start placing beads.
          </p>
          <div class="tile-dots" aria-hidden="true">
            <span class="tile-dot tile-dot-coral"></span>
            <span class="tile-dot tile-dot-gold"></span>
            <span class="tile-dot tile-dot-mint"></span>
          </div>
        </article>

        <article class="tile-card tile-card-tall tile-card-cool rounded-5 p-4">
          <p class="tile-label">Color system</p>
          <h2 class="tile-title tile-title-sm">Compare palettes with more confidence</h2>
          <p class="tile-copy">
            Try bright, pastel, or mixed bead palettes to see which colors work
            best for characters, flowers, icons, or pixel art scenes.
          </p>
        </article>

        <article class="tile-card tile-card-mini tile-card-soft rounded-5 p-4">
          <p class="tile-label">Quick shop</p>
          <h2 class="tile-title tile-title-xs">Grab supplies fast</h2>
          <p class="tile-copy">
            Shop bead jars, pegboards, and tool kits from the store.
          </p>
        </article>

        <article class="tile-card tile-card-mini tile-card-lime rounded-5 p-4">
          <p class="tile-label">Studio time</p>
          <h2 class="tile-title tile-title-xs">Book your next session</h2>
          <p class="tile-copy">
            Reserve a table, private booth, or guided build slot.
          </p>
        </article>

        <article class="tile-card tile-card-wide tile-card-glass rounded-5 p-4 p-lg-5">
          <div class="tile-wide-content">
            <div>
              <p class="tile-label">Creative flow</p>
              <h2 class="tile-title tile-title-sm">From idea to pegboard in one playful workflow</h2>
            </div>
            <div class="tile-motion" aria-hidden="true">
              <span class="tile-motion-bar tile-motion-bar-one"></span>
              <span class="tile-motion-bar tile-motion-bar-two"></span>
              <span class="tile-motion-bar tile-motion-bar-three"></span>
            </div>
          </div>
        </article>
      </div>
    </section>

    <section class="landing-section mt-4">
      <div class="cta-banner rounded-5 p-4 p-lg-5">
        <div class="row g-4 align-items-center">
          <div class="col-12 col-lg-8">
            <p class="feature-label text-dark mb-2">Ready to design</p>
            <h2 class="cta-title">Turn Perler Beads ideas into a colorful pattern plan before you build.</h2>
            <p class="cta-copy">
              This app helps you organize layouts, pick bead colors, and prepare
              a craft-ready design in a clean browser workspace.
            </p>
          </div>

          <div class="col-12 col-lg-4">
            <div class="d-flex flex-wrap gap-3 justify-content-lg-end">
              <RouterLink to="/store" class="btn btn-dark btn-lg rounded-pill px-4">
                Shop Beads
              </RouterLink>
              <RouterLink to="/booking" class="btn btn-light btn-lg rounded-pill px-4">
                Reserve Studio
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import HeroIntro from "../components/HeroIntro.vue";
import PreviewBoard from "../components/PreviewBoard.vue";
import StatsSidebar from "../components/StatsSidebar.vue";

const panels = [
  {
    kicker: "Board view",
    copy: "Preview rows and colors before laying beads on the pegboard"
  },
  {
    kicker: "Palette check",
    copy: "Test bright and pastel bead mixes for clearer finished designs"
  }
];

const marqueeItems = [
  "Flower pattern ideas",
  "Character bead layouts",
  "Pastel color matching",
  "Pegboard planning tips",
  "Fuse-ready previews",
  "Perler Beads inspiration"
];

marqueeItems.push(...marqueeItems);
</script>
