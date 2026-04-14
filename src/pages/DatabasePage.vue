<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-8">
        <p class="hero-kicker">Database output</p>
        <h1 class="page-title">POSTGRES DATA</h1>
        <p class="page-copy">
          Read-only output from your Render PostgreSQL database for the `users`, `bookings`, and `cart_items` tables.
        </p>
      </div>
    </div>

    <div class="row g-4 mt-2">
      <div class="col-12">
        <section class="booking-form rounded-5 p-4 p-lg-5">
          <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap">
            <div>
              <p class="pattern-label mb-1">Live database</p>
              <p class="pattern-copy">Refresh this page to see the latest PostgreSQL rows from Render.</p>
            </div>
            <button class="btn btn-dark rounded-pill px-4" type="button" @click="loadData">
              Refresh Data
            </button>
          </div>

          <div v-if="statusMessage" class="booking-feedback booking-feedback-success mt-4">
            {{ statusMessage }}
          </div>
          <div v-if="errorMessage" class="booking-feedback booking-feedback-error mt-4">
            {{ errorMessage }}
          </div>

          <div v-if="isLoading" class="booking-history-empty mt-4">
            Loading PostgreSQL data...
          </div>

          <div v-else class="database-grid mt-4">
            <section class="database-card">
              <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <div>
                  <p class="pattern-label mb-1">Users</p>
                  <p class="pattern-copy">Account records without passwords.</p>
                </div>
                <strong>{{ users.length }}</strong>
              </div>

              <div v-if="!users.length" class="booking-history-empty mt-3">No user rows yet.</div>
              <div v-else class="database-table-wrap mt-3">
                <table class="database-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="user in users" :key="user.id">
                      <td>{{ user.id }}</td>
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>{{ formatDate(user.createdAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="database-card">
              <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <div>
                  <p class="pattern-label mb-1">Bookings</p>
                  <p class="pattern-copy">Studio bookings saved from the app.</p>
                </div>
                <strong>{{ bookings.length }}</strong>
              </div>

              <div v-if="!bookings.length" class="booking-history-empty mt-3">No booking rows yet.</div>
              <div v-else class="database-table-wrap mt-3">
                <table class="database-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Date</th>
                      <th>Session</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="booking in bookings" :key="booking.id">
                      <td>{{ booking.id }}</td>
                      <td>{{ booking.name }}</td>
                      <td>{{ booking.email }}</td>
                      <td>{{ booking.date }}</td>
                      <td>{{ booking.session }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section class="database-card">
              <div class="d-flex justify-content-between align-items-center gap-3 flex-wrap">
                <div>
                  <p class="pattern-label mb-1">Cart Items</p>
                  <p class="pattern-copy">Products saved in PostgreSQL carts.</p>
                </div>
                <strong>{{ cartItems.length }}</strong>
              </div>

              <div v-if="!cartItems.length" class="booking-history-empty mt-3">No cart rows yet.</div>
              <div v-else class="database-table-wrap mt-3">
                <table class="database-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>User ID</th>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in cartItems" :key="item.id">
                      <td>{{ item.id }}</td>
                      <td>{{ item.userId }}</td>
                      <td>{{ item.productId }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatDate(item.updatedAt) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";

const users = ref([]);
const bookings = ref([]);
const cartItems = ref([]);
const isLoading = ref(false);
const statusMessage = ref("");
const errorMessage = ref("");

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString();
}

async function loadData() {
  isLoading.value = true;
  statusMessage.value = "";
  errorMessage.value = "";

  try {
    const response = await fetch("/api/admin/data");
    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Could not load PostgreSQL data.");
    }

    users.value = result.users || [];
    bookings.value = result.bookings || [];
    cartItems.value = result.cartItems || [];
    statusMessage.value = "PostgreSQL data loaded successfully.";
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Could not load PostgreSQL data.";
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>
