<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useDictionaryStore } from '@/stores/dictionary'
import { useConceptTree } from '@/composables/useConceptTree'

const store = useDictionaryStore()
const { levels, nodesById } = useConceptTree()

const canvasRef = ref(null)
const nodeEls = new Map()
const paths = ref([])
const hoveredId = ref(null)
let leaveTimer = null

function setNodeRef(id, el) {
  if (el) nodeEls.set(id, el)
  else nodeEls.delete(id)
}

function updatePaths() {
  const canvasEl = canvasRef.value
  if (!canvasEl) return
  const base = canvasEl.getBoundingClientRect()
  const next = []
  for (const node of nodesById.value.values()) {
    const elTo = nodeEls.get(node.id)
    if (!elTo) continue
    const r2 = elTo.getBoundingClientRect()
    for (const reqId of node.requires) {
      const elFrom = nodeEls.get(reqId)
      if (!elFrom) continue
      const r1 = elFrom.getBoundingClientRect()
      const x1 = r1.left + r1.width / 2 - base.left
      const y1 = r1.bottom - base.top
      const x2 = r2.left + r2.width / 2 - base.left
      const y2 = r2.top - base.top
      const midY = (y1 + y2) / 2
      next.push({
        key: `${reqId}-${node.id}`,
        from: reqId,
        to: node.id,
        d: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`,
      })
    }
  }
  paths.value = next
}

let rafId = null
function schedulePathUpdate() {
  if (rafId) cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(updatePaths)
}

let resizeObserver = null

onMounted(async () => {
  await nextTick()
  updatePaths()
  resizeObserver = new ResizeObserver(schedulePathUpdate)
  if (canvasRef.value) resizeObserver.observe(canvasRef.value)
  window.addEventListener('resize', schedulePathUpdate)
})

onBeforeUnmount(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (leaveTimer) clearTimeout(leaveTimer)
  resizeObserver?.disconnect()
  window.removeEventListener('resize', schedulePathUpdate)
})

const hoveredNode = computed(() => (hoveredId.value ? nodesById.value.get(hoveredId.value) : null))

function collectAncestors(id, map, out = new Set()) {
  if (out.has(id)) return out
  out.add(id)
  const node = map.get(id)
  if (node) for (const r of node.requires) collectAncestors(r, map, out)
  return out
}

function collectDescendants(id, map, out = new Set()) {
  if (out.has(id)) return out
  out.add(id)
  const node = map.get(id)
  if (node) for (const d of node.requiredBy) collectDescendants(d, map, out)
  return out
}

const relatedIds = computed(() => {
  if (!hoveredId.value) return null
  const map = nodesById.value
  const ancestors = collectAncestors(hoveredId.value, map, new Set())
  const descendants = collectDescendants(hoveredId.value, map, new Set())
  return new Set([...ancestors, ...descendants])
})

function requireNames(ids) {
  return ids.map((id) => nodesById.value.get(id)?.term ?? `#${id}`)
}

function onNodeEnter(id) {
  if (leaveTimer) { clearTimeout(leaveTimer); leaveTimer = null }
  hoveredId.value = id
}

function onNodeLeave() {
  leaveTimer = setTimeout(() => { hoveredId.value = null; leaveTimer = null }, 80)
}

function goTo(id) {
  store.selectConcept(id)
}
</script>

<template>
  <div class="concept-tree">
    <div class="tree-hero">
      <h1 class="tree-title">Árbol Conceptual</h1>
      <p class="tree-sub">
        Ruta de aprendizaje sugerida: de los fundamentos a la síntesis. Cada concepto
        depende de los que aparecen sobre él. Pasa el cursor sobre un nodo para ver
        qué necesita y para qué se usa.
      </p>
    </div>

    <Teleport to="body">
      <Transition name="info-fade">
        <div v-if="hoveredNode" class="tree-info">
          <span class="info-term">{{ hoveredNode.term }}</span>
          <span class="info-row">
            <strong>requiere:</strong>
            <template v-if="hoveredNode.requires.length">
              {{ requireNames(hoveredNode.requires).join(', ') }}
            </template>
            <em v-else>nada — es un fundamento</em>
          </span>
          <span class="info-row">
            <strong>se usa en:</strong>
            <template v-if="hoveredNode.requiredBy.length">
              {{ requireNames(hoveredNode.requiredBy).join(', ') }}
            </template>
            <em v-else>ningún otro concepto (nodo final)</em>
          </span>
        </div>
      </Transition>
    </Teleport>

    <div class="tree-canvas" ref="canvasRef">
      <svg class="tree-edges" aria-hidden="true">
        <path
          v-for="p in paths"
          :key="p.key"
          :d="p.d"
          class="edge"
          :class="{
            'edge-active': relatedIds && relatedIds.has(p.from) && relatedIds.has(p.to),
          }"
        />
      </svg>

      <section
        v-for="lvl in levels"
        :key="lvl.level"
        class="tree-level"
      >
        <div class="level-label">
          <span class="level-index">N{{ lvl.level }}</span>
          <span class="level-name">{{ lvl.label }}</span>
          <span class="level-count">{{ lvl.nodes.length }}</span>
        </div>
        <div class="level-row">
          <button
            v-for="node in lvl.nodes"
            :key="node.id"
            :ref="(el) => setNodeRef(node.id, el)"
            class="tree-node"
            :class="{
              'is-dimmed': relatedIds && !relatedIds.has(node.id),
              'is-hovered': hoveredId === node.id,
            }"
            @mouseenter="onNodeEnter(node.id)"
            @mouseleave="onNodeLeave()"
            @click="goTo(node.id)"
            :aria-label="`${node.term}, nivel ${node.level}`"
          >
            <span class="node-letter">[{{ node.letter }}]</span>
            <span class="node-term">{{ node.term }}</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.concept-tree {
  padding: 2rem 2.5rem 4rem;
}

.tree-hero {
  max-width: 720px;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--rim);
}

.tree-title {
  font-family: 'IBM Plex Serif', serif;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  margin-bottom: 0.5rem;
}

.tree-sub {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 300;
  color: var(--text-dim);
  line-height: 1.6;
}

.tree-canvas {
  position: relative;
}

.tree-edges {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.edge {
  fill: none;
  stroke: var(--signal);
  stroke-width: 1.5;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.edge-active {
  opacity: 1;
}

.tree-level {
  position: relative;
  z-index: 1;
  margin-bottom: 4.5rem;
}

.level-label {
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  margin-bottom: 1.1rem;
}

.level-index {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--ember);
  letter-spacing: 0.04em;
}

.level-name {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text);
}

.level-count {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.62rem;
  color: var(--text-muted);
}

.level-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--surface);
  border: 1px solid var(--rim);
  border-radius: 6px;
  padding: 0.55rem 1rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, opacity 0.15s;
}

