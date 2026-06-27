<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { highlightCode } from '@/composables/useHighlight'

const props = defineProps({
  code: { type: String, required: true },
  language: { type: String, default: 'text' },
  delay: { type: Number, default: 0 },
})

const lines = computed(() => props.code.split('\n'))
const visibleCount = ref(0)
const isAnimating = ref(false)
const copied = ref(false)

async function animate() {
  visibleCount.value = 0
  isAnimating.value = true
  if (props.delay) await new Promise((r) => setTimeout(r, props.delay))
  for (let i = 0; i < lines.value.length; i++) {
    await new Promise((r) => setTimeout(r, 52))
    visibleCount.value = i + 1
  }
  isAnimating.value = false
}

watch(() => props.code, animate)
onMounted(animate)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1800)
  } catch {
    // fallback: silently ignore
  }
}

function hl(line) {
  return highlightCode(line, props.language)
}
</script>

<template>
  <div class="code-block">
    <div class="code-header">
      <span class="code-lang">{{ language }}</span>
      <button class="code-copy" @click="copyCode" :class="{ done: copied }">
        <span v-if="copied">✓ copiado</span>
        <span v-else>copiar</span>
      </button>
    </div>

    <pre class="code-pre" :aria-label="`Código ${language}`"><code class="code-body"><span
        v-for="(line, i) in lines"
        :key="i"
        class="code-line"
        :class="{
          visible: i < visibleCount,
          cursor: isAnimating && i === visibleCount - 1,
        }"
      ><span class="ln" aria-hidden="true">{{ String(i + 1).padStart(2, ' ') }}</span><span class="lt" v-html="hl(line)"></span></span></code></pre>
  </div>
</template>

<style scoped>
.code-block {
  background: var(--code-bg);
  border: 1px solid var(--rim);
  border-radius: 8px;
  overflow: hidden;
}

.code-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 1rem;
  background: var(--surface);
  border-bottom: 1px solid var(--rim);
}

.code-lang {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.1em;
  color: var(--ember);
  text-transform: lowercase;
}

.code-copy {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  color: var(--text-muted);
  background: none;
  border: 1px solid var(--rim);
  border-radius: 4px;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
.code-copy:hover { color: var(--text); border-color: var(--text-dim); }
.code-copy.done { color: var(--hl-string); border-color: var(--hl-string); }

.code-pre {
  margin: 0;
  padding: 0.75rem 0;
  overflow-x: auto;
}

.code-body {
  display: flex;
  flex-direction: column;
}

.code-line {
  display: flex;
  align-items: baseline;
  padding: 0.12rem 1rem;
  opacity: 0;
  transform: translateX(-8px);
  transition: opacity 0.18s ease, transform 0.18s ease;
  min-height: 1.55em;
}

.code-line.visible {
  opacity: 1;
  transform: translateX(0);
}

.code-line.cursor .lt::after {
  content: '▌';
  color: var(--signal);
  animation: blink 0.65s step-end infinite;
  font-size: 0.85em;
  margin-left: 1px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.ln {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: var(--text-muted);
  user-select: none;
  flex-shrink: 0;
  min-width: 1.8rem;
  text-align: right;
  margin-right: 1rem;
  line-height: 1.6;
}

.lt {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.82rem;
  color: var(--text);
  white-space: pre;
  line-height: 1.6;
}
</style>

<style>
/* Syntax highlight classes — global so v-html can see them */
.hl-comment  { color: var(--hl-comment); }
.hl-string   { color: var(--hl-string); }
.hl-keyword  { color: var(--hl-keyword); }
.hl-number   { color: var(--hl-number); }
.hl-class    { color: var(--hl-class); }
.hl-variable { color: var(--hl-variable); }
.hl-property { color: var(--hl-property); }
.hl-attr     { color: var(--hl-attr); }
.hl-tag      { color: var(--hl-tag); }
.hl-selector { color: var(--hl-selector); }
.hl-flag     { color: var(--hl-flag); }
</style>
