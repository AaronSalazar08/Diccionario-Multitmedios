import { computed } from 'vue'
import { useDictionaryStore } from '@/stores/dictionary'
import dependencies from '@/data/conceptTree.json'

const LEVEL_LABELS = [
  'Fundamentos',
  'Primeros bloques',
  'Mecanismos centrales',
  'Comportamiento e interacción',
  'Composición de UI',
  'Layout y patrones avanzados',
  'Integración de sistemas',
  'Optimización y síntesis',
]

function computeLevels(depMap) {
  const memo = new Map()
  function levelOf(id) {
    if (memo.has(id)) return memo.get(id)
    const reqs = depMap.get(id) ?? []
    const level = reqs.length === 0 ? 0 : 1 + Math.max(...reqs.map(levelOf))
    memo.set(id, level)
    return level
  }
  for (const id of depMap.keys()) levelOf(id)
  return memo
}

export function useConceptTree() {
  const store = useDictionaryStore()

  const depMap = new Map(dependencies.map((d) => [d.id, d.requires]))
  const levelById = computeLevels(depMap)

  const requiredByMap = new Map()
  for (const { id, requires } of dependencies) {
    for (const reqId of requires) {
      if (!requiredByMap.has(reqId)) requiredByMap.set(reqId, [])
      requiredByMap.get(reqId).push(id)
    }
  }

  const nodes = computed(() =>
    dependencies.map(({ id, requires }) => {
      const concept = store.conceptos.find((c) => c.id === id)
      return {
        id,
        term: concept?.term ?? `#${id}`,
        letter: concept?.letter ?? '?',
        requires,
        requiredBy: requiredByMap.get(id) ?? [],
        level: levelById.get(id) ?? 0,
      }
    }),
  )

  const nodesById = computed(() => new Map(nodes.value.map((n) => [n.id, n])))

  const levels = computed(() => {
    const maxLevel = Math.max(...nodes.value.map((n) => n.level))
    const grouped = []
    for (let lvl = 0; lvl <= maxLevel; lvl++) {
      grouped.push({
        level: lvl,
        label: LEVEL_LABELS[lvl] ?? `Nivel ${lvl}`,
        nodes: nodes.value.filter((n) => n.level === lvl),
      })
    }
    return grouped
  })

  const edges = computed(() => {
    const list = []
    for (const node of nodes.value) {
      for (const reqId of node.requires) {
        list.push({ from: reqId, to: node.id })
      }
    }
    return list
  })

  return { nodes, nodesById, levels, edges }
}
