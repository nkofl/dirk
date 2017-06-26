<template>
  <div :class="'dashboard__block dashboard__block--' + type" :style="{ flexGrow: size }">
    <component v-if="type === 'panel'" :is="component" v-bind="meta" class="dashboard__block__component"></component>
    <dashboard-block v-else v-for="(child, i) in children" v-bind="child" :key="child" :i="i"></dashboard-block>

    <div class="controls" v-if="type === 'panel'">
      <div class="controls__control controls__control--left" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleDrop">+</div>
      <div class="controls__control controls__control--top" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleDrop">+</div>
      <div class="controls__control controls__control--right" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleDrop">+</div>
      <div class="controls__control controls__control--bottom" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleDrop">+</div>
    </div>
  </div>
</template>

<script type="text/babel">
  import Color from './Color';

  export default {
    name: 'dashboard-block',
    props: {
      type: {
        type: String,
        required: true,
      },
      size: {
        type: Number,
        default: 1,
      },
      meta: {
        type: Object,
      },
      // @todo: Validate for either component or children, not both
      component: {
        type: Object,
      },
      children: {
        type: Array,
      },
      i: {
        type: Number,
      },
    },
    methods: {
      handleDrop(e) {
        e.target.classList.remove('controls__control--active');

        const parentType = this.$parent.type;
        const color = e.dataTransfer.getData('text/plain');
        const direction = e.target.className.replace(/.*controls__control--(\S+).*/, '$1');

        const directionMatch = {
          left: 'horizontal',
          right: 'horizontal',
          top: 'vertical',
          bottom: 'vertical',
        };

        if (parentType === directionMatch[direction]) {
          // It would probably be better to emit an event but eeehhh
          const newChildSize = 1 / (this.$parent.children.length + 1);
          const sizeAdjustFactor = 1 - newChildSize;

          this.$parent.children.forEach((child) => {
            /* eslint-disable no-param-reassign */
            child.size *= sizeAdjustFactor;
          });

          const spliceI = this.i + ((direction === 'right' || direction === 'bottom') ? 1 : 0);

          this.$parent.children.splice(spliceI, 0, {
            type: 'panel',
            size: newChildSize,
            component: Color,
            meta: { color },
          });
        } else {
          const newSelf = {
            type: 'panel',
            size: 0.5,
            component: this.component,
            meta: this.meta,
          };
          const newSibling = {
            type: 'panel',
            size: 0.5,
            component: Color,
            meta: { color },
          };

          const children = (direction === 'right' || direction === 'bottom') ?
            [newSelf, newSibling] : [newSibling, newSelf];

          this.$parent.children.splice(this.i, 1, {
            type: directionMatch[direction],
            size: this.size,
            children,
          });
        }
      },
      handleDragenter(e) {
        e.target.classList.add('controls__control--active');
      },
      handleDragleave(e) {
        e.target.classList.remove('controls__control--active');
      },
    },
  };
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .dashboard__block {
    flex: 1 1 auto;

    position: relative;

    display: flex;

    &--vertical > .dashboard__block:not(:first-child) {
      margin-top: 10px;
    }

    &--horizontal > .dashboard__block:not(:first-child) {
      margin-left: 10px;
    }

    &--horizontal, &--vertical {
      display: flex;
    }

    &--vertical {
      flex-direction: column;
    }

    &__component {
      flex: 1 1 auto;
    }

    .controls {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;

      display: none;

      .dashboard--dragging & {
        display: block;
      }

      &__control {
        position: absolute;

        display: flex;
        justify-content: center;
        align-items: center;

        background-color: rgba(black, 0.1);
        color: rgba(white, 0.3);
        font-weight: bold;
        font-size: 30px;

        &--left, &--right {
          width: 60px;
          height: 100%;
        }

        &--right {
          right: 0;
        }

        &--top, &--bottom {
          width: 100%;
          height: 60px;
        }

        &--bottom {
          bottom: 0;
        }

        &--active {
          background-color: rgba(black, 0.2);
          color: rgba(white, 0.7);
        }
      }
    }
  }
</style>
