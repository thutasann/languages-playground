// @ts-check

const ReadWriteLock = require('.')

class UserProfileService {
  constructor() {
    this.profiles = new Map()
    this.lock = new ReadWriteLock()
  }

  async getProfile(userId) {
    await this.lock.acquireReadLock()
    try {
      return this.profiles.get(userId)
    } finally {
      await this.lock.releaseReadLock()
    }
  }

  async getAllProfiles() {
    await this.lock.acquireReadLock()
    try {
      return Array.from(this.profiles.values())
    } finally {
      await this.lock.releaseReadLock()
    }
  }

  async updateProfile(userId, newData) {
    await this.lock.acquireWriteLock()
    try {
      const currentProfile = this.profiles.get(userId) || {}
      const updatedProfile = { ...currentProfile, ...newData }
      this.profiles.set(userId, updatedProfile)
      return updatedProfile
    } finally {
      await this.lock.releaseWriteLock()
    }
  }
}

// Using it in an API
const userService = new UserProfileService()

// Multiple users can read profiles at the same time
async function handleMultipleReads() {
  const [profile1, profile2] = await Promise.all([userService.getProfile('user1'), userService.getProfile('user2')])
}

// But updates happen one at a time
async function handleUpdates() {
  await userService.updateProfile('user1', { name: 'John' })
  await userService.updateProfile('user1', { age: 30 })
}

handleMultipleReads()
handleUpdates()
