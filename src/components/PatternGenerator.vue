<template>
  <section
    class="pattern-generator rounded-5 p-4 p-lg-5"
    tabindex="0"
    @paste="handlePaste"
  >
    <div class="generator-header d-flex flex-wrap justify-content-between align-items-end gap-3">
      <div>
        <p class="pattern-label">Upload and Generate</p>
        <h2 class="generator-title">Image To Perler Diagram</h2>
        <p class="generator-copy">
          Upload an image and the app will convert it into a bead-style grid
          with row and column guides, color codes, and a palette legend.
        </p>
      </div>

      <div class="generator-controls">
        <label class="generator-control">
          <span>Pegboard Plate</span>
          <select v-model="plateId">
            <option
              v-for="plate in plateOptions"
              :key="plate.id"
              :value="plate.id"
            >
              {{ plate.label }}
            </option>
          </select>
        </label>
        <label class="generator-control">
          <span>Plate Grid</span>
          <input :value="`${selectedPlate.cols} x ${selectedPlate.rows}`" type="text" readonly />
        </label>
        <label class="generator-control">
          <span>Bead Cell Size</span>
          <input :value="`${cellSize}px`" type="text" readonly />
        </label>
        <label class="generator-control">
          <span>Bead Brand</span>
          <select v-model="beadBrand">
            <option value="perler">Perler</option>
            <option value="artkal">Artkal</option>
            <option value="hama">Hama</option>
            <option value="mard">MARD</option>
          </select>
        </label>
        <label class="generator-control">
          <span>Bead Style</span>
          <select v-model="beadStyle">
            <option value="square">Square</option>
            <option value="round">Round</option>
            <option value="hollow">Hollow</option>
          </select>
        </label>
        <label class="generator-control">
          <span>Grid Spacing</span>
          <select v-model="gridSpacing">
            <option value="none">None</option>
            <option value="small">Small</option>
            <option value="large">Large</option>
          </select>
        </label>
      </div>
    </div>

    <div class="generator-toolbar mt-4">
      <label class="upload-button">
        <input type="file" accept="image/*" @change="handleFileChange" />
        Upload Image
      </label>
      <span class="paste-hint">or copy an image and press Ctrl+V here</span>
      <button
        class="btn btn-dark rounded-pill px-4"
        type="button"
        :disabled="!sourceImageUrl || generating"
        @click="generateDiagram"
      >
        {{ generating ? "Generating..." : "Generate Diagram" }}
      </button>
      <label class="tool-toggle">
        <input v-model="mirrorMode" type="checkbox" />
        <span>Mirror</span>
      </label>
      <label class="tool-toggle">
        <input v-model="removeClutter" type="checkbox" />
        <span>Remove Clutter</span>
      </label>
    </div>

    <p v-if="errorMessage" class="generator-error mt-3">{{ errorMessage }}</p>

    <div v-if="sourceImageUrl" class="generator-preview-grid mt-4">
      <div class="source-preview rounded-5 p-3">
        <p class="preview-kicker">Uploaded Image</p>
        <img :src="sourceImageUrl" alt="Uploaded reference" class="preview-image" />
        <p class="preview-meta mt-3 mb-0">{{ currentImageLabel }}</p>
      </div>

      <div v-if="diagram" class="diagram-preview rounded-5 p-3">
        <p class="preview-kicker">Perler Diagram</p>
        <div class="diagram-summary mb-3">
          <div class="diagram-summary-card">
            <span class="diagram-summary-label">Pattern Size</span>
            <strong>{{ diagram.width }} x {{ diagram.height }} beads</strong>
          </div>
          <div class="diagram-summary-card">
            <span class="diagram-summary-label">Material Brand</span>
            <strong>{{ diagram.brand }}</strong>
          </div>
          <div class="diagram-summary-card">
            <span class="diagram-summary-label">Total Beads</span>
            <strong>{{ totalBeads.toLocaleString() }}</strong>
          </div>
        </div>
        <div class="diagram-exportbar mb-3">
          <button class="export-chip" type="button" @click="exportDiagramImage">Export PNG</button>
          <button class="export-chip" type="button" @click="exportDiagramPdf">Export PDF</button>
          <button class="export-chip" type="button" @click="exportDiagramJson">Export JSON</button>
        </div>
        <div ref="diagramViewportRef" class="diagram-scroll diagram-fit">
          <div
            :class="[
              'diagram-wrapper',
              `diagram-spacing-${gridSpacing}`,
              `diagram-style-${beadStyle}`
            ]"
            :style="{
              '--diagram-cols': diagram.width,
              '--diagram-rows': diagram.height,
              '--cell-size': `${displayCellSize}px`
            }"
          >
            <div class="diagram-top-left"></div>

            <div class="diagram-axis diagram-axis-top">
              <span
                v-for="column in diagram.columns"
                :key="`top-${column}`"
                class="axis-cell"
              >
                {{ column }}
              </span>
            </div>

            <div class="diagram-axis diagram-axis-left">
              <span
                v-for="row in diagram.rows"
                :key="`left-${row}`"
                class="axis-cell"
              >
                {{ row }}
              </span>
            </div>

            <div class="diagram-grid">
              <div
                v-for="(cell, index) in diagram.cells"
                :key="index"
                :class="[
                  'diagram-cell',
                  {
                    'diagram-cell-active': selectedCode === cell.code,
                    'diagram-cell-muted': selectedCode && selectedCode !== cell.code
                  }
                ]"
                :style="{
                  backgroundColor: cell.hex,
                  color: cell.textColor
                }"
              >
                {{ cell.code }}
              </div>
            </div>
          </div>
        </div>

        <div class="legend-wrap mt-4">
          <button
            v-for="item in diagram.legend"
            :key="item.code"
            type="button"
            :class="[
              'legend-chip',
              {
                'legend-chip-active': selectedCode === item.code,
                'legend-chip-muted': selectedCode && selectedCode !== item.code
              }
            ]"
            :style="{ backgroundColor: item.hex, color: item.textColor }"
            @click="toggleSelectedCode(item.code)"
          >
            {{ item.code }} ({{ item.count }})
          </button>
        </div>
      </div>
    </div>

    <div v-if="imageHistory.length" class="history-strip mt-4">
      <p class="preview-kicker">Previous Images</p>
      <div class="history-grid">
        <button
          v-for="item in imageHistory"
          :key="item.id"
          type="button"
          class="history-card"
          :title="item.label"
          :aria-label="`Restore ${item.label}`"
          @click="restoreHistoryImage(item.id)"
        >
          <img :src="item.url" :alt="item.label" class="history-image" />
        </button>
      </div>
    </div>

    <p v-else class="generator-helper mt-4">
      Upload a reference image here on the Patterns page to generate your bead
      diagram.
    </p>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { brandPalettes } from "../data/studio";

