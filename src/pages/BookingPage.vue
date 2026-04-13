<template>
  <div class="page-block">
    <div class="page-intro row g-4 align-items-end">
      <div class="col-12 col-lg-8">
        <p class="hero-kicker">Studio sessions</p>
        <h1 class="page-title">BOOKING</h1>
        <p class="page-copy">
          Reserve a Perler Beads studio table, choose a session type, and plan
          your build time before coming in to create.
        </p>
      </div>
    </div>

    <div class="row g-4 mt-2">
      <div class="col-12 col-xl-7">
        <div class="filter-bar rounded-5 p-3 p-lg-4 mb-4">
          <div class="filter-group">
            <span class="filter-label">Session type</span>
            <button
              v-for="option in sessionTypes"
              :key="option"
              type="button"
              class="filter-pill"
              :class="{ 'filter-pill-active': selectedSessionType === option }"
              @click="selectedSessionType = option"
            >
              {{ option }}
            </button>
          </div>

          <div class="filter-group">
            <span class="filter-label">Budget</span>
            <button
              v-for="option in priceFilters"
              :key="option.id"
              type="button"
              class="filter-pill"
              :class="{ 'filter-pill-active': selectedPriceFilter === option.id }"
              @click="selectedPriceFilter = option.id"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="row g-4">
          <div
            v-for="session in filteredSessions"
            :key="session.id"
            class="col-12"
          >
            <article class="booking-card rounded-5 p-4">
              <div class="d-flex flex-wrap justify-content-between gap-3 align-items-start">
                <div>
                  <p class="gallery-kicker mb-2">Session option</p>
                  <h2 class="gallery-title mb-2">{{ session.title }}</h2>
                  <p class="gallery-copy mb-0">{{ session.copy }}</p>
                </div>
                <div class="booking-pricebox">
                  <span class="booking-duration">{{ session.duration }}</span>
                  <strong class="booking-price">{{ session.price }}</strong>
                </div>
              </div>

              <div class="booking-perks mt-4">
                <span
                  v-for="perk in session.perks"
                  :key="perk"
                  class="booking-perk"
                >
                  {{ perk }}
                </span>
              </div>

              <div class="mt-4">
                <button
                  v-if="currentUser"
                  class="btn btn-dark rounded-pill px-4"
                  type="button"
                  @click="selectSession(session)"
                >
                  Select Session
                </button>
                <RouterLink
                  v-else
                  to="/login"
                  class="btn btn-dark rounded-pill px-4"
                >
                  Login To Book
                </RouterLink>
              </div>
            </article>
          </div>
        </div>
      </div>

      <div class="col-12 col-xl-5">
        <section v-if="currentUser" class="booking-form rounded-5 p-4 p-lg-5">
          <p class="pattern-label">Reserve your slot</p>
          <h2 class="pattern-title">Book the studio</h2>
          <p class="pattern-copy">
            Fill in your details and choose a date for your next Perler Beads
            making session.
          </p>

          <div class="booking-form-grid mt-4">
            <label class="booking-field">
              <span>Name</span>
              <input v-model="form.name" type="text" placeholder="Your name" />
            </label>
            <label class="booking-field">
              <span>Email</span>
              <input v-model="form.email" type="email" placeholder="you@example.com" />
            </label>
            <label class="booking-field">
              <span>Date</span>
              <input v-model="form.date" type="date" />
            </label>
            <label class="booking-field">
              <span>Session</span>
              <input :value="selectedSessionTitle" type="text" readonly />
            </label>
            <label class="booking-field booking-field-full">
              <span>Notes</span>
              <textarea
                v-model="form.notes"
                rows="4"
                placeholder="Tell us if you need large pegboards, beginner help, or tool access."
              />
            </label>
          </div>

          <div v-if="serverMessage" class="booking-feedback booking-feedback-success mt-4">
            {{ serverMessage }}
          </div>

          <div v-if="serverError" class="booking-feedback booking-feedback-error mt-4">
            {{ serverError }}
          </div>

          <button
            class="btn btn-dark btn-lg rounded-pill px-4 mt-4"
            type="button"
            :disabled="isSubmitting"
            @click="submitBooking"
          >
            {{ isSubmitting ? "Submitting..." : "Confirm Booking" }}
          </button>
        </section>

        <section v-else class="booking-form auth-required rounded-5 p-4 p-lg-5">
          <p class="pattern-label">Account required</p>
          <h2 class="pattern-title">Login or sign up to book</h2>
          <p class="pattern-copy">
            Studio booking is only available after you create an account or log
            in. Once signed in, you can choose a session and confirm your slot.
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
import { computed, reactive, ref } from "vue";
import { useAuth } from "../modules/useAuth";
import { bookingSessions } from "../data/studio";

const { currentUser } = useAuth();
const selectedSession = ref(bookingSessions[0]);
const selectedSessionType = ref("All");
const selectedPriceFilter = ref("all");
const isSubmitting = ref(false);
const serverMessage = ref("");
const serverError = ref("");

const form = reactive({
  name: currentUser.value?.name || "",
  email: currentUser.value?.email || "",
  date: "",
  notes: ""
});

const priceFilters = [
  { id: "all", label: "All Prices", max: Infinity },
  { id: "budget", label: "Up to $15", max: 15 },
  { id: "standard", label: "Up to $25", max: 25 },
  { id: "premium", label: "Above $25", min: 25.01 }
];

const sessionTypes = ["All", ...bookingSessions.map((session) => session.title)];

function selectSession(session) {
  selectedSession.value = session;
}

async function submitBooking() {
  serverMessage.value = "";
  serverError.value = "";

  if (!form.name.trim() || !form.email.trim() || !form.date || !selectedSessionTitle.value) {
    serverError.value = "Please complete your name, email, date, and session before booking.";
    return;
  }

  isSubmitting.value = true;

  try {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        date: form.date,
        session: selectedSessionTitle.value,
        notes: form.notes
      })
    });

    const result = await response.json();

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "We could not save your booking right now.");
    }

    serverMessage.value = `${result.message} Reference: ${result.booking.id}. Contact: ${result.contactEmail}`;
    form.date = "";
    form.notes = "";
  } catch (error) {
    serverError.value = error instanceof Error
      ? error.message
      : "We could not save your booking right now.";
  } finally {
    isSubmitting.value = false;
  }
}

const selectedSessionTitle = computed(() => selectedSession.value?.title || "");

const filteredSessions = computed(() => {
  return bookingSessions.filter((session) => {
    const priceValue = Number.parseFloat(session.price.replace("$", ""));
    const matchesType =
      selectedSessionType.value === "All" || session.title === selectedSessionType.value;
    const priceRule = priceFilters.find((option) => option.id === selectedPriceFilter.value);

    if (!priceRule) {
      return matchesType;
    }

    const matchesPrice =
      (priceRule.max === undefined || priceValue <= priceRule.max) &&
      (priceRule.min === undefined || priceValue >= priceRule.min);

    return matchesType && matchesPrice;
  });
});
</script>
