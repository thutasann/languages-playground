// @ts-check

class Semaphore {
  constructor(maxConcurrent = 1) {
    this.maxConcurrent = maxConcurrent
    this.current = 0
    this.queue = []
  }

  async acquire() {
    if (this.current < this.maxConcurrent) {
      this.current++
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      this.queue.push(resolve)
    })
  }

  release() {
    this.current--

    if (this.queue.length > 0 && this.current < this.maxConcurrent) {
      this.current++
      const next = this.queue.shift()
      next()
    }
  }
}

module.exports = Semaphore
