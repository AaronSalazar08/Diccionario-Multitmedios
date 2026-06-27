<script setup>
import { computed } from 'vue'
import { useDictionaryStore } from '@/stores/dictionary'

const store = useDictionaryStore()

const activeLetter = computed(() => store.currentConcept?.letter ?? null)

function jumpToLetter(letter) {
  if (store.currentId) store.goHome()
  setTimeout(() => {
    const el = document.getElementById(`section-${letter}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, store.currentId ? 300 : 20)
}
</script>

<template>
  <aside class="side-panel">
    <div class="panel-block">
      <div class="panel-label">ÍNDICE</div>
      <nav class="alpha-nav" aria-label="Índice alfabético">
        <button
          v-for="letter in store.letters"
          :key="letter"
          class="alpha-row"
          :class="{ active: letter === activeLetter }"
          @click="jumpToLetter(letter)"
          :aria-label="`Letra ${letter}, ${store.countByLetter[letter]} términos`"
        >
          <span class="alpha-open">[</span><span class="alpha-char">{{ letter }}</span><span class="alpha-close">]</span>
          <span class="alpha-fill" aria-hidden="true">·················</span>
          <span class="alpha-n">{{ store.countByLetter[letter] }}</span>
        </button>
      </nav>
    </div>

    <Transition name="recent-fade">
      <div class="panel-block" v-if="store.recentConceptos.length">
        <div class="panel-label">RECIENTES</div>
        <ul class="recent-list">
          <li v-for="concept in store.recentConceptos" :key="concept.id">
            <button
              class="recent-row"
              :class="{ active: concept.id === store.currentId }"
              @click="store.selectConcept(concept.id)"
            >
              <span class="recent-id">#{{ String(concept.id).padStart(3, '0') }}</span>
              <span class="recent-term">{{ concept.term }}</span>
            </button>
          </li>
        </ul>
      </div>
    </Transition>
  </aside>
</template>

<style scoped>
.side-panel {
  width: 232px;
  flex-shrink: 0;
  background: var(--void);
  border-right: 1px solid var(--rim);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
}

.panel-block {
  border-bottom: 1px solid var(--rim);
  padding: 1rem 0 0.75rem;
}

.panel-label {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.58rem;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  padding: 0 1rem 0.6rem;
}

.alpha-nav {
  display: flex;
  flex-direction: column;
}

.alpha-row {
  display: flex;
  align-items: baseline;
  width: 100%;
  background: none;
  border: none;
  padding: 0.28rem 1rem;
  cursor: pointer;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.78rem;
  transition: background 0.12s;
  text-align: left;
}

.alpha-row:hover { background: rgba(74, 158, 255, 0.07); }
.alpha-row.active { background: rgba(74, 158, 255, 0.1); }

.alpha-open,
.alpha-close {
  color: var(--text-muted);
}

.alpha-char {
  color: var(--ember);
  font-weight: 500;
  width: 1ch;
}

.alpha-row.active .alpha-char { color: var(--signal); }

.alpha-fill {
  flex: 1;
  color: var(--rim);
  overflow: hidden;
  margin: 0 0.4rem;
  letter-spacing: 0.05em;
  line-height: 1;
  font-size: 0.65rem;
  user-select: none;
}

.alpha-n {
  color: var(--text-muted);
  font-size: 0.68rem;
  min-width: 1.5ch;
  text-align: right;
}

.alpha-row.active .alpha-n { color: var(--signal); }

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  background: none;
  border: none;
  padding: 0.32rem 1rem;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}

.recent-row:hover { background: rgba(74, 158, 255, 0.07); }
.recent-row.active { background: rgba(74, 158, 255, 0.1); }

.recent-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.recent-term {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.78rem;
  color: var(--text-dim);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-row.active .recent-term { color: var(--text); }

.recent-fade-enter-active,
.recent-fade-leave-active {
  transition: opacity 0.3s ease;
}
.recent-fade-enter-from,
.recent-fade-leave-to {
  opacity: 0;
}
</style>
