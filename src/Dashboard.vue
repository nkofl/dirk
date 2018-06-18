<template>
  <dashboard-block :class="'dashboard dashboard--editing dashboard--' + state" v-bind="data" :component-getter="componentGetter" :editing="editing" @change="$emit('change')" @changing="$emit('changing')"></dashboard-block>
</template>

<script type="text/babel">
  import DashboardBlock from './DashboardBlock.vue';

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
      editing: {
        type: Boolean,
        default: false,
      },
    },
    data: () => ({
      state: 'none',
    }),
    mounted() {
      document.addEventListener('dragstart', () => {
        if (this.editing) {
          this.state = 'dragging';
        }
      });

      document.addEventListener('dragover', (e) => {
        e.preventDefault();
      }, false);

      document.addEventListener('drop', (e) => {
        this.state = 'none';

        try {
          const data = JSON.parse(e.dataTransfer.getData('text'));

          if (data.component) {
            e.preventDefault();
          }
        } catch (e) {}

      });
    },
    components: {
      DashboardBlock,
    },
  };
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .dashboard {
    height: 100%;

    &:-webkit-full-screen {
      width: 100%;
      height: 100%;

      .lights-off & {
        background-color: black;
      }
    }
  }
</style>
