<template>
  <dashboard-block :class="'dashboard dashboard--' + state" v-bind="data"></dashboard-block>
</template>

<script type="text/babel">
  import DashboardBlock from './DashboardBlock';

  export default {
    props: {
      data: {
        type: Object,
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
    box-sizing: border-box;

    * {
      box-sizing: border-box;
    }
  }
</style>
