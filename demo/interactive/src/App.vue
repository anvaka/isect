<template>
  <div id="app">
    <h3><strong>isect</strong> - intersection detection library</h3>
    <div v-if='!showLoading'>
      <a href='#' @click.prevent='generateNew()' class='action'>Generate New Demo</a>
    </div>
    <div v-if='showMetrics' class='results'>
      <div><strong>{{linesCount}}</strong> lines. Found <strong>{{found}}</strong> intersections in <strong>{{elapsed}}</strong></div>
    </div>
    <div v-if='showLoading' class='loading-container'>
      <div class='loader'>Finding intersections...</div>
      <div class='label'>Finding intersections...</div>
    </div>
    <div class='error' v-if='error'>
      Rounding error detected.
    </div>
    <a href='https://github.com/anvaka/isect' class='info'>Source code</a>
  </div>
</template>

<script>
import appState from './appStatus.js';
import generateRandomExample from './generateRandomExample';
import bus from './bus';

export default {
  name: 'app',
  props: ['state'],
  data() {
    return appState;
  },
  mounted() {
    bus.fire('app-loaded');
  },
  methods: {
    generateNew() {
      this.showLoading = true;
      this.showMetrics = false;
      var newState = generateRandomExample();
      bus.fire('change-qs', newState);
    }
  },
}
</script>

<style>
#app {
  width: 400px;
  position: absolute;
  padding: 8px;
  background: #101830;
}
a.action {
  color: #fff;
  font-size: 16px;
  padding: 8px;
  flex: 1;
  border: 1px solid #99c5f1;
  justify-content: center;
  align-items: center;
  display: flex;
}
h3 {
  margin: 7px 0;
  font-weight: normal;
}
h3 strong {
  font-weight: bold;
}
a {
  text-decoration: none;
}
.results {
  margin-top: 7px;
}
.error {
  background: orangered;
  margin: 0 -8px;
  padding: 0 8px;
}

.info {
  position: fixed;
  right: 8px;
  top: 8px;
  color: white;
  border-bottom: 1px dashed;
}

@media (max-width: 600px) {
  #app {
    width: 100%;
    margin: 0px;
    padding: 0px;
  }
  .results {
    font-size: 12px;
    margin: 7px;
  }
  h3 {
    margin: 7px;
  }
  .error {
    padding: 0 7px;
    margin: 0;
  }

  .info {
    bottom: 42px;
    left: 8px;
    right: inherit;
    top: inherit;
  }
}
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 38px;
  border: 1px solid #777;
}

.loading-container .label {
  margin-left: 8px;
}

.loader,
.loader:before,
.loader:after {
  border-radius: 50%;
}
.loader {
  color: #ffffff;
  font-size: 2px;
  text-indent: -99999em;
  position: relative;
  width: 10em;
  height: 10em;
  box-shadow: inset 0 0 0 1em;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
.loader:before,
.loader:after {
  position: absolute;
  content: '';
}
.loader:before {
  width: 5.2em;
  height: 10.2em;
  background: #101830;
  border-radius: 10.2em 0 0 10.2em;
  top: -0.1em;
  left: -0.1em;
  -webkit-transform-origin: 5.2em 5.1em;
  transform-origin: 5.2em 5.1em;
  -webkit-animation: load2 2s infinite ease 1.5s;
  animation: load2 2s infinite ease 1.5s;
}
.loader:after {
  width: 5.2em;
  height: 10.2em;
  background: #101830;
  border-radius: 0 10.2em 10.2em 0;
  top: -0.1em;
  left: 5.1em;
  -webkit-transform-origin: 0px 5.1em;
  transform-origin: 0px 5.1em;
  -webkit-animation: load2 2s infinite ease;
  animation: load2 2s infinite ease;
}
@-webkit-keyframes load2 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes load2 {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

</style>
