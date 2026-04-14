<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-8">
        <p class="hero-kicker">Beads and equipment</p>
        <h1 class="page-title">STORE</h1>
        <p class="page-copy">
          Shop bead mixes, pegboards, and studio tools for building Perler
          projects with a cleaner setup from planning to final fuse.
        </p>
      </div>

      <div class="col-12 col-lg-4">
        <div class="store-summary store-summary-sticky rounded-5 p-4">
          <p class="pattern-label">Cart Summary</p>
          <h2 class="pattern-title">
            {{ currentUser ? `${totalItems} items selected` : "Login required" }}
          </h2>
          <p class="pattern-copy">
            {{ currentUser
              ? "Build a starter cart with the bead colors, boards, and tools you want before booking your next studio session."
              : "Sign up or log in before using the store to browse products and add items to your cart." }}
          </p>

          <div v-if="currentUser" class="store-cart-summary mt-4">
            <div v-if="cartMessage" class="booking-feedback booking-feedback-success">
              {{ cartMessage }}
            </div>

            <div class="store-cart-meta">
              <div class="store-cart-stat">
                <span>Items</span>
                <strong>{{ totalItems }}</strong>
              </div>
              <div class="store-cart-stat">
                <span>Subtotal</span>
                <strong>${{ (cartTotal / 100).toFixed(2) }}</strong>
              </div>
            </div>

            <div v-if="!cartItems.length" class="booking-history-empty mt-3">
              Your cart is empty. Add bead kits, boards, or tools to see them here.
            </div>

            <div v-if="cartItems.length" class="store-cart-list mt-3">
              <article v-for="item in cartItems" :key="item.id" class="store-cart-item">
                <div>
                  <strong>{{ item.name }}</strong>
                  <p class="mb-0">{{ item.quantity }} x {{ item.price }}</p>
                  <p class="mb-0 store-cart-line-total">Line total: ${{ (item.lineTotalCents / 100).toFixed(2) }}</p>
                </div>
                <div class="store-cart-controls">
                  <button class="btn btn-light rounded-pill px-3" type="button" @click="removeFromCart(item.id)">
                    -
                  </button>
                  <span>{{ item.quantity }}</span>
                  <button class="btn btn-dark rounded-pill px-3" type="button" @click="addToCart(item.id)">
                    +
                  </button>
                </div>
              </article>
            </div>

            <div v-if="cartItems.length" class="store-total-row mt-3">
              <strong>Total</strong>
              <span>${{ (cartTotal / 100).toFixed(2) }}</span>
            </div>

            <button
              v-if="cartItems.length"
              class="btn btn-dark btn-lg rounded-pill px-4 mt-4 w-100"
              type="button"
              @click="saveCartNotice"
            >
              Save Cart For Later
            </button>

            <button
              v-if="cartItems.length"
              class="btn btn-light btn-lg rounded-pill px-4 mt-3 w-100"
              type="button"
              @click="clearCart"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mt-2">
      <div v-if="currentUser" class="col-12">
        <div class="filter-bar rounded-5 p-3 p-lg-4">
          <div class="filter-group">
            <span class="filter-label">Category</span>
            <button
              v-for="category in storeCategories"
              :key="category"
              type="button"
              class="filter-pill"
              :class="{ 'filter-pill-active': selectedCategory === category }"
              @click="selectedCategory = category"
            >
              {{ category }}
            </button>
          </div>
        </div>
      </div>

      <template v-if="currentUser">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="col-12 col-md-6 col-xl-4"
        >
          <article class="store-card rounded-5 p-4 h-100">
            <div
              v-if="product.image"
              class="store-swatch store-photo rounded-4 mb-4"
            >
              <img
                :src="storeImages[product.image]"
                :alt="product.name"
                class="store-photo-image"
              />
              <span class="store-badge">{{ product.badge }}</span>
            </div>
            <div v-else class="store-swatch rounded-4 mb-4" :class="product.toneClass">
              <span class="store-badge">{{ product.badge }}</span>
            </div>
            <p class="gallery-kicker">{{ product.category }}</p>
            <div class="d-flex justify-content-between align-items-start gap-3">
              <h2 class="gallery-title mb-0">{{ product.name }}</h2>
              <span class="store-price">{{ product.price }}</span>
            </div>
            <p class="gallery-copy mt-3">{{ product.description }}</p>
            <div class="store-actions mt-4">
              <button
                class="btn btn-dark rounded-pill px-4"
                type="button"
                @click="addToCart(product.id)"
              >
                Add To Cart
              </button>
              <span class="store-count">{{ cart[product.id] || 0 }} in cart</span>
            </div>
          </article>
        </div>
      </template>

      <div v-else class="col-12">
        <section class="store-summary auth-required rounded-5 p-4 p-lg-5">
          <p class="pattern-label">Account required</p>
          <h2 class="pattern-title">Login or sign up to shop</h2>
          <p class="pattern-copy">
            The store is only available after login or sign up. Once signed in,
            you can browse bead supplies, pegboards, and equipment, then add
            them to your cart.
          </p>

          <div class="booking-lock-actions mt-4">
            <RouterLink to="/login" class="btn btn-dark btn-lg rounded-pill px-4">
              Login
            </RouterLink>
            <RouterLink to="/signup" class="btn btn-light btn-lg rounded-pill px-4">
              Sign Up
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue";
import { useAuth } from "../modules/useAuth";
import perlerIronTweezer from "../images/perler_iron_tweezer.jpg";
import perlerJarSet from "../images/perler_jar_set.jpg";
import perlerOutlineColor from "../images/perler_outline_color.jpg";
import perlerPastelRefill from "../images/perler_pastel_refill.jpeg";
import perlerSquare from "../images/perler_square.jpg";
import perlerStorageBox from "../images/perler_storage_box.jpg";
import { storeProducts } from "../data/studio";

