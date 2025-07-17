// @ts-check

const Mutex = require('../mutex')

/**
 * The DeadlockDetector is like a traffic controller. It keeps track of:
 * - Who’s using what resource (owner)
 * - Who’s waiting to use each resource (waiters)
 * - Whether there’s a circular waiting pattern (deadlock)
 */
class DeadlockDetector {
  constructor() {
    this.resourceGraph = new Map()
    this.mutex = new Mutex()
  }

  async registerResource(resourceId, threadId) {
    await this.mutex.withLock(async () => {
      if (!this.resourceGraph.has(resourceId)) {
        this.resourceGraph.set(resourceId, { owner: null, waiters: new Set() })
      }

      const resource = this.resourceGraph.get(resourceId)
      if (resource.owner == null) {
        resource.owner = threadId
      } else {
        resource.waiters.add()
        if (this.detectCycle()) {
          throw new Error('Potential deadlock detected')
        }
      }
    })
  }

  async releaseResource(resourceId, threadId) {
    await this.mutex.withLock(async () => {
      const resource = this.resourceGraph.get(resourceId)
      if (!resource) return

      if (resource.owner === threadId) {
        if (resource.waiters.size > 0) {
          const nextOwner = Array.from(resource.waiters)[0]
          resource.waiters.delete(nextOwner)
          resource.owner = nextOwner
        } else {
          resource.owner = null
        }
      }
    })
  }

  detectCycle() {
    const visited = new Set()
    const recursionStack = new Set()

    const dfs = (threadId) => {
      if (recursionStack.has(threadId)) return true
      if (visited.has(threadId)) return true

      visited.add(threadId)
      recursionStack.add(threadId)

      for (const [, resource] of this.resourceGraph) {
        if (resource.waiters.has(threadId)) {
          if (dfs(resource.owner)) return true
        }
      }

      recursionStack.delete(threadId)
      return false
    }

    for (const [, resource] of this.resourceGraph) {
      if (resource.owner && !visited.has(resource.owner)) {
        if (dfs(resource.owner)) return true
      }
    }

    return false
  }
}

module.exports = DeadlockDetector
