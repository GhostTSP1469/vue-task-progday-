<script setup>
import { ref } from 'vue'
import { Delete, Divide, X, Minus, Plus, Equal, Percent } from 'lucide-vue-next'

const display = ref('0')

function add(ch) {
  if (display.value === '0' && ch !== ',' && ch !== '+' && ch !== '-' && ch !== '*' && ch !== '/') {
    display.value = ch
  } else {
    display.value += ch
  }
}

function addOp(op) {
  const last = display.value.slice(-1)
  if (['+', '-', '*', '/'].includes(last)) {
    display.value = display.value.slice(0, -1) + op
  } else {
    display.value += op
  }
}


function addComma() {
 
  const parts = display.value.split(/[+\-*/]/)
  const lastNum = parts[parts.length - 1]
  if (!lastNum.includes(',')) {
    display.value += ','
  }
}


function calculate() {
  try {
  
    const expr = display.value.replace(/,/g, '.')
    const result = Function('"use strict"; return (' + expr + ')')()
    if (!Number.isFinite(result)) { display.value = 'Ошибка'; return }

    display.value = String(+result.toFixed(8)).replace('.', ',')
  } catch {
    display.value = 'Ошибка'
  }
}


function doPercent() {
  const parts = display.value.split(/([+\-*/])/)
  const last = +parts[parts.length - 1].replace(',', '.')

  if (parts.length >= 3) {
    const base = Function('"use strict"; return (' + parts.slice(0, -2).join('').replace(/,/g, '.') + ')')()
    parts[parts.length - 1] = String(+(base * last / 100).toFixed(8)).replace('.', ',')
  } else {
    parts[parts.length - 1] = String(+(last / 100).toFixed(8)).replace('.', ',')
  }

  display.value = parts.join('')
}

function toggleSign() {
  const parts = display.value.split(/([+\-*/])/)
  const last = parts[parts.length - 1]

  if (last === '') {
    parts.push('-')
  } else if (parts.length >= 2 && parts[parts.length - 2] === '-') {
    parts.splice(parts.length - 2, 1)
  } else if (parts.length >= 2) {
    parts.splice(parts.length - 1, 0, '-')
  } else {
    parts[0] = last.startsWith('-') ? last.slice(1) : '-' + last
  }

  display.value = parts.join('') || '0'
}

function backspace() {
  display.value = display.value.length > 1 ? display.value.slice(0, -1) : '0'
}

function clear() {
  display.value = '0'
}

const btn = 'flex aspect-square select-none items-center justify-center rounded-full text-3xl transition-colors duration-100'
const fnBtn = btn + ' bg-[#d4d4d2] text-black active:bg-[#e4e4e2] dark:bg-[#a5a5a5] dark:active:bg-[#d9d9d9]'
const numBtn = btn + ' bg-white text-black active:bg-slate-200 dark:bg-[#333333] dark:text-white dark:active:bg-[#737373]'
const opBtn = btn + ' bg-[#ff9f0a] text-white active:bg-[#ffb340]'
const eqBtn = btn + ' bg-[#ff9f0a] text-white active:bg-[#ffb340]'
</script>

<template>
  <div class="flex min-h-[calc(100dvh-8.5rem)] flex-col justify-end gap-4">
    <div class="truncate px-3 text-right text-7xl font-light tracking-tight tabular-nums">
      {{ display }}
    </div>

    <div class="grid grid-cols-4 gap-3">
      <button :class="fnBtn" @click="backspace"><Delete :size="30" :stroke-width="2" /></button>
      <button :class="fnBtn" @click="clear">AC</button>
      <button :class="fnBtn" @click="doPercent"><Percent :size="30" :stroke-width="2" /></button>
      <button :class="opBtn" @click="addOp('/')"><Divide :size="30" :stroke-width="2" /></button>

      <button :class="numBtn" @click="add('7')">7</button>
      <button :class="numBtn" @click="add('8')">8</button>
      <button :class="numBtn" @click="add('9')">9</button>
      <button :class="opBtn" @click="addOp('*')"><X :size="30" :stroke-width="2" /></button>

      <button :class="numBtn" @click="add('4')">4</button>
      <button :class="numBtn" @click="add('5')">5</button>
      <button :class="numBtn" @click="add('6')">6</button>
      <button :class="opBtn" @click="addOp('-')"><Minus :size="30" :stroke-width="2" /></button>

      <button :class="numBtn" @click="add('1')">1</button>
      <button :class="numBtn" @click="add('2')">2</button>
      <button :class="numBtn" @click="add('3')">3</button>
      <button :class="opBtn" @click="addOp('+')"><Plus :size="30" :stroke-width="2" /></button>

      <button :class="fnBtn" @click="toggleSign">
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round"><path d="M12 3v10" /><path d="M7 8h10" /><path d="M7 20h10" /></svg>
      </button>
      <button :class="numBtn" @click="add('0')">0</button>
      <button :class="numBtn" @click="addComma">,</button>
      <button :class="eqBtn" @click="calculate"><Equal :size="30" :stroke-width="2" /></button>
    </div>
  </div>
</template>
