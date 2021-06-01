<template>
  <dashboard-block :class="'dashboard dashboard--editing dashboard--' + state" v-bind="value" :component-getter="componentGetter" :editing="editing" @change="$emit('change')" @changing="$emit('changing')" @updateChild="updateChild" @resizeChild="resizeChild" @message="message"></dashboard-block>
</template>

<script type="text/babel">
  import DashboardBlock from './DashboardBlock.vue';

  export default {
    props: {
      value: {
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
      state: 'none'
    }),
    methods: {
      message (data) {
        this.$emit('message', data)
      },
      updateChild (e) {
        const purge = (data, parent, index) => {
          if (data.children && data.children.length > 0) {
            const childIndex = data.children.findIndex(child => child.id && e.remove=== child.id)
            if (childIndex >= 0) {
              if (data.children.length === 1) {
                // only child - just remove it. This can only happen at the top level and results in an empty dashboard
                data.children.splice(0, 1);
              } else if (data.children.length === 2) {
                // going from 2 to 1 children - remove this container and inject remaining element into parent's children directly
                const sibling = data.children[1 - childIndex];

                if (parent.children) { // dummy test to see if parent is another block
                  if (sibling.type === 'panel') {
                    // just inherit the old container's size and replace the container with the child
                    sibling.size = data.size;
                    Object.assign(parent.children[index], sibling);
                  } else {
                    // merge children of sibling into parent container
                    const newChildren = sibling.children.map((child) => {
                      return Object.assign({}, child, { size: child.size * data.size })
                    });
                    parent.children.splice(index, 1, ...newChildren);
                  }
                } else { // otherwise we know it's the root dashboard component and we need to keep or alter the container
                  if (sibling.type === 'panel') {
                    // just leave the one item in the container and take up all the space
                    sibling.size = 1;
                    data.children.splice(childIndex, 1);
                  } else {
                    // merge children of sibling into parent container
                    data.children = sibling.children
                    data.type = sibling.type
                  }
                }
              } else {
                const oldItems = data.children.splice(childIndex, 1)
                for (const child of data.children) {
                  child.size /= 1 - oldItems[0].size
                }
              }
            } else {
              for (const [i, child] of data.children.entries()) {
                purge(child, data, i)
              }
            }
          }
        }
        if (e.remove) {
          purge(e.data, {}, 0)
        }
        this.$emit('input', e.data)
      },
      resizeChild (e) {
        const update = Object.assign({}, this.value)
        const resize = (data, path, size) => {
          if (path.length === 1) {
            data.children[path[0]].size = size
          } else {
            resize(data.children[path[0]], path.slice(1), size)
          }
        }
        for (const child of e) {
          resize(update, child.path.slice(1), child.size)
        }
        this.$emit('input', update)
      },
      dragover (e) {
        e.preventDefault();
      },
      dragstart () {
        this.state = 'dragging';
      },
      drop (e) {
        this.state = 'none';

        try {
          const data = JSON.parse(e.dataTransfer.getData('text'));

          if (data.component) {
            e.preventDefault();
          }
        } catch (e) {}
      }
    },
    watch: {
      editing (value) {
        if (value) {
          document.addEventListener('dragstart', this.dragstart);
          document.addEventListener('dragover', this.dragover, false);
          document.addEventListener('drop', this.drop);
        } else {
          document.removeEventListener('dragstart', this.dragstart);
          document.removeEventListener('dragover', this.dragover, false);
          document.removeEventListener('drop', this.drop);
        }
      }
    },
    mounted() {
      if (editing) {
        document.addEventListener('dragstart', this.dragstart);
        document.addEventListener('dragover', this.dragover, false);
        document.addEventListener('drop', this.drop);
      }
    },
    components: {
      DashboardBlock,
    },
  };
</script>

<style lang="scss" rel="stylesheet/scss" scoped>
  .dashboard {

    &:-webkit-full-screen {
      width: 100%;
      height: 100%;

      .lights-off & {
        background-color: black;
      }
    }
  }
</style>
