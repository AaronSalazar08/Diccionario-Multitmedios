<script setup>
import { computed } from 'vue'
import { useDictionaryStore } from '@/stores/dictionary'

const store = useDictionaryStore()

const isSearching = computed(() => store.searchQuery.trim().length > 0)

const searchGroups = computed(() => {
  if (!isSearching.value) return null
  return store.filteredConceptos.reduce((acc, c) => {
    if (!acc[c.letter]) acc[c.letter] = []
    acc[c.letter].push(c)
    return acc
  }, {})
})
</script>

<template>
  <div class="browse-view">
    <!-- Search mode -->
    <template v-if="isSearching">
      <div class="results-header">
        <span class="results-count">
          <strong>{{ store.filteredConceptos.length }}</strong>
          resultado{{ store.filteredConceptos.length !== 1 ? 's' : '' }}
          para <em>{{ store.searchQuery }}</em>
        </span>
      </div>

      <template v-if="store.filteredConceptos.length && searchGroups">
        <section
          v-for="(concepts, letter) in searchGroups"
          :key="letter"
          class="letter-section"
        >
          <h2 class="letter-head">
            <span class="lbadge">[{{ letter }}]</span>
          </h2>
          <ul class="term-grid">
            <li v-for="concept in concepts" :key="concept.id">
              <button
                class="term-card"
                @click="store.selectConcept(concept.id)"
                :title="concept.definition.slice(0, 120) + '…'"
              >
                <span class="tc-id">#{{ String(concept.id).padStart(3, '0') }}</span>
                <span class="tc-name">{{ concept.term }}</span>
              </button>
            </li>
          </ul>
        </section>
      </template>

      <div v-else class="empty-state">
        <span class="empty-glyph">∅</span>
        <p>Sin resultados para <em>{{ store.searchQuery }}</em></p>
        <button class="empty-reset" @click="store.clearSearch()">limpiar búsqueda</button>
      </div>
    </template>

    <!-- Browse mode -->
    <template v-else>
      <div class="browse-hero">
        <div class="hero-stat">
          <span class="hero-num">100</span>
          <span class="hero-label">conceptos de<br>desarrollo web</span>
        </div>
        <p class="hero-sub">Guía académica · IF7102 Multimedios · Universidad de Costa Rica</p>
      </div>

      <section
        v-for="letter in store.letters"
        :key="letter"
        class="letter-section"
        :id="`section-${letter}`"
      >
        <h2 class="letter-head">
          <span class="lbadge">[{{ letter }}]</span>
          <span class="lcount">{{ store.countByLetter[letter] }} términos</span>
        </h2>
        <ul class="term-grid">
          <li
            v-for="(concept, i) in store.conceptsByLetter[letter]"
            :key="concept.id"
            :style="{ animationDelay: `${Math.min(i * 40, 400)}ms` }"
          >
            <button
              class="term-card"
              @click="store.selectConcept(concept.id)"
              :title="concept.definition.slice(0, 120) + '…'"
            >
              <span class="tc-id">#{{ String(concept.id).padStart(3, '0') }}</span>
              <span class="tc-name">{{ concept.term }}</span>
            </button>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.browse-view {
  padding: 2rem 2.5rem 4rem;
  max-width: 1000px;
}

/* Hero */
.browse-hero {
  margin-bottom: 3rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--rim);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hero-stat {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
}

.hero-num {
  font-family: 'IBM Plex Serif', serif;
  font-size: 4.5rem;
  font-weight: 700;
  color: var(--signal);
  line-height: 1;
  letter-spacing: -0.04em;
}

.hero-label {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 1rem;
  font-weight: 300;
  color: var(--text-dim);
  line-height: 1.4;
}

.hero-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  color: var(--text-muted);
  letter-spacing: 0.04em;
}

/* Letter sections */
.letter-section {
  margin-bottom: 2.5rem;
  scroll-margin-top: 72px;
}

.letter-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.lbadge {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--ember);
  letter-spacing: 0.04em;
}

.lcount {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* Term grid */
.term-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

.term-grid li {
  animation: cardIn 0.28s ease both;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

.term-card {
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
  background: var(--surface);
  border: 1px solid var(--rim);
  border-radius: 6px;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s, background 0.15s, transform 0.15s, box-shadow 0.15s;
}

.term-card:hover {
  border-color: var(--signal);
  background: var(--signal-dim);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 158, 255, 0.12);
}

.tc-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.58rem;
  color: var(--text-muted);
  line-height: 1;
}

.tc-name {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text);
  white-space: nowrap;
  line-height: 1.3;
}

/* Search results */
.results-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--rim);
}

.results-count {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  color: var(--text-dim);
}

.results-count strong { color: var(--text); font-weight: 600; }
.results-count em { font-style: normal; color: var(--signal); }

/* Empty state */
.empty-state {
  text-align: center;
  padding: 5rem 2rem;
  color: var(--text-dim);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.empty-glyph {
  font-size: 3.5rem;
  color: var(--text-muted);
  line-height: 1;
  font-family: 'IBM Plex Serif', serif;
}

.empty-state p {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.9rem;
}

.empty-state em { font-style: normal; color: var(--text); }

.empty-reset {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.72rem;
  color: var(--signal);
  background: none;
  border: 1px solid var(--signal);
  border-radius: 4px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
  transition: background 0.15s;
}
.empty-reset:hover { background: var(--signal-dim); }
</style>