const plateOptions = [
  {
    id: "small-square",
    label: "Small Square Plate",
    cols: 29,
    rows: 29,
    cellSize: 22
  },
  {
    id: "small-rectangle",
    label: "Rectangle Plate",
    cols: 58,
    rows: 29,
    cellSize: 18
  },
  {
    id: "large-square",
    label: "Large Square Plate",
    cols: 58,
    rows: 58,
    cellSize: 14
  },
  {
    id: "tall-rectangle",
    label: "Tall Rectangle Plate",
    cols: 29,
    rows: 58,
    cellSize: 18
  }
];

const plateId = ref(plateOptions[0].id);
const cellSize = ref(plateOptions[0].cellSize);
const beadBrand = ref("perler");
const beadStyle = ref("square");
const gridSpacing = ref("small");
const mirrorMode = ref(false);
const removeClutter = ref(false);
const sourceImageUrl = ref("");
const currentImageLabel = ref("");
const imageHistory = ref([]);
const diagram = ref(null);
const errorMessage = ref("");
const generating = ref(false);
const diagramViewportRef = ref(null);
const viewportWidth = ref(0);
const selectedCode = ref("");

let imageCounter = 0;
const objectUrls = new Set();
let resizeObserver = null;

const selectedPlate = computed(
  () => plateOptions.find((plate) => plate.id === plateId.value) || plateOptions[0]
);
const activeBrandLabel = computed(() => ({
  perler: "Perler",
  artkal: "Artkal",
  hama: "Hama",
  mard: "MARD"
}[beadBrand.value] || "Perler"));
const paletteWithRgb = computed(() =>
  (brandPalettes[beadBrand.value] || brandPalettes.perler).map((color) => ({
    ...color,
    ...hexToRgb(color.hex)
  }))
);

const displayCellSize = computed(() => {
  if (!diagram.value) {
    return cellSize.value;
  }

  const availableWidth = viewportWidth.value || 0;

  if (!availableWidth) {
    return cellSize.value;
  }

  const axisCells = 1;
  const totalCells = diagram.value.width + axisCells;
  const fitted = Math.floor((availableWidth - 12) / totalCells);

  return Math.max(10, Math.min(cellSize.value, fitted || cellSize.value));
});

const totalBeads = computed(() => diagram.value?.cells.length || 0);

