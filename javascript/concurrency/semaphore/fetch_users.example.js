// @ts-check

const Semaphore = require('.')

const apiSemaphore = new Semaphore(3)

async function fetchUserData(userId) {
  try {
    await apiSemaphore.acquire()

    console.log(`Starting API call for user ${userId}`)
    const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`)
    const data = await response.json()

    return data
  } finally {
    apiSemaphore.release()
    console.log(`Completed API call for user ${userId}`)
  }
}

async function fetchMultipleUsers() {
  const userIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  // This will only allow 3 API calls at a time
  const promises = userIds.map((id) => fetchUserData(id))
  const results = await Promise.all(promises)

  console.log('All users fetched!')
  return results
}

fetchMultipleUsers()
