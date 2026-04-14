import { createRouter, createWebHistory } from "vue-router";
import BookingPage from "../pages/BookingPage.vue";
import GalleryPage from "../pages/GalleryPage.vue";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import PatternsPage from "../pages/PatternsPage.vue";
import SignupPage from "../pages/SignupPage.vue";
import StorePage from "../pages/StorePage.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomePage
    },
    {
      path: "/gallery",
      name: "gallery",
      component: GalleryPage
    },
    {
      path: "/login",
      name: "login",
      component: LoginPage
    },
    {
      path: "/signup",
      name: "signup",
      component: SignupPage
    },
    {
      path: "/store",
      name: "store",
      component: StorePage
    },
    {
      path: "/booking",
      name: "booking",
      component: BookingPage
    },
    {
      path: "/patterns",
      name: "patterns",
      component: PatternsPage
    }
  ]
});

export default router;