.tree-node:hover,
.tree-node.is-hovered {
  border-color: var(--signal);
  background: var(--signal-dim);
}

.tree-node.is-dimmed {
  opacity: 0.25;
}

.node-letter {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.6rem;
  color: var(--text-muted);
  flex-shrink: 0;
}

.node-term {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.82rem;
  color: var(--text);
  white-space: nowrap;
}

@media (max-width: 767px) {
  .concept-tree {
    padding: 1.5rem 1.25rem 3rem;
  }
}
</style>

<style>
.tree-info {
  position: fixed;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5rem 1.25rem;
  background: var(--surface);
  border: 1px solid var(--signal);
  border-radius: 8px;
  padding: 0.75rem 1.25rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  max-width: min(720px, calc(100vw - 3rem));
  pointer-events: none;
}

.info-term {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--signal);
}

.info-row {
  font-family: 'IBM Plex Sans', sans-serif;
  font-size: 0.78rem;
  color: var(--text-dim);
}

.info-row strong {
  color: var(--text-muted);
  font-weight: 600;
  margin-right: 0.3rem;
}

.info-row em {
  font-style: normal;
  color: var(--text-muted);
}

.info-fade-enter-active,
.info-fade-leave-active {
  transition: opacity 0.15s ease;
}
.info-fade-enter-from,
.info-fade-leave-to {
  opacity: 0;
}
</style>
