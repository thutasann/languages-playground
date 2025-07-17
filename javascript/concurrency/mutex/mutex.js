// @ts-check

const Semaphore = require('../semaphore/semaphore')

class Mutex {
  constructor() {
    this.semaphore = new Semaphore(1)
  }

  async lock() {
    return this.semaphore.acquire()
  }

  unlock() {
    this.semaphore.release()
  }

  // A safer way to use the lock - it's like a self-closing door!
  async withLock(fn) {
    await this.lock()
    try {
      return await fn()
    } finally {
      this.unlock()
    }
  }
}

module.exports = Mutex
