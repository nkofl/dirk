<template>
  <div :class="'dashboard__block dashboard__block--' + type + ' dashboard__block--' + state" :style="{ flexBasis: flexBasis }" ref="block" @drop="handleReplaceDrop">
    <component v-if="type === 'panel'" :is="component" v-bind="meta" class="dashboard__block__component"></component>
    <dashboard-block v-else v-for="(child, i) in children" v-bind="child" :key="child" :i="i"></dashboard-block>

    <div class="controls" v-if="type === 'panel'" @dragstart="handleDragstart" draggable="true" ref="draggable">
      <div class="controls__control controls__control--hover controls__control--delete" role="button" @click="handleDelete">x</div>

      <div class="controls__control controls__control--drop controls__control--left" role="button" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleAddDrop">+</div>
      <div class="controls__control controls__control--drop controls__control--top" role="button" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleAddDrop">+</div>
      <div class="controls__control controls__control--drop controls__control--right" role="button" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleAddDrop">+</div>
      <div class="controls__control controls__control--drop controls__control--bottom" role="button" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleAddDrop">+</div>
    </div>

    <div class="drag-control" @mousedown="handleMouseDown"></div>
  </div>
</template>

<script type="text/babel">
  import Color from './Color';

  const minimumSizes = {
    height: 100,
    width: 200,
  };

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
    data: () => ({
      state: 'default',
    }),
    methods: {
      handleAddDrop(e) {
        e.target.classList.remove('controls__control--active');

        const color = e.dataTransfer.getData('text/plain');

        if (!color) {
          return;
        }

        const direction = e.target.className.replace(/.*controls__control--(\S+).*/, '$1');

        const directionMatch = {
          left: 'horizontal',
          right: 'horizontal',
          top: 'vertical',
          bottom: 'vertical',
        };

        // We're at the root element, so the type could be wrong
        if (this.$parent.children.length === 1) {
          this.$parent.type = directionMatch[direction];
          this.$parent.$parent.data.type = directionMatch[direction];
        }

        const parentType = this.$parent.type;

        if (parentType === directionMatch[direction]) {
          // This shrinks all the child elements to make room for the new one,
          // but does so in a way that the smaller ones don't go below the
          // minimum size
          const isHorizontal = this.$parent.type === 'horizontal';
          const parentRect = this.$parent.$refs.block.getBoundingClientRect();
          const parentSize = isHorizontal ? parentRect.width : parentRect.height;
          const minSize = minimumSizes[isHorizontal ? 'width' : 'height'];
          const minPercent = minSize / parentSize;

          /* eslint-disable no-mixed-operators */

          const n = this.$parent.children.length;
          const newChildSize = 1 / (n + 1);

          const beforeAllExcess = 1 - n * minPercent;
          const afterAllExcess = 1 - (n + 1) * minPercent;

          if (afterAllExcess < 0) {
            // @todo something more informative here: there's no space
            return;
          }

          const sizeAdjustFactor = (afterAllExcess - (newChildSize - minPercent)) / beforeAllExcess;

          this.$parent.children.forEach((child) => {
            /* eslint-disable no-param-reassign */
            child.size = (child.size - minPercent) * sizeAdjustFactor + minPercent;
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
      handleReplaceDrop(e) {
        e.target.classList.remove('controls__control--active');

        const color = e.dataTransfer.getData('text/plain');

        // Event has propagated, ignore
        if (this.type !== 'panel') {
          return;
        }

        // This is an add that has propagated, not a replace
        if (e.target.classList.contains('controls__control')) {
          return;
        }

        if (!color) {
          return;
        }

        this.meta.color = color;
      },
      handleDragenter(e) {
        e.target.classList.add('controls__control--active');
      },
      handleDragleave(e) {
        e.target.classList.remove('controls__control--active');
      },
      handleDelete() {
        if (this.$parent.children.length === 1) {
          // @todo: allow user to delete last block
          console.log('cant empty dashboard yet');
        } else if (this.$parent.children.length === 2) {
          const parentParent = this.$parent.$parent;

          if (parentParent.children) {
            const parentSiblingsPanels = parentParent.children
              .every((block, i) => i === this.$parent.i || block.type === 'panel');
            if (parentSiblingsPanels) {
              const sibling = this.$parent.children[1 - this.i];

              if (sibling.type === 'panel') {
                sibling.size = this.$parent.size;
                this.$parent.$parent.children.splice(this.$parent.i, 1, sibling);
              } else {
                sibling.children.forEach((child) => {
                  // eslint-disable-next-line no-param-reassign
                  child.size *= this.$parent.size;
                });

                this.$parent.$parent.children.splice(this.$parent.i, 1, ...sibling.children);
              }
            } else {
              const parentObject = parentParent.children[this.$parent.i];
              const sibling = parentObject.children[1 - this.i];
              sibling.size = parentObject.size;

              this.$set(parentParent.children, this.$parent.i, sibling);
            }
          } else {
            // We're setting the sibling directly on the root element
            const rootData = this.$parent.$parent.data;

            const sibling = this.$parent.children[1 - this.i];
            sibling.size = 1;

            if (sibling.type === 'panel') {
              rootData.children = [sibling];
            } else {
              Object.assign(rootData, sibling);
            }
          }
        } else {
          this.$parent.children.splice(this.i, 1);

          this.$parent.children.forEach((child) => {
            // eslint-disable-next-line no-param-reassign
            child.size /= 1 - this.size;
          });
        }
      },
      handleMouseDown(e) {
        const isHorizontal = this.$parent.type === 'horizontal';
        const start = isHorizontal ? e.pageX : e.pageY;

        const parentRect = this.$parent.$refs.block.getBoundingClientRect();
        const parentSize = isHorizontal ? parentRect.width : parentRect.height;

        const previous = this.$parent.children[this.i - 1];
        const previousStartSize = previous.size;
        const currentStartSize = this.size;

        const mousemoveHandler = (e2) => {
          e2.preventDefault();

          const offset = (isHorizontal ? e2.pageX : e2.pageY) - start;
          const offsetAsPercentage = offset / parentSize;

          const minPerc = minimumSizes[isHorizontal ? 'width' : 'height'] / parentSize;

          if (offsetAsPercentage > 0) {
            if (currentStartSize - offsetAsPercentage <= minPerc) {
              return;
            }
          } else if (previousStartSize + offsetAsPercentage <= minPerc) {
            return;
          }

          previous.size = previousStartSize + offsetAsPercentage;
          this.$parent.children[this.i].size = currentStartSize - offsetAsPercentage;
        };

        const mouseupHandler = () => {
          document.removeEventListener('mousemove', mousemoveHandler);
          document.removeEventListener('mouseup', mouseupHandler);
        };

        document.addEventListener('mousemove', mousemoveHandler);
        document.addEventListener('mouseup', mouseupHandler);
      },
      handleDragstart(e) {
        if (this.type !== 'panel') {
          return;
        }

        e.dataTransfer.setData('text/plain', this.meta.color);

        this.state = 'dragging';

        const dropHandler = (ei) => {
          document.removeEventListener('drop', dropHandler);

          if (ei.target !== this.$refs.draggable) {
            this.handleDelete();
          } else {
            this.state = 'default';
          }
        };

        document.addEventListener('drop', dropHandler);
      },
    },
    computed: {
      flexBasis() {
        const percentage = `${this.size * 100}%`;
        return this.type === 'panel' ? `calc(${percentage} - 10px)` : percentage;
      },
    },
  };
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .dashboard__block {
    flex: 1 1 auto;

    position: relative;

    display: flex;

    &--panel {
      margin: 5px;
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

    &--dragging {
      filter: grayscale(10%);
      opacity: 0.4;

      .dashboard--dragging & .controls__control {
        display: none !important;
      }
    }

    .controls {
      position: absolute;
      left: 0;
      top: 0;
      right: 0;
      bottom: 0;

      .dashboard--editing & {
        cursor: move;
      }

      &__control {
        position: absolute;

        display: none;
        justify-content: center;
        align-items: center;

        font-weight: bold;
        font-size: 30px;
        line-height: 40px;

        background-color: rgba(black, 0.1);
        color: rgba(white, 0.3);
        cursor: pointer;

        &--active, &:hover {
          background-color: rgba(black, 0.2);
          color: rgba(white, 0.7);
        }

        .dashboard--dragging &--drop {
          display: flex;
        }

        &--left, &--right {
          width: 40px;
          height: 100%;
        }

        &--right {
          right: 0;
        }

        &--top, &--bottom {
          width: 100%;
          height: 40px;
        }

        &--bottom {
          bottom: 0;
        }

        &--delete {
          top: 0;
          right: 0;

          width: 40px;
          height: 40px;
        }
      }
    }

    &:not(:first-child) {
      > .drag-control {
        position: absolute;

        // Display on left
        .dashboard__block--horizontal > & {
          left: -5px;

          width: 10px;
          height: 100%;

          cursor: ew-resize;
        }

        // Display on top
        .dashboard__block--vertical > & {
          top: -5px;

          width: 100%;
          height: 10px;

          cursor: ns-resize;
        }
      }

      &.dashboard__block--panel > .drag-control {
        .dashboard__block--horizontal > & {
          left: -10px;
        }

        .dashboard__block--vertical > & {
          top: -10px;
        }
      }
    }
  }
</style>

<!-- unscoped -->
<style>
  .dashboard:not(.dashboard--dragging) .dashboard__block--panel:hover .controls__control--hover {
    display: flex;
  }
</style>
