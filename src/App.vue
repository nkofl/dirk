<template>
  <div>
    <h1>vue dashboard</h1>

    <div class="color-swatch">
      <div
        v-for="n in 12"
        class="color-swatch__color"
        :style="{ backgroundColor: 'hsl(' + (n - 1) * 30 + ', 80%, 70%)' }"
        @dragstart="handleDragstart"
        draggable="true"
      ></div>
    </div>

    <div class="container">
      <dashboard :data="dashboardData" :component-getter="getComponent" :add-component="addComponent" :get-component-id="getId" ref="dashboard"></dashboard>

      <div class="text-right control-links">
        <p><a @click.prevent="fullScreen">Enter presenter mode</a></p>
        <p><a @click.prevent="lightsOff = !lightsOff">Turn {{ lightsOff ? 'on' : 'out' }} the lights</a></p>
      </div>
    </div>

    <img src="http://i.imgur.com/7hMpv.jpg" class="who-turned-out-the-lights">
  </div>
</template>

<script>
  import Color from './components/Color';
  import Dashboard from './components/Dashboard';

  export default {
    data: () => ({
      dashboardData: {
        type: 'horizontal',
        size: 1,
        children: [
          {
            type: 'panel',
            size: 0.4,
            component: 'color',
            meta: {
              color: 'hsl(0, 80%, 70%)',
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
                  color: 'hsl(90, 80%, 70%)',
                },
              },
              {
                type: 'panel',
                size: 0.5,
                component: 'color',
                meta: {
                  color: 'hsl(210, 80%, 70%)',
                },
              },
            ],
          },
        ],
      },
      lightsOff: false,
    }),
    mounted() {
      window.data = this.dashboardData;
    },
    methods: {
      handleDragstart(e) {
        e.dataTransfer.setData('text/plain', e.target.style.backgroundColor);
      },
      getComponent(name) {
        if (name === 'color') {
          return Color;
        }

        return { render: h => h('p', '404 component not found') };
      },
      addComponent(transferData) {
        return {
          component: 'color',
          meta: {
            color: transferData,
          },
        };
      },
      getId(component) {
        return component.meta.color;
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
    margin-top: 60px;

    transition: color 0.6s, background-color 0.6s;

    &.lights-off {
      background-color: #2c3e50;
      color: white;
    }
  }

  h1, h2 {
    font-weight: normal;
  }

  .container {
    margin: 20px auto;
    width: 1000px;
  }

  .color-swatch__color {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin: 5px;

    cursor: move;
  }

  .text-right {
    text-align: right;
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
