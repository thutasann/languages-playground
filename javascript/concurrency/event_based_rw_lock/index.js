// @ts-check

const Mutex = require('../mutex')
const { EventEmitter } = require('events')

/**
 * Read-Write Lock
 * @description
 * Think of Read-Write Lock as a smart access control system for shared data.
 * The main idea is that we can have multiple readers accessing data simultaneously (because reading doesn’t change anything),
 * but only one writer can modify the data at a time, and no one should be reading while writing is happening.
 */
class ReadWriteLock {
  constructor() {
    this.mutex = new Mutex()
    this.emitter = new EventEmitter()
    this.readCount = 0
    this.writeCount = 0
    this.waitingWriters = 0
  }

  async acquireReadLock() {
    await this.mutex.lock()
    try {
      if (this.writeCount > 0 || this.waitingWriters > 0) {
        const readPromise = new Promise((/** @type {any} */ resolve) => {
          const handler = () => {
            this.emitter.removeListener('writeComplete', handler)
            resolve()
          }
          this.emitter.on('writeComplete', handler)
        })
        this.mutex.unlock()
        await readPromise
        await this.mutex.lock()
      }
      this.readCount++
    } finally {
      this.mutex.unlock()
    }
  }

  async releaseReadLock() {
    await this.mutex.lock()
    try {
      this.readCount--
      if (this.readCount === 0) {
        this.emitter.emit('readComplete')
      }
    } finally {
      this.mutex.unlock()
    }
  }

  async acquireWriteLock() {
    await this.mutex.lock()
    try {
      this.waitingWriters++
      if (this.writeCount > 0 || this.readCount > 0) {
        const writePromise = new Promise((/** @type { any } */ resolve) => {
          const handler = () => {
            this.emitter.removeListener('readComplete', handler)
            this.emitter.removeListener('writeComplete', handler)
            resolve()
          }
          this.emitter.on('readComplete', handler)
          this.emitter.on('writeComplete', handler)
        })
        this.mutex.unlock()
        await writePromise
        await this.mutex.lock()
      }
      this.waitingWriters--
      this.writeCount++
    } finally {
      this.mutex.unlock()
    }
  }

  async releaseWriteLock() {
    await this.mutex.lock()
    try {
      this.writeCount--
      this.emitter.emit('writeComplete')
    } finally {
      this.mutex.unlock()
    }
  }
}

module.exports = ReadWriteLock
