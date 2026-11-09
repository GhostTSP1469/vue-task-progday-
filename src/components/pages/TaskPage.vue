<script setup>
import { ref, computed, watch } from 'vue'
import { useTaskStore } from '../datas/task.js'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

const isEdit = computed(() => route.params.id !== undefined)
const date=ref(new Date().toLocaleDateString('sv-SE'))
const text = ref('')
const start = ref('')
const end = ref('')

// Если открыли режим правки — найти задачу по id и подставить её поля в форму.
// Срабатывает и при переходе из «Сегодня», и когда задачи только-только подгрузились с сервера.
watch(
  [() => route.params.id, () => taskStore.tasks],
  () => {
    if (!isEdit.value) return
    const task = taskStore.tasks.find(t => t.id === Number(route.params.id))
    if (!task) return
    text.value = task.text
    start.value = task.start
    end.value = task.end
    date.value = task.date
  },
  { immediate: true, deep: true }
)

const isValid = computed(() => {
    if (start.value >= end.value) {
    return false
  }
  return text.value.trim().length > 0 && start.value.trim().length > 0 && end.value.trim().length > 0 && date.value.trim().length > 0
})


function submit() {
  if (isEdit.value) {
    taskStore.updateTask({
      id: Number(route.params.id),
      text: text.value,
      start: start.value,
      end: end.value,
      date: date.value
    })
  } else {
    taskStore.addTask(text.value, start.value, end.value, date.value)
  }
  router.push('/main')
}


</script>

<template>
  <div>
    <h1 class="mb-5 text-3xl font-bold tracking-tight">
      {{ isEdit ? 'Изменить задачу' : 'Новая задача' }}
    </h1>

    <div
      v-if="isEdit"
      class="mb-3 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800"
    >
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold tabular-nums text-indigo-600 dark:text-indigo-400">
          {{ start || '--:--' }} – {{ end || '--:--' }}
        </p>
        <p class="truncate text-base font-medium">
          {{ text || 'Без названия' }}
        </p>
        <p class="mt-0.5 text-xs text-slate-400 dark:text-slate-500 tabular-nums">
          {{ date }}
        </p>
      </div>

      <span
        class="shrink-0 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
      >
        Превью
      </span>
    </div>

    <form
      @submit.prevent="submit()"
      class="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800"
    >
      <label class="flex flex-col gap-1">
        <span class="text-sm text-slate-600 dark:text-slate-300">Название</span>
        <input
          type="text"
          v-model="text"
          placeholder="Например, Code review"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500"
        >
      </label>

      <label class="flex flex-col gap-1">
        <span class="text-sm text-slate-600 dark:text-slate-300">Дата</span>
        <input
          type="date"
          v-model="date"
          class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:[color-scheme:dark]"
        >
      </label>

      <div class="flex gap-3">
        <label class="flex min-w-0 flex-1 flex-col gap-1">
          <span class="text-sm text-slate-600 dark:text-slate-300">Начало</span>
          <input
            type="time"
            v-model="start"
            class="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:[color-scheme:dark]"
          >
        </label>

        <label class="flex min-w-0 flex-1 flex-col gap-1">
          <span class="text-sm text-slate-600 dark:text-slate-300">Окончание</span>
          <input
            type="time"
            v-model="end"
            class="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:[color-scheme:dark]"
          >
        </label>
      </div>

      <p
        v-if="start && end && start >= end"
        class="text-sm text-red-600 dark:text-red-400"
      >
        Окончание должно быть позже начала
      </p>

      <button
        type="submit"
        :disabled="!isValid"
        class="mt-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {{ isEdit ? 'Сохранить' : 'Добавить задачу' }}
      </button>
    </form>
  </div>
</template>

<style scoped>

</style>