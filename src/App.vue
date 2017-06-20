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
      <dashboard :data="dashboardData"></dashboard>
    </div>
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
            component: Color,
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
                component: Color,
                meta: {
                  color: 'hsl(90, 80%, 70%)',
                },
              },
              {
                type: 'panel',
                size: 0.5,
                component: Color,
                meta: {
                  color: 'hsl(210, 80%, 70%)',
                },
              },
            ],
          },
        ],
      },
    }),
    methods: {
      handleDragstart(e) {
        e.dataTransfer.setData('text/plain', e.target.style.backgroundColor);
      },
    },
    components: {
      Dashboard,
    },
  };
</script>

<style>
  body {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
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
</style>
