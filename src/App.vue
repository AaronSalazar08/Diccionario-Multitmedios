<script setup>
import { useDictionaryStore } from '@/stores/dictionary'
import AppHeader from '@/components/AppHeader.vue'
import SidePanel from '@/components/SidePanel.vue'
import ConceptEntry from '@/components/ConceptEntry.vue'
import BrowseView from '@/components/BrowseView.vue'
import ConceptTree from '@/components/ConceptTree.vue'

const store = useDictionaryStore()
</script>

<template>
  <div class="shell">
    <AppHeader />
    <div class="body">
      <SidePanel />
      <main class="main" role="main">
        <Transition name="view" mode="out-in">
          <ConceptEntry v-if="store.currentId" :key="store.currentId" />
          <ConceptTree v-else-if="store.treeOpen" key="tree" />
          <BrowseView v-else key="browse" />
        </Transition>
      </main>
    </div>
  </div>
</template>

<!-- ─── Global design tokens & resets ─── -->
<style>
:root {
  /* Surfaces */
  --void:       #07091A;
  --surface:    #0D1425;
  --surface-2:  #121C35;
  --rim:        #1C2A45;

  /* Accents */
  --signal:     #4A9EFF;
  --signal-dim: rgba(74, 158, 255, 0.12);
  --ember:      #FF6B35;

  /* Text */
  --text:       #D8E8FF;
  --text-dim:   #6B82A8;
  --text-muted: #2E4060;

  /* Code */
  --code-bg:    #060A14;

  /* Syntax */
  --hl-keyword:  #4A9EFF;
  --hl-string:   #5EFFA0;
  --hl-comment:  #2E4560;
  --hl-number:   #FF9052;
  --hl-class:    #C792EA;
  --hl-variable: #82AAFF;
  --hl-property: #7FDBCA;
  --hl-attr:     #ADDB67;
  --hl-tag:      #FF6B35;
  --hl-selector: #82AAFF;
  --hl-flag:     #FF9052;
}

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
  background: var(--void);
  color: var(--text);
  font-family: 'IBM Plex Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app { height: 100%; }

/* Custom scrollbar */
::-webkit-scrollbar        { width: 5px; height: 5px; }
::-webkit-scrollbar-track  { background: var(--void); }
::-webkit-scrollbar-thumb  { background: var(--rim); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

/* Focus ring */
:focus-visible {
  outline: 2px solid var(--signal);
  outline-offset: 2px;
}

/* Reduced motion: disable all animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
</style>

<!-- ─── Layout ─── -->
<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* CRT scanline overlay — the aesthetic risk */
.shell::after {
  content: '';
  position: fixed;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0, 8, 30, 0.045) 3px,
    rgba(0, 8, 30, 0.045) 4px
  );
  pointer-events: none;
  z-index: 9999;
}

.body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.main {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* View transition */
.view-enter-active,
.view-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.view-enter-from {
  opacity: 0;
  transform: translateX(10px);
}
.view-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

/* ── Mobile ── */
@media (max-width: 767px) {
  :deep(.side-panel) { display: none; }
  :deep(.concept-entry) { padding: 1.5rem 1.25rem; }
  :deep(.browse-view) { padding: 1.5rem 1.25rem 3rem; }
  :deep(.entry-top) { flex-direction: column; gap: 0.75rem; align-items: flex-start; }
}
</style>
