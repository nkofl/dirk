<template>
  <div>
    <h1>dirk dashboard</h1>
    <p>A simple dashboard layout tool powered by Vue.</p>

    <div class="color-swatch">
      <div
        v-for="n in 12"
        class="color-swatch__color"
        :style="{ backgroundColor: 'hsl(' + (n - 1) * 30 + ', 80%, 73%)' }"
        @dragstart="handleDragstart"
        draggable="true"
      ></div>
    </div>

    <div class="container">
      <dashboard :data="dashboardData" :component-getter="getComponent" :editing="true" ref="dashboard" @change="dirkChange"></dashboard>

      <div class="control-links">
        <div class="left">
          <p v-if="dataTouched"><a @click.prevent="reset">Reset to default data</a></p>
        </div>
        <div class="right">
          <p><a @click.prevent="lightsOff = !lightsOff">Turn {{ lightsOff ? 'on' : 'out' }} the lights</a></p>
          <p><a @click.prevent="fullScreen">Go full screen</a></p>
        </div>
      </div>
    </div>

    <img src="http://i.imgur.com/7hMpv.jpg" class="who-turned-out-the-lights">
  </div>
</template>

<script>
  import Color from './Color.vue';
  import Empty from './Empty.vue';
  import Dashboard from '../Dashboard.vue';

  const defaultData = {
    type: 'horizontal',
    size: 1,
    children: [
      {
        type: 'panel',
        size: 0.4,
        component: 'color',
        meta: {
          color: 'hsl(0, 80%, 73%)',
        },
      },
      {
        type: 'vertical',
        size: 0.6,
        children: [
          {
            type: 'panel',
            size: 0.5,
            component: 'color',
            meta: {
              color: 'hsl(90, 80%, 73%)',
            },
          },
          {
            type: 'panel',
            size: 0.5,
            component: 'color',
            meta: {
              color: 'hsl(210, 80%, 73%)',
            },
          },
        ],
      },
    ],
  };

  const storedData = localStorage.getItem('dirk-data');

  export default {
    data: () => ({
      dashboardData: JSON.parse(storedData || JSON.stringify(defaultData)),
      dataTouched: !!storedData,
      lightsOff: localStorage.getItem('lights-off') === 'true',
    }),
    mounted() {
      window.data = this.dashboardData;
      document.body.classList.toggle('lights-off', this.lightsOff);
    },
    methods: {
      handleDragstart(e) {
        const data = {
          component: 'color',
          meta: {
            color: e.target.style.backgroundColor,
          },
        };
        e.dataTransfer.setData('text/plain', JSON.stringify(data));
      },
      getComponent(name) {
        if (name === 'color') {
          return Color;
        }

        if (name === 'empty-dashboard') {
          return Empty;
        }

        return { render: h => h('p', '404 component not found') };
      },
      dirkChange() {
        localStorage.setItem('dirk-data', JSON.stringify(this.dashboardData));
        this.dataTouched = true;
      },
      reset() {
        localStorage.removeItem('dirk-data');
        this.dashboardData = JSON.parse(JSON.stringify(defaultData));
        this.dataTouched = false;
      },
      fullScreen() {
        const dashboardEl = this.$refs.dashboard.$el;

        if (dashboardEl.requestFullscreen) {
          dashboardEl.requestFullscreen();
        } else if (dashboardEl.webkitRequestFullscreen) {
          dashboardEl.webkitRequestFullscreen();
        } else if (dashboardEl.mozRequestFullScreen) {
          dashboardEl.mozRequestFullScreen();
        } else if (dashboardEl.msRequestFullscreen) {
          dashboardEl.msRequestFullscreen();
        }
      },
    },
    watch: {
      lightsOff() {
        document.body.classList.toggle('lights-off', this.lightsOff);
        localStorage.setItem('lights-off', this.lightsOff);
      },
    },
    components: {
      Dashboard,
    },
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  body {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;

    transition: color 0.6s, background-color 0.6s;

    &.lights-off {
      background-color: #2c3e50;
      color: white;
    }
  }

  h1 {
    font-weight: normal;
    margin-top: 40px;
    margin-bottom: 0;
  }

  p {
    margin-top: 0;
    margin-bottom: 40px;
  }

  .container {
    margin: 20px auto;
    width: 1000px;
    height: 600px;
  }

  .color-swatch__color {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin: 5px;

    cursor: move;
  }

  .control-links {
    margin-top: 4px;

    .left {
      float: left;
      text-align: left;
    }

    .right {
      text-align: right;
    }
  }

  .control-links p {
    margin: 0;
  }

  .control-links a {
    text-decoration: none;

    color: inherit;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .who-turned-out-the-lights {
    width: 100px;
    position: fixed;
    bottom: 0;
    right: 0;

    opacity: 0;

    transition: opacity 0.6s;

    .lights-off & {
      opacity: 0.4;
    }
  }
</style>
