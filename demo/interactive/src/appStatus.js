import { reactive } from 'vue';

// Shared reactive UI state. `scene.js` mutates this object directly while it
// runs the algorithm, and `App.vue` renders from it. Under Vue 3 the object
// must be `reactive()` so those external mutations stay observable (Vue 2 used
// to install reactivity in-place on a plain object; Vue 3 tracks via a proxy).
export default reactive({
  error: null,
  showMetrics: false,
  showLoading: false,
  elapsed: 0,
  found: 0,
  linesCount: 0,
});
