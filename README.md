# dirk

> A simple dashboard layout tool powered by Vue.

## Installation

```
$ npm install --save dirk
```

## Usage

To use Dirk, you need to import the `Dashboard` component, and then pass in a configuration object containing information on what to display in the dashboard and how to display it.

Have a play with [the demo].

Each coloured block is a *panel*. Every panel is powered by a Vue component. For example:
 
```vue
<template>
  <dashboard :data="data" :component-getter="getComponent" :editing="true"></dashboard>
</template>

<script>
  import Dashboard from 'dirk';
  import MyTestPanel from './MyTestPanel.vue';
  
  export default {
    data: () => ({
      data: {
        type: 'horizontal',
        size: 1,
        children: [
          {
            type: 'panel',
            size: 1,
            component: 'MyTestPanel'
          }
        ]
      }
    }),
    methods: {
      getComponent(name) {
        if (name === 'MyTestPanel') {
          return MyTestPanel;
        }

        return { render: h => h('p', '404 component not found') };
      }
    },
    components: {
      Dashboard,
    }
  };
</script>
```

The would display the MyTestPanel component as the entire dashboard. There's two parts to this, the data object, and the getComponent method. The data object contains *blocks*, which can be a panel (a component), or "vertical" or "horizontal", which is a layout block which can contain multiple blocks laid out—you guessed it—either vertically or horizontally. The getComponent method takes the string stored in the configuration and returns an actual Vue component: the reason you can't specify a Vue component directly in the configuration is that it makes the object a lot trickier to store in a database.

In the previous example, we simple have a horizontal block containing a panel block. We can't have a panel block as the root block or the library won't know what to do when we add a new block. The `size` attribute says how much of the space a block should take up. For example, the following configuration would display two panels - the first taking 40% of the width, and the second taking 60% of the width.

```js
const data = {
  type: 'horizontal',
  size: 1,
  children: [
    {
      type: 'panel',
      size: 0.4,
      component: 'MyTestPanel'
    },
    {
      type: 'panel',
      size: 0.6,
      component: 'MyOtherTestPanel'
    }
  ]
};
```

It's also possible to pass in configuration, using the `meta` attribute:

```js
const data = {
  type: 'horizontal',
  size: 1,
  children: [
    {
      type: 'panel',
      size: 0.4,
      component: 'MyTestPanel',
      meta: {
        color: 'red'
      }
    },
    {
      type: 'panel',
      size: 0.6,
      component: 'MyOtherTestPanel',
      meta: {
        color: 'blue'
      }
    }
  ]
};
```

The contents of the meta object will be passed into the component as props—effectively, `<MyTestPanel color="red" />`.

@todo:

- complicated example (object from demo)
- toggling editing state
- adding new
- saving config
- full screen




[the demo]: https://samknows.github.io/dirk/
