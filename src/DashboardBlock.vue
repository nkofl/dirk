<template>
  <div :class="'dashboard__block dashboard__block--' + type + ' dashboard__block--' + state" :style="{ flexBasis: flexBasis }" ref="block" @drop="handleReplaceDrop">
    <component v-if="type === 'panel'" :is="realComponent" v-bind="meta" class="dashboard__block__component" :editing="editing" @updateMeta="updateMeta"></component>
    <dashboard-block v-else-if="children.length" v-for="(child, i) in children" v-bind="child" :component-getter="componentGetter" :key="child.id" :i="i" :editing="editing" @change="$emit('change')" @changing="$emit('changing')" @addChild="addChild" @deleteChild="deleteChild" @replaceChild="replaceChild" @updateChild="updateChild" @resizeChild="resizeChild"></dashboard-block>
    <component v-else :is="emptyDashboard" class="dashboard__block__component dashboard__block__component--empty"></component>

    <div class="controls" v-if="editing && type === 'panel'" @dragstart="handleDragstart" draggable="true" ref="draggable">
      <div class="controls__control controls__control--hover controls__control--delete" role="button" @click="handleDelete">x</div>

      <div class="controls__control controls__control--drop controls__control--left" role="button" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleAddDrop">+</div>
      <div class="controls__control controls__control--drop controls__control--top" role="button" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleAddDrop">+</div>
      <div class="controls__control controls__control--drop controls__control--right" role="button" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleAddDrop">+</div>
      <div class="controls__control controls__control--drop controls__control--bottom" role="button" @dragenter="handleDragenter" @dragleave="handleDragleave" @drop="handleAddDrop">+</div>
    </div>

    <div v-if="editing" class="drag-control" @mousedown="handleMouseDown"></div>
  </div>
</template>

