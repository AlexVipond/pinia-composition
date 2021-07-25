<template>
  <main class="h-screen w-screen flex flex-col gap-8 items-center justify-center px-8 bg-gray-900">
    <h1 class="text-2xl tracking-widest font-bold uppercase text-gray-400">pinia composition demo</h1>
    <section class="w-full max-w-xl p-6 flex flex-col gap-10 bg-gray-800 text-gray-300 rounded-md shadow-lg">
      <div class="flex items-center gap-4">
        <input
          v-model="newTodoText"
          type="text"
          placeholder="New todo..."
          class="w-full bg-gray-700 border-none"
          @keydown.enter="() => { if (newTodoText) store.addTodo(newTodoText); newTodoText = '' }"
        />
        <button
          @click="() => { if (newTodoText) store.addTodo(newTodoText); newTodoText = '' }"
          class="flex-shrink-0 bg-blue-900 shadow-lg p-2 rounded-lg hover:scale-110 active:scale-110 transition"
        >
          Add todo
        </button>
      </div>
      <ul class="flex flex-col gap-4 divide-y-2 divide-gray-700">
        <li
          v-for="todo in store.todos"
          :key="todo.id"
          class="flex flex-col gap-2 pt-4"
        >
          <span class="text-lg">{{ todo.text }}</span>
          <div class="flex items-center gap-2">
            <span class="text-xs uppercase font-bold tracking-widest">Unfinished</span>
            <Switch
              :modelValue="todo.isFinished"
              @update:modelValue="value => { if (value) store.finishTodo(({ id }) => id === todo.id); else store.unfinishTodo(({ id }) => id === todo.id) }"
              :class="todo.isFinished ? 'bg-blue-700' : 'bg-blue-900'"
              class="relative inline-flex flex-shrink-0 h-[28px] w-[64px] border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
              <span class="sr-only">Finish</span>
              <span
                aria-hidden="true"
                :class="todo.isFinished ? 'translate-x-9' : 'translate-x-0'"
                class="pointer-events-none inline-block h-[24px] w-[24px] rounded-full bg-white shadow-lg transform ring-0 transition ease-in-out duration-200"
              />
            </Switch>
            <span class="text-xs uppercase font-bold tracking-widest">Finished</span>
          </div>
        </li>
      </ul>
    </section>
    <!-- <pre class="w-full max-w-xl p-4 bg-black text-gray-400 rounded-md"><code>{{ todos }}</code></pre> -->
  </main>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { createPiniaComposition } from './pinia-composition'
import { CheckCircleIcon } from '@heroicons/vue/solid'
import { Switch } from '@headlessui/vue'

export default defineComponent({
  components: {
    CheckCircleIcon,
    Switch,
  },
  setup () {
    const store = useTodos()

    exampleTodos.forEach(text => store.addTodo(text))

    window.pinia = store

    const newTodoText = ref('')

    return {
      todos: computed(() => JSON.stringify(store.todos, null, 2)),
      store,
      newTodoText,
    }
  }
})

const exampleTodos = [
  'Learn Composition API',
  'Learn Pinia',
  'Experiment with Pinia Composition'
]

const { useState, useGetter, useAction, useStore: useTodos } = createPiniaComposition('todos')

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

/* ~~~ */

useState('filter', 'all')
useGetter(
  'filteredTodos',
  state => {
    if (state.filter === 'finished') {
      // call other getters with autocompletion ✨
      return state.finishedTodos
    } else if (state.filter === 'unfinished') {
      return state.unfinishedTodos
    }
    return state.todos
  }
)
</script>