function getImageLabel(file, source) {
  if (file?.name) {
    return file.name;
  }

  imageCounter += 1;

  return source === "paste"
    ? `Pasted image ${imageCounter}`
    : `Uploaded image ${imageCounter}`;
}

function setCurrentImage(url, label) {
  if (sourceImageUrl.value) {
    imageHistory.value = [
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        url: sourceImageUrl.value,
        label: currentImageLabel.value || "Previous image"
      },
      ...imageHistory.value
    ];
  }

  sourceImageUrl.value = url;
  currentImageLabel.value = label;
  diagram.value = null;
  errorMessage.value = "";
  selectedCode.value = "";
}

function applyImageFile(file, source = "upload") {
  if (!file) {
    return;
  }

  const nextUrl = URL.createObjectURL(file);
  const nextLabel = getImageLabel(file, source);

  objectUrls.add(nextUrl);
  setCurrentImage(nextUrl, nextLabel);
}

function handleFileChange(event) {
  const [file] = event.target.files || [];

  applyImageFile(file, "upload");
  event.target.value = "";
}

function handlePaste(event) {
  const items = event.clipboardData?.items || [];

  for (const item of items) {
    if (item.type.startsWith("image/")) {
      applyImageFile(item.getAsFile(), "paste");
      event.preventDefault();
      return;
    }
  }

  errorMessage.value = "Clipboard does not contain an image. Copy an image first, then press Ctrl+V here.";
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load image."));
    image.src = url;
  });
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");

  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  };
}

function getTextColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);

  return luminance > 165 ? "#111827" : "#ffffff";
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("")}`;
}

function getAverageRegionColor(context, startX, startY, width, height) {
  const imageData = context.getImageData(startX, startY, width, height).data;

  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;
  let count = 0;

  for (let index = 0; index < imageData.length; index += 4) {
    const pixelAlpha = imageData[index + 3] / 255;

    red += imageData[index] * pixelAlpha;
    green += imageData[index + 1] * pixelAlpha;
    blue += imageData[index + 2] * pixelAlpha;
    alpha += pixelAlpha;
    count += 1;
  }

  if (!count || alpha === 0) {
    return {
      hex: "#ffffff",
      textColor: "#111827"
    };
  }

  const r = Math.round(red / alpha);
  const g = Math.round(green / alpha);
  const b = Math.round(blue / alpha);
  const hex = rgbToHex(r, g, b);

  return {
    r,
    g,
    b,
    hex,
    textColor: getTextColor(hex)
  };
}

function getClosestPerlerColor(sampledColor) {
  return paletteWithRgb.value.reduce((closest, candidate) => {
    const redDelta = sampledColor.r - candidate.r;
    const greenDelta = sampledColor.g - candidate.g;
    const blueDelta = sampledColor.b - candidate.b;
    const distance = (2 * redDelta * redDelta) + (4 * greenDelta * greenDelta) + (3 * blueDelta * blueDelta);

    if (!closest || distance < closest.distance) {
      return {
        distance,
        color: candidate
      };
    }

    return closest;
  }, null)?.color || paletteWithRgb.value[0];
}

function getRegionPaletteMatch(context, startX, startY, width, height) {
  const imageData = context.getImageData(startX, startY, width, height).data;
  const scores = new Map();
  let strongestNonLight = null;

  for (let index = 0; index < imageData.length; index += 4) {
    const alpha = imageData[index + 3] / 255;

    if (alpha < 0.08) {
      continue;
    }

    const pixel = {
      r: imageData[index],
      g: imageData[index + 1],
      b: imageData[index + 2]
    };
    const matched = getClosestPerlerColor(pixel);
    const luminance = (0.299 * pixel.r) + (0.587 * pixel.g) + (0.114 * pixel.b);
    const maxChannel = Math.max(pixel.r, pixel.g, pixel.b);
    const minChannel = Math.min(pixel.r, pixel.g, pixel.b);
    const saturation = maxChannel === 0 ? 0 : (maxChannel - minChannel) / maxChannel;

    let weight = alpha;

    if (luminance < 70) {
      weight *= 2.8;
    } else if (luminance < 140) {
      weight *= 1.55;
    }

    if (saturation > 0.25) {
      weight *= 1.2;
    }

    const nextScore = (scores.get(matched.code)?.score || 0) + weight;
    scores.set(matched.code, {
      color: matched,
      score: nextScore
    });

    if (!["W01", "IV1", "C01", "C02", "GY2"].includes(matched.code)) {
      if (!strongestNonLight || nextScore > strongestNonLight.score) {
        strongestNonLight = {
          color: matched,
          score: nextScore
        };
      }
    }
  }

  const strongest = Array.from(scores.values()).sort((left, right) => right.score - left.score)[0];

  if (!strongest) {
    return paletteWithRgb.value[0];
  }

  if (
    ["W01", "IV1", "C01", "C02", "GY2"].includes(strongest.color.code) &&
    strongestNonLight &&
    strongestNonLight.score >= strongest.score * 0.42
  ) {
    return strongestNonLight.color;
  }

  return strongest.color;
}

function smoothCells(cells, width, height) {
  const nextCells = [...cells];

  for (let row = 0; row < height; row += 1) {
    for (let col = 0; col < width; col += 1) {
      const index = (row * width) + col;
      const neighborCodes = [];

      for (let y = -1; y <= 1; y += 1) {
        for (let x = -1; x <= 1; x += 1) {
          if ((x === 0 && y === 0) || row + y < 0 || row + y >= height || col + x < 0 || col + x >= width) {
            continue;
          }

          neighborCodes.push(cells[((row + y) * width) + (col + x)].code);
        }
      }

      const counts = neighborCodes.reduce((accumulator, code) => {
        accumulator.set(code, (accumulator.get(code) || 0) + 1);
        return accumulator;
      }, new Map());
      const strongest = Array.from(counts.entries()).sort((left, right) => right[1] - left[1])[0];

      if (strongest && strongest[1] >= 5 && strongest[0] !== cells[index].code) {
        const match = paletteWithRgb.value.find((item) => item.code === strongest[0]);

        if (match) {
          nextCells[index] = {
            code: match.code,
            hex: match.hex,
            textColor: getTextColor(match.hex)
          };
        }
      }
    }
  }

  return nextCells;
}

function getSpacingPixels() {
  return {
    none: 0,
    small: 1,
    large: 2
  }[gridSpacing.value] || 1;
}

function renderDiagramCanvas(diagramData) {
  const cell = 24;
  const axis = 24;
  const gap = getSpacingPixels();
  const width = axis + (diagramData.width * cell) + (Math.max(0, diagramData.width - 1) * gap);
  const height = axis + (diagramData.height * cell) + (Math.max(0, diagramData.height - 1) * gap);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = width + 2;
  canvas.height = height + 2;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = "700 10px Outfit, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";

  for (let col = 0; col < diagramData.width; col += 1) {
    const x = axis + (col * (cell + gap));
    context.fillStyle = "#ffffff";
    context.strokeStyle = "rgba(17, 24, 39, 0.12)";
    context.strokeRect(x, 0, cell, axis);
    context.fillStyle = "#111827";
    context.fillText(String(col + 1), x + (cell / 2), axis / 2);
  }

  for (let row = 0; row < diagramData.height; row += 1) {
    const y = axis + (row * (cell + gap));
    context.fillStyle = "#ffffff";
    context.strokeStyle = "rgba(17, 24, 39, 0.12)";
    context.strokeRect(0, y, axis, cell);
    context.fillStyle = "#111827";
    context.fillText(String(row + 1), axis / 2, y + (cell / 2));
  }

  diagramData.cells.forEach((item, index) => {
    const row = Math.floor(index / diagramData.width);
    const col = index % diagramData.width;
    const x = axis + (col * (cell + gap));
    const y = axis + (row * (cell + gap));

    context.fillStyle = item.hex;

    if (beadStyle.value === "round" || beadStyle.value === "hollow") {
      context.beginPath();
      context.arc(x + (cell / 2), y + (cell / 2), (cell / 2) - 1, 0, Math.PI * 2);
      context.fill();

      if (beadStyle.value === "hollow") {
        context.fillStyle = "#ffffff";
        context.beginPath();
        context.arc(x + (cell / 2), y + (cell / 2), (cell / 2) - 6, 0, Math.PI * 2);
        context.fill();
      }
    } else {
      context.fillRect(x, y, cell, cell);
    }

    context.strokeStyle = "rgba(17, 24, 39, 0.12)";
    context.strokeRect(x, y, cell, cell);
    context.fillStyle = item.textColor;
    context.fillText(item.code, x + (cell / 2), y + (cell / 2));
  });

  return canvas;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function exportDiagramImage() {
  if (!diagram.value) {
    return;
  }

  const canvas = renderDiagramCanvas(diagram.value);
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, "perler-diagram.png");
    }
  }, "image/png");
}

function exportDiagramJson() {
  if (!diagram.value) {
    return;
  }

  const payload = {
    brand: activeBrandLabel.value,
    beadStyle: beadStyle.value,
    gridSpacing: gridSpacing.value,
    width: diagram.value.width,
    height: diagram.value.height,
    totalBeads: totalBeads.value,
    legend: diagram.value.legend,
    cells: diagram.value.cells
  };

  downloadBlob(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    "perler-diagram.json"
  );
}

function exportDiagramPdf() {
  if (!diagram.value) {
    return;
  }

  const canvas = renderDiagramCanvas(diagram.value);
  const imageUrl = canvas.toDataURL("image/png");
  const printWindow = window.open("", "_blank", "width=1200,height=900");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>Perler Diagram PDF</title>
        <style>
          body { margin: 24px; font-family: Arial, sans-serif; }
          h1 { font-size: 20px; margin-bottom: 12px; }
          img { max-width: 100%; height: auto; display: block; }
        </style>
      </head>
      <body>
        <h1>${activeBrandLabel.value} Pattern Export</h1>
        <img src="${imageUrl}" alt="Perler diagram export" />
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}

function toggleSelectedCode(code) {
  selectedCode.value = selectedCode.value === code ? "" : code;
}

function restoreHistoryImage(id) {
  const targetIndex = imageHistory.value.findIndex((item) => item.id === id);

  if (targetIndex === -1) {
    return;
  }

  const [target] = imageHistory.value.splice(targetIndex, 1);

  if (sourceImageUrl.value) {
    imageHistory.value.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      url: sourceImageUrl.value,
      label: currentImageLabel.value || "Previous image"
    });
  }

  sourceImageUrl.value = target.url;
  currentImageLabel.value = target.label;
  diagram.value = null;
  errorMessage.value = "";
  selectedCode.value = "";
}

async function generateDiagram() {
  if (!sourceImageUrl.value) {
    errorMessage.value = "Upload an image first.";
    return;
  }

  generating.value = true;
  errorMessage.value = "";

  try {
    const image = await loadImage(sourceImageUrl.value);
    const width = selectedPlate.value.cols;
    const height = selectedPlate.value.rows;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { willReadFrequently: true });
    const boardRatio = width / height;
    const imageRatio = image.width / image.height;
    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imageRatio > boardRatio) {
      drawHeight = width / imageRatio;
      offsetY = (height - drawHeight) / 2;
    } else {
      drawWidth = height * imageRatio;
      offsetX = (width - drawWidth) / 2;
    }

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.imageSmoothingEnabled = true;

    if (mirrorMode.value) {
      context.save();
      context.translate(width, 0);
      context.scale(-1, 1);
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      context.restore();
    } else {
      context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    }

    const cells = [];
    const usageMap = new Map();

    for (let row = 0; row < height; row += 1) {
      for (let col = 0; col < width; col += 1) {
        const matchedColor = getRegionPaletteMatch(
          context,
          col,
          row,
          1,
          1
        );

        cells.push({
          code: matchedColor.code,
          hex: matchedColor.hex,
          textColor: getTextColor(matchedColor.hex)
        });

        const existing = usageMap.get(matchedColor.code) || {
          code: matchedColor.code,
          hex: matchedColor.hex,
          count: 0,
          textColor: getTextColor(matchedColor.hex),
          name: matchedColor.name
        };

        existing.count += 1;
        usageMap.set(matchedColor.code, existing);
      }
    }

    const finalCells = removeClutter.value ? smoothCells(cells, width, height) : cells;
    const finalUsageMap = new Map();

    finalCells.forEach((item) => {
      const existing = finalUsageMap.get(item.code) || {
        code: item.code,
        hex: item.hex,
        count: 0,
        textColor: item.textColor,
        name: paletteWithRgb.value.find((paletteItem) => paletteItem.code === item.code)?.name || item.code
      };

      existing.count += 1;
      finalUsageMap.set(item.code, existing);
    });

    const legend = Array.from(finalUsageMap.values()).sort((left, right) => right.count - left.count);

    selectedCode.value = "";
    diagram.value = {
      brand: activeBrandLabel.value,
      width,
      height,
      columns: Array.from({ length: width }, (_, index) => index + 1),
      rows: Array.from({ length: height }, (_, index) => index + 1),
      cells: finalCells,
      legend
    };
  } catch (error) {
    errorMessage.value = "Something went wrong while generating the diagram.";
  } finally {
    generating.value = false;
  }
}

onBeforeUnmount(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));

  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

onMounted(() => {
  if (!diagramViewportRef.value) {
    return;
  }

  resizeObserver = new ResizeObserver((entries) => {
    const [entry] = entries;

    if (entry) {
      viewportWidth.value = entry.contentRect.width;
    }
  });

  resizeObserver.observe(diagramViewportRef.value);
});

watch(
  plateId,
  () => {
    cellSize.value = selectedPlate.value.cellSize;
    selectedCode.value = "";
  },
  { immediate: true }
);

</script>
