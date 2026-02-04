import type { BrickType, BrickFrontmatter } from '~/utils/brick-types'

export interface Brick {
  id: string
  type: BrickType
  title: string
  content: string
  tags: string[]
  frontmatter: BrickFrontmatter
  structuredData: Record<string, unknown> // Type-specific structured data
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export function useBricks() {
  const bricks = useState<Brick[]>('bricks', () => [])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchBricks = async (type?: BrickType) => {
    loading.value = true
    error.value = null
    try {
      const query = type ? `?type=${type}` : ''
      bricks.value = await $fetch<Brick[]>(`/api/bricks${query}`)
    } catch (e) {
      error.value = 'Failed to load bricks'
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  const createBrick = async (brick: Partial<Brick>) => {
    loading.value = true
    error.value = null
    try {
      const created = await $fetch<Brick>('/api/bricks', {
        method: 'POST',
        body: brick
      })
      bricks.value.push(created)
      return created
    } catch (e) {
      error.value = 'Failed to create brick'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const updateBrick = async (id: string, updates: Partial<Brick>) => {
    loading.value = true
    error.value = null
    try {
      const updated = await $fetch<Brick>(`/api/bricks/${id}`, {
        method: 'PUT',
        body: updates
      })
      const index = bricks.value.findIndex(b => b.id === id)
      if (index !== -1) bricks.value[index] = updated
      return updated
    } catch (e) {
      error.value = 'Failed to update brick'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const deleteBrick = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await $fetch(`/api/bricks/${id}`, { method: 'DELETE' })
      bricks.value = bricks.value.filter(b => b.id !== id)
    } catch (e) {
      error.value = 'Failed to delete brick'
      console.error(e)
      throw e
    } finally {
      loading.value = false
    }
  }

  const bricksByType = computed(() => {
    return bricks.value.reduce((acc, brick) => {
      if (!acc[brick.type]) acc[brick.type] = []
      acc[brick.type].push(brick)
      return acc
    }, {} as Record<BrickType, Brick[]>)
  })

  const getBrickById = (id: string) => {
    return bricks.value.find(b => b.id === id)
  }

  return {
    bricks,
    bricksByType,
    loading,
    error,
    fetchBricks,
    createBrick,
    updateBrick,
    deleteBrick,
    getBrickById
  }
}
