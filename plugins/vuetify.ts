// plugins/vuetify.ts

import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    // Din Vuetify-konfiguration här
  });
  nuxtApp.vueApp.use(vuetify);
});
