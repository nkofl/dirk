<template>
  <dashboard-block :class="'dashboard dashboard--editing dashboard--' + state" v-bind="data" :component-getter="componentGetter" :add-component="addComponent" :get-component-id="getComponentId"></dashboard-block>
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
      addComponent: {
        type: Function,
        required: true,
      },
      getComponentId: {
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
  }
</style>
