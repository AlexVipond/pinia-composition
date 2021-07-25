# Pinia Composition

A composition API for [Pinia](https://pinia.esm.dev)


## Motivation

Pinia's `defineStore` API makes you organize code based on whether it defines state, getters, or actions. You can see this clearly in an example from the docs:

```js
import { defineStore } from 'pinia'

export const useTodos = defineStore({
  id: 'todos',
  // All state is organized here, regardless of its purpose.
  state: () => ({
    todos: [],
    filter: 'all',
    nextId: 0,
  }),
  // Getters go here, not always close to the state they read.
  getters: {
    finishedTodos(state) {
      return state.todos.filter((todo) => todo.isFinished)
    },
    unfinishedTodos(state) {
      return state.todos.filter((todo) => !todo.isFinished)
    },
    filteredTodos(state) {
      if (this.filter === 'finished') {
        return this.finishedTodos
      } else if (this.filter === 'unfinished') {
        return this.unfinishedTodos
      }
      return this.todos
    },
  },
  // Actions also have their own space, often far away from
  // the state they read and write.
  actions: {
    addTodo(text) {
      this.todos.push({ text, id: this.nextId++, isFinished: false })
    },
  },
})
```

In many cases, though, it's useful to organize your code based on logical concern. Got a few actions that mutates a certain piece of state? Put all that code right underneath the line that defines the state with its initial value. Then, anyone reading your code can more easily get a bird's eye view of all the different ways your state could change during user interactions.


## Solution

In the spirit of Vue 3, I hacked up a composition API for Pinia.

Instead of calling `defineStore` to set up your store, call the `createPiniaComposition` function, passing your new store's `id`. The function returns some useful hooks for setting up your store.

Use those hooks to add new state, getters, and actions to your store's definition. Feel free to organize code by logical concern!

```js
const {
  useState,
  useGetter,
  useAction,
  useStore: useTodos,
} = createPiniaComposition('todos')

/* ~~~ */

useState('todos', [])
useState('nextId', 0)
useAction(
  'addTodo',
  store =>
    text => {
      store.todos.push({ text, id: store.nextId++, isFinished: false })
    }
)

/* ~~~ */

useGetter(
  'finishedTodos',
  state => state.todos.filter((todo) => todo.isFinished)
)
useAction(
  'finishTodo',
  store =>
    findTodo => store.todos.find(findTodo).isFinished = true
)

/* ~~~ */

useGetter(
  'unfinishedTodos',
  state => state.todos.filter((todo) => !todo.isFinished)
)
useAction(
  'unfinishTodo',
  store =>
    findTodo => store.todos.find(findTodo).isFinished = false
)
```

Then, inside your Vue component's `setup` function, call the `useStore` hook to actually create an instance of your configured store:

```html
<script setup>
import { ref } from 'vue'

const store = useStore()

const newTodoText = ref('')

function handleButtonClick () {
  store.addTodo(newTodoText.value)
}
</script>
```


## Try it out

Download and install:

```
npx degit alexvipond/pinia-composition && npm install && npm run dev
```

This is a Vite app that will be running on `http://localhost:3000`. Open up Vue DevTools to see the Pinia store react in real time as you play with the UI.


## Caveats

This is not a serious implementation of what a Pinia composition API should be. It's got some big problems!
- TypeScript support is 100% broken
- Support for `actions` works entirely on the `$onAction` API, which might change in the future
- It's not efficient—the store actually gets fully redefined, not just created, every single time you call the `useStore` hook in any `setup` function.

This is just an exploration of the idea, and my thoughts on what a composition-based DX might look like.
