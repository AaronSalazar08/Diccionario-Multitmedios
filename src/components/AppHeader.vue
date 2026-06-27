<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDictionaryStore } from '@/stores/dictionary'

const store = useDictionaryStore()
const wrapperRef = ref(null)
const inputRef = ref(null)
const query = ref('')
const isOpen = ref(false)
const highlightedIndex = ref(-1)

const suggestions = computed(() => {
  if (!query.value.trim()) return []
  const q = query.value.toLowerCase()
  return store.conceptos.filter((c) => c.term.toLowerCase().includes(q)).slice(0, 8)
})

function onInput() {
  store.setSearch(query.value)
  isOpen.value = true
  highlightedIndex.value = -1
}

function selectSuggestion(concept) {
  store.selectConcept(concept.id)
  query.value = ''
  store.clearSearch()
  isOpen.value = false
  highlightedIndex.value = -1
}

function clearSearch() {
  query.value = ''
  store.clearSearch()
  isOpen.value = false
  inputRef.value?.focus()
}

function onKeydown(e) {
  if (!isOpen.value || !suggestions.value.length) return
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    highlightedIndex.value = Math.min(highlightedIndex.value + 1, suggestions.value.length - 1)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    highlightedIndex.value = Math.max(highlightedIndex.value - 1, -1)
  } else if (e.key === 'Enter') {
    const target =
      highlightedIndex.value >= 0
        ? suggestions.value[highlightedIndex.value]
        : suggestions.value[0]
    if (target) selectSuggestion(target)
  } else if (e.key === 'Escape') {
    clearSearch()
  }
}

function onClickOutside(e) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target)) {
    isOpen.value = false
  }
}

function onGlobalKey(e) {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
  document.addEventListener('keydown', onGlobalKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onClickOutside)
  document.removeEventListener('keydown', onGlobalKey)
})
</script>

<template>
  <header class="app-header">
    <button class="header-logo" @click="store.goHome()">
      <span class="logo-mark">{ }</span>
      <div class="logo-text">
        <span class="logo-title">Diccionario Web</span>
        <span class="logo-sub">IF7102 · Multimedios UCR</span>
      </div>
    </button>

    <div class="search-wrapper" ref="wrapperRef">
      <div class="search-box" :class="{ focused: isOpen }">
        <span class="search-prompt">›</span>
        <input
          ref="inputRef"
          type="text"
          v-model="query"
          @input="onInput"
          @keydown="onKeydown"
          @focus="isOpen = query.length > 0"
          placeholder="buscar concepto..."
          autocomplete="off"
          spellcheck="false"
          aria-label="Buscar concepto"
        />
        <kbd v-if="!query" class="search-kbd">Ctrl K</kbd>
        <button v-else class="search-clear" @click="clearSearch" aria-label="Limpiar búsqueda">×</button>
      </div>

      <Transition name="dropdown">
        <ul v-if="isOpen && suggestions.length" class="suggestions-list" role="listbox">
          <li
            v-for="(concept, i) in suggestions"
            :key="concept.id"
            class="suggestion-item"
            :class="{ highlighted: i === highlightedIndex }"
            @mouseenter="highlightedIndex = i"
            @click="selectSuggestion(concept)"
            role="option"
          >
            <span class="sug-letter">[{{ concept.letter }}]</span>
            <span class="sug-term">{{ concept.term }}</span>
            <span class="sug-id">#{{ String(concept.id).padStart(3, '0') }}</span>
          </li>
        </ul>
      </Transition>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 0.875rem 1.5rem;
  background: var(--surface);
  border-bottom: 1px solid var(--rim);
  position: sticky;
  top: 0;
  z-index: 100;
  flex-shrink: 0;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 0;
  text-align: left;
  transition: opacity 0.15s;
}
.header-logo:hover { opacity: 0.8; }

.logo-mark {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--signal);
  letter-spacing: -0.05em;
  line-height: 1;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.logo-title {
  font-family: 'IBM Plex Serif', serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
  white-space: nowrap;
}

.logo-sub {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6rem;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.search-wrapper {
  flex: 1;
  max-width: 500px;
  position: relative;
  margin-left: auto;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--void);
  border: 1px solid var(--rim);
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-box.focused,
.search-box:focus-within {
  border-color: var(--signal);
  box-shadow: 0 0 0 3px var(--signal-dim);
}

.search-prompt {
  font-family: 'IBM Plex Mono', monospace;
  color: var(--signal);
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
  user-select: none;
}

.search-box input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  color: var(--text);
  caret-color: var(--signal);
  min-width: 0;
}

.search-box input::placeholder {
  color: var(--text-muted);
}

.search-kbd {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6rem;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--rim);
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  flex-shrink: 0;
  white-space: nowrap;
}

.search-clear {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  padding: 0;
  flex-shrink: 0;
  transition: color 0.15s;
}
.search-clear:hover { color: var(--text); }

.suggestions-list {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--surface);
  border: 1px solid var(--rim);
  border-radius: 6px;
  list-style: none;
  padding: 0.3rem 0;
  margin: 0;
  z-index: 200;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  overflow: hidden;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
  cursor: pointer;
  transition: background 0.1s;
}

.suggestion-item:hover,
.suggestion-item.highlighted {
  background: var(--signal-dim);
}

.sug-letter {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.68rem;
  color: var(--ember);
  flex-shrink: 0;
  min-width: 2.2rem;
}

.sug-term {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  color: var(--text);
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sug-id {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