<script type="text/babel">
  const minimumSizes = {
    height: 100,
    width: 200,
  };

  const randomId = () => {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0]
    return uint32.toString(16)
  }

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
        type: String,
      },
      children: {
        type: Array,
      },
      i: {
        type: Number,
      },
      componentGetter: {
        type: Function,
        required: true,
      },
      editing: {
        type: Boolean,
        required: true,
      },
      id: {
        required: true
      }
    },
    data: () => ({
      state: 'default'
    }),
    methods: {
      clone () {
        return {
          id: this.id,
          type: this.type || 'horizontal',
          size: this.size || 1,
          i: this.i || 0,
          component: this.component || '',
          meta: this.meta,
          children: JSON.parse(JSON.stringify(this.children || [])) // [...(this.children || [])]
        }
      },
      resizeChild (e) {
        for (const child of e) {
          child.path.unshift(this.i)
        }
        this.$emit('resizeChild', e)
      },
      updateMeta (e) {
        const updatedData = this.clone()
        updatedData.meta = e
        this.$emit('updateChild', { data: updatedData, remove: null } )
      },
      updateChild (e) {
        const updatedData = this.clone()
        updatedData.children[e.data.i] = e.data
        this.$emit('updateChild', { data: updatedData, remove: e.remove } )
      },
      addChild (e) {
        if (e.newComponent && e.direction && typeof e.i !== 'undefined' && e.i >= 0 && e.i < this.children.length) {
          const remove = e.newComponent.remove || null
          if (e.newComponent.remove) {
            delete e.newComponent.remove
          }
          const updatedData = this.clone()
          const directionMatch = {
            left: 'horizontal',
            right: 'horizontal',
            top: 'vertical',
            bottom: 'vertical',
          };
          // Direction might need switching if there's only one element
          if (updatedData.children.length === 1) {
            updatedData.type = directionMatch[e.direction];
          }
          if (updatedData.type === directionMatch[e.direction]) {
            // This shrinks all the child elements to make room for the new one,
            // but does so in a way that the smaller ones don't go below the
            // minimum size
            const isHorizontal = updatedData.type === 'horizontal';
            const rect = this.$refs.block.getBoundingClientRect();
            const size = isHorizontal ? rect.width : rect.height;
            const minSize = minimumSizes[isHorizontal ? 'width' : 'height'];
            const minPercent = minSize / size;

            /* eslint-disable no-mixed-operators */

            const n = updatedData.children.length;
            const newChildSize = 1 / (n + 1);

            const beforeAllExcess = 1 - n * minPercent;
            const afterAllExcess = 1 - (n + 1) * minPercent;

            if (afterAllExcess < 0) {
              // @todo something more informative here: there's no space
              return;
            }

            const sizeAdjustFactor = (afterAllExcess - (newChildSize - minPercent)) / beforeAllExcess;
            updatedData.children.forEach((child) => {
              /* eslint-disable no-param-reassign */
              child.size = (child.size - minPercent) * sizeAdjustFactor + minPercent;
            });

            const spliceI = e.i + ((e.direction === 'right' || e.direction === 'bottom') ? 1 : 0);

            updatedData.children.splice(spliceI, 0, Object.assign(e.newComponent, {
              type: 'panel',
              size: newChildSize
            }, { id: randomId() }));
          } else {
            const newSelf = {
              type: 'panel',
              size: 0.5,
              id: updatedData.children[e.i].id,
              component: updatedData.children[e.i].component,
              meta: updatedData.children[e.i].meta,
            };
            const newSibling = Object.assign(e.newComponent, {
              type: 'panel',
              size: 0.5
            }, { id: randomId() });

            const children = (e.direction === 'right' || e.direction === 'bottom') ?
              [newSelf, newSibling] : [newSibling, newSelf];

            updatedData.children.splice(e.i, 1, {
              type: directionMatch[e.direction],
              size: updatedData.children[e.i].size,
              children,
              id: randomId()
            });
          }
          this.$emit('updateChild', { data: updatedData, remove })
          this.$emit('change');
        }
      },
      replaceChild (e) {
        if (typeof e.i !== 'undefined' && e.i >= 0 && e.i < this.children.length) {
          const updatedData = this.clone()
          if (e.newComponent) {
            const remove = e.newComponent.remove || null
            if (e.newComponent.remove) {
              delete e.newComponent.remove
            }
            Object.assign(updatedData.children[e.i], e.newComponent, { id: randomId() });
            this.$emit('updateChild', { data: updatedData, remove })
            this.$emit('change');
          } else if (e.newComponents) {
            updatedData.children.splice(e.i, 1, ...e.newComponents);
            this.$emit('updateChild', { data: updatedData, remove: null })
            this.$emit('change');
          }
        }
      },
      deleteChild (e) {
        const updatedData = this.clone()
        if (updatedData.children.length === 1) {
          // only child - just remove it. This can only happen at the top level and results in an empty dashboard
          updatedData.children.splice(0, 1);
          this.$emit('updateChild', { data: updatedData, remove: null })
        } else if (updatedData.children.length === 2) {
          // going from 2 to 1 children - remove this container and inject remaining element into parent's children directly
          const sibling = updatedData.children[1 - e.i];

          if (this.$parent.children) { // dummy test to see if parent is another block
            if (sibling.type === 'panel') {
              // just inherit the old container's size and replace the container with the child
              sibling.size = updatedData.size;
              this.$emit('replaceChild', { newComponent: sibling, i: updatedData.i })
            } else {
              // merge children of sibling into parent container
              const newChildren = sibling.children.map((child) => {
                return Object.assign({}, child, { size: child.size * updatedData.size })
              });
              this.$emit('replaceChild', { newComponents: newChildren, i: updatedData.i })
            }
          } else { // otherwise we know it's the root dashboard component and we need to keep or alter the container
            if (sibling.type === 'panel') {
              // just leave the one item in the container and take up all the space
              sibling.size = 1;
              updatedData.children.splice(e.i, 1);
            } else {
              // merge children of sibling into parent container
              updatedData.children = sibling.children
              updatedData.type = sibling.type
            }
            this.$emit('updateChild', { data: updatedData, remove: null })
          }
        } else {
          const oldItems = updatedData.children.splice(e.i, 1);

          updatedData.children.forEach((child) => {
            // eslint-disable-next-line no-param-reassign
            child.size /= 1 - oldItems[0].size;
          });
          this.$emit('updateChild', { data: updatedData, remove: null })
        }

        this.$emit('change');
      },
      handleAddDrop(e) {
        e.target.classList.remove('controls__control--active');
        const data = e.dataTransfer.getData('text');
        if (data && this.editing) {
          const direction = e.target.className.replace(/.*controls__control--(\S+).*/, '$1');
          const newComponent = JSON.parse(data);
          this.$emit('addChild', { newComponent, direction, i: this.i })
        }
      },
      handleReplaceDrop(e) {
        e.target.classList.remove('controls__control--active');
        const data = e.dataTransfer.getData('text');
        if (
          data &&
          this.editing &&
          !e.target.classList.contains('controls__control') && // Event has propagated, ignore
          (this.type === 'panel' || !this.children.length) // This is an add that has propagated, not a replace
        ) {
          const newComponent = JSON.parse(data);
          if (this.type === 'panel') {
            this.$emit('replaceChild', { newComponent, i: this.i })
          } else {
            const updatedData = this.clone()
            // This is a specific case just for empty dashboards
            updatedData.children.push(Object.assign(newComponent, {
              type: 'panel',
              size: 1,
              id: randomId()
            }));
            this.$emit('updateChild', { data: updatedData, remove: null });
            this.$emit('change');
          }
        }
      },
      handleDragenter(e) {
        e.target.classList.add('controls__control--active');
      },
      handleDragleave(e) {
        e.target.classList.remove('controls__control--active');
      },
      handleDelete() {
        this.$emit('deleteChild', { i: this.i })
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
          this.$emit('resizeChild', [{ path: [this.i], size: currentStartSize - offsetAsPercentage }, { path: [this.i - 1], size: previousStartSize + offsetAsPercentage }])
          this.$emit('changing');
        };
        const mouseupHandler = () => {
          document.removeEventListener('mousemove', mousemoveHandler);
          document.removeEventListener('mouseup', mouseupHandler);

          this.$emit('change');
        };

        document.addEventListener('mousemove', mousemoveHandler);
        document.addEventListener('mouseup', mouseupHandler);
      },
      handleDragstart(e) {
        if (this.type !== 'panel') {
          return;
        }

        const data = {
          component: this.component,
          meta: this.meta,
          remove: this.id
        };

        e.dataTransfer.setData('text', JSON.stringify(data));

        this.state = 'dragging';

        const dropHandler = (ei) => {
          document.removeEventListener('drop', dropHandler);
          this.state = 'default';
        };

        document.addEventListener('drop', dropHandler);
      }
    },
    computed: {
      flexBasis() {
        const percentage = `${this.size * 100}%`;
        return this.type === 'panel' ? `calc(${percentage} - 10px)` : percentage;
      },
      realComponent() {
        return this.componentGetter(this.component, this.meta);
      },
      emptyDashboard() {
        return this.componentGetter('empty-dashboard');
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
          top: 0;

          width: 10px;
          height: 100%;

          cursor: ew-resize;
        }

        // Display on top
        .dashboard__block--vertical > & {
          top: -5px;
          left: 0;

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
