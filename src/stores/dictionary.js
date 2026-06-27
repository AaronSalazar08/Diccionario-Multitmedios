import { defineStore } from 'pinia'
import conceptos from '@/data/conceptos.json'

export const useDictionaryStore = defineStore('dictionary', {
  state: () => ({
    conceptos,
    currentId: null,
    recentHistory: [],
    searchQuery: '',
  }),

  getters: {
    currentConcept: (state) =>
      state.conceptos.find((c) => c.id === state.currentId) ?? null,

    filteredConceptos: (state) => {
      const q = state.searchQuery.toLowerCase().trim()
      if (!q) return state.conceptos
      return state.conceptos.filter(
        (c) =>
          c.term.toLowerCase().includes(q) ||
          c.definition.toLowerCase().includes(q),
      )
    },

    letters: (state) => [...new Set(state.conceptos.map((c) => c.letter))],

    conceptsByLetter: (state) =>
      state.conceptos.reduce((acc, c) => {
        if (!acc[c.letter]) acc[c.letter] = []
        acc[c.letter].push(c)
        return acc
      }, {}),

    countByLetter: (state) =>
      state.conceptos.reduce((acc, c) => {
        acc[c.letter] = (acc[c.letter] ?? 0) + 1
        return acc
      }, {}),

    recentConceptos: (state) =>
      state.recentHistory
        .map((id) => state.conceptos.find((c) => c.id === id))
        .filter(Boolean),

    prevConcept: (state) => {
      if (!state.currentId) return null
      const idx = state.conceptos.findIndex((c) => c.id === state.currentId)
      return idx > 0 ? state.conceptos[idx - 1] : null
    },

    nextConcept: (state) => {
      if (!state.currentId) return null
      const idx = state.conceptos.findIndex((c) => c.id === state.currentId)
      return idx < state.conceptos.length - 1 ? state.conceptos[idx + 1] : null
    },
  },

  actions: {
    selectConcept(id) {
      this.currentId = id
      this.recentHistory = [id, ...this.recentHistory.filter((h) => h !== id)].slice(0, 5)
    },
    setSearch(query) {
      this.searchQuery = query
    },
    clearSearch() {
      this.searchQuery = ''
    },
    goHome() {
      this.currentId = null
      this.searchQuery = ''
    },
  },
})
