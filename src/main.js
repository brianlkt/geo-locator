import 'bootstrap/dist/css/bootstrap.css';

import { createApp } from 'vue';
import App from './App.vue';
import { GoogleMap } from 'vue3-google-map';


const app = createApp(App);

app.use(GoogleMap, {
  load: {
    key: 'AIzaSyAyGuJCBy-Pf7RqNAJEChAlLl8AiQsmTzQ',
    libraries: 'places',
  },
});

app.mount('#app');