const { currentUser } = useAuth();
const cart = reactive(loadCart());
const selectedCategory = ref("All");
const cartMessage = ref("");

const storeImages = {
  "perler-iron-tweezer": perlerIronTweezer,
  "perler-jar-set": perlerJarSet,
  "perler-outline-color": perlerOutlineColor,
  "perler-pastel-refill": perlerPastelRefill,
  "perler-square": perlerSquare,
  "perler-storage-box": perlerStorageBox
};

const storeCategories = ["All", ...new Set(storeProducts.map((product) => product.category))];

function loadCart() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem("perler-store-cart") || "{}");
  } catch {
    return {};
  }
}

watch(
  cart,
  (value) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("perler-store-cart", JSON.stringify(value));
    }
  },
  { deep: true }
);

function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
}

function removeFromCart(productId) {
  if (!cart[productId]) {
    return;
  }

  cart[productId] -= 1;

  if (cart[productId] <= 0) {
    delete cart[productId];
  }
}

function clearCart() {
  Object.keys(cart).forEach((key) => {
    delete cart[key];
  });

  cartMessage.value = "Cart cleared.";
}

function saveCartNotice() {
  cartMessage.value = "Your cart is saved in this browser and ready for later.";
}

const totalItems = computed(() =>
  Object.values(cart).reduce((total, count) => total + count, 0)
);

const cartItems = computed(() =>
  Object.entries(cart)
    .map(([id, quantity]) => {
      const product = storeProducts.find((item) => item.id === id);

      if (!product || quantity <= 0) {
        return null;
      }

      return {
        ...product,
        quantity,
        lineTotalCents: product.priceCents * quantity
      };
    })
    .filter(Boolean)
);

const cartTotal = computed(() =>
  cartItems.value.reduce((total, item) => total + item.lineTotalCents, 0)
);

const filteredProducts = computed(() => {
  if (selectedCategory.value === "All") {
    return storeProducts;
  }

  return storeProducts.filter((product) => product.category === selectedCategory.value);
});
</script>
