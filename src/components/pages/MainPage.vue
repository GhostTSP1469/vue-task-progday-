<script setup>
import { ref,computed } from 'vue'
import { useTaskStore } from '../datas/task.js'
const taskStore = useTaskStore()
const revsort=ref(false)
const sortedTasks = computed(() => {
  return taskStore.tasks                  
  .filter(task => task.date === new Date().toLocaleDateString('sv-SE')) // типо сегодняшняя дата
  .sort((a, b) => {
    if (a.completed === b.completed) {
      return a.start.localeCompare(b.start)
    }
    if (revsort.value) {
      return b.completed - a.completed
    }
    return a.completed - b.completed
  })
})
</script>

<template>
  <div>
    <header class="mb-5 flex items-end justify-between gap-3">
      <div>
        <p class="text-sm text-slate-500 dark:text-slate-400">План на день</p>
        <h1 class="text-3xl font-bold tracking-tight">Сегодня</h1>
      </div>

      <select
        v-model="revsort"
        class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <option :value="false">Сначала не выполненные</option>
        <option :value="true">Сначала выполненные</option>
      </select>
    </header>

    <ul class="flex flex-col gap-2">
      <li
        v-for="task in sortedTasks"
        :key="task.id"
        class="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm transition dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800"
        :class="{ 'opacity-60': task.completed }"
      >
   <div class="checkbox-wrapper-12 shrink-0">
  <div class="cbx">
    <input
      type="checkbox"
      :id="`cbx-${task.id}`"
      :checked="task.completed"
      @change="taskStore.toggleTaskCompleted(task.id)"
    >

    <label :for="`cbx-${task.id}`"></label>

    <svg fill="none" viewBox="0 0 15 14" height="14" width="15">
      <path d="M2 8.36364L6.23077 12L13 2"></path>
    </svg>
  </div>
</div>


        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
            {{ task.start }} – {{ task.end }}
          </p>
          <p
            class="truncate text-base font-medium"
            :class="{ 'line-through text-slate-400 dark:text-slate-500': task.completed }"
          >
            {{ task.text }}
          </p>
        </div>

        <span
          class="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
          :class="task.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'"
        >
          {{ task.completed ? 'Готово' : 'В плане' }}
        </span>

        <RouterLink
          :to="`/task/${task.id}`"
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-300"
          title="Изменить"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </RouterLink>

       <button
  @click="taskStore.removeTask(task.id)"
  type="button"
  class="relative w-8 h-8 rounded-full border-2 border-black group hover:border-red-500 duration-500 overflow-hidden shrink-0"
>
  <span
    class="relative z-10 flex items-center justify-center w-full h-full text-black text-xl leading-none duration-500 group-hover:scale-0"
  >
    ×
  </span>

  <span
    class="absolute w-full h-full bg-red-500 rotate-45 top-8 left-0 group-hover:top-3 duration-500"
  ></span>

  <span
    class="absolute w-full h-full bg-red-500 rotate-45 top-0 left-8 group-hover:left-3 duration-500"
  ></span>

  <span
    class="absolute w-full h-full bg-red-500 rotate-45 top-0 right-8 group-hover:right-3 duration-500"
  ></span>

  <span
    class="absolute w-full h-full bg-red-500 rotate-45 bottom-8 right-0 group-hover:bottom-3 duration-500"
  ></span>
</button>
     
      </li>
    </ul>

    <p
      v-if="sortedTasks.length === 0"
      class="mt-10 text-center text-slate-400 dark:text-slate-500"
    >
      Задач на сегодня нет
    </p>
  </div>
</template>

<style scoped>

</style>