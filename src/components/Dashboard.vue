<template>
  <dashboard-block :class="'dashboard dashboard--editing dashboard--' + state" v-bind="data" :component-getter="componentGetter" @change="$emit('change')"></dashboard-block>
</template>

<script type="text/babel">
  import DashboardBlock from './DashboardBlock';

  export default {
    props: {
      data: {
        type: Object,
        required: true,
      },
      componentGetter: {
        type: Function,
        required: true,
      },
    },
    data: () => ({
      state: 'none',
    }),
    mounted() {
      document.addEventListener('dragstart', () => {
        this.state = 'dragging';
      });

      document.addEventListener('dragover', (e) => {
        e.preventDefault();
      }, false);

      document.addEventListener('drop', () => {
        this.state = 'none';
      });
    },
    components: {
      DashboardBlock,
    },
  };
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .dashboard {
    height: 500px;
    margin-left: -5px;
    margin-right: -5px;

    &:-webkit-full-screen {
      width: 100%;
      height: 100%;

      .lights-off & {
        background-color: black;
      }
    }
  }
</style>
