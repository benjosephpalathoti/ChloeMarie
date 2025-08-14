import { createWebHistory, createRouter } from "vue-router";

import IndexPage from "./views/IndexPage.vue";
import GalleryPage from "./views/GalleryPage.vue";
import WorkPage from "./views/WorkPage.vue";
import AboutPage from "./views/AboutPage.vue";
import CeramicsPage from "./views/CeramicsPage.vue";
import DrawingsPage from "./views/DrawingsPage.vue";
import DesignsPage from "./views/DesignsPage.vue";

const routes = [
  { path: "/", component: IndexPage },
  { path: "/work", component: WorkPage },
  { path: "/gallery", component: GalleryPage },
  { path: "/about", component: AboutPage},

  // Dedicated section pages (accept ?i=<index> to jump to image)
  { path: "/ceramics", name: "Ceramics", component: CeramicsPage },
  { path: "/drawings", name: "Drawings", component: DrawingsPage },
  { path: "/designs",  name: "Designs",  component: DesignsPage },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
