<script setup>
import { computed, onMounted } from 'vue'
import { useDictionaryStore } from '@/stores/dictionary'
import CodeBlock from './CodeBlock.vue'

const store = useDictionaryStore()

const concept = computed(() => store.currentConcept)

function renderDefinition(text) {
  const parts = text.split(/`([^`]+)`/)
  let result = ''
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      let chunk = parts[i]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      chunk = chunk.replace(/\*([^*]+)\*/g, '<em>$1</em>')
      result += chunk
    } else {
      const code = parts[i]
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
      result += `<code>${code}</code>`
    }
  }
  return result
}

onMounted(() => {
  document.querySelector('.main')?.scrollTo({ top: 0 })
})
</script>

<template>
  <article v-if="concept" class="concept-entry">
    <header class="entry-top">
      <div class="entry-meta">
        <span class="entry-id">#{{ String(concept.id).padStart(3, '0') }}</span>
        <span class="entry-letter-badge">[{{ concept.letter }}]</span>
      </div>

      <div class="entry-nav" role="navigation" aria-label="Navegación entre conceptos">
        <button
          class="nav-btn"
          :disabled="!store.prevConcept"
          @click="store.prevConcept && store.selectConcept(store.prevConcept.id)"
          :title="store.prevConcept?.term"
        >
          ← anterior
        </button>
        <button
          class="nav-btn"
          :disabled="!store.nextConcept"
          @click="store.nextConcept && store.selectConcept(store.nextConcept.id)"
          :title="store.nextConcept?.term"
        >
          siguiente →
        </button>
      </div>
    </header>

    <h1 class="entry-term">{{ concept.term }}</h1>
    <div class="entry-rule"></div>

    <p class="entry-definition" v-html="renderDefinition(concept.definition)"></p>

    <section class="entry-examples">
      <CodeBlock
        v-for="(ex, i) in concept.examples"
        :key="i"
        :code="ex.code"
        :language="ex.language"
        :delay="i * 700"
      />
    </section>

    <footer class="entry-foot">
      <button class="back-btn" @click="store.goHome()">
        ← volver al índice
      </button>
      <span class="foot-id">concepto {{ concept.id }} / {{ store.conceptos.length }}</span>
    </footer>
  </article>
</template>

<style scoped>
.concept-entry {
  padding: 2.5rem 3rem;
  max-width: 820px;
  animation: entryIn 0.35s ease both;
}

@keyframes entryIn {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}

.entry-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.entry-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: var(--text-muted);
}

.entry-letter-badge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: var(--ember);
  font-weight: 500;
}

.entry-nav {
  display: flex;
  gap: 0.5rem;
}

.nav-btn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  color: var(--text-dim);
  background: none;
  border: 1px solid var(--rim);
  border-radius: 4px;
  padding: 0.28rem 0.65rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.nav-btn:hover:not(:disabled) {
  color: var(--signal);
  border-color: var(--signal);
  background: var(--signal-dim);
}

.nav-btn:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.entry-term {
  font-family: 'IBM Plex Serif', serif;
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 700;
  color: var(--text);
  line-height: 1.15;
  margin: 0 0 0.75rem;
  letter-spacing: -0.025em;
}

.entry-rule {
  height: 2px;
  background: linear-gradient(to right, var(--signal) 0%, var(--signal) 60px, transparent 200px);
  margin-bottom: 1.75rem;
}

.entry-definition {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  color: var(--text);
  line-height: 1.85;
  max-width: 700px;
  margin-bottom: 0;
}

.entry-definition :deep(code) {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85em;
  color: var(--signal);
  background: var(--signal-dim);
  padding: 0.1em 0.35em;
  border-radius: 3px;
}

.entry-definition :deep(em) {
  font-style: italic;
  color: var(--text-dim);
}

.entry-examples {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.entry-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--rim);
}

.back-btn {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: var(--text-dim);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: color 0.15s;
}
.back-btn:hover { color: var(--signal); }

.foot-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  color: var(--text-muted);
}
</style>
