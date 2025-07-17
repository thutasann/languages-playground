// @ts-check

const DeadlockDetector = require('.')

class DatabaseOperations {
  constructor() {
    this.deadlockDetector = new DeadlockDetector()
  }

  async transferMoney(fromAccount, toAccount, amount) {
    const transactionId = `transaction_${Date.now()}`

    try {
      // Try to lock first account
      await this.deadlockDetector.registerResource(fromAccount, transactionId)
      console.log(`Locked account ${fromAccount}`)

      // Try to lock second account
      await this.deadlockDetector.registerResource(toAccount, transactionId)
      console.log(`Locked account ${toAccount}`)

      // If we get here, we have both locks and no deadlock was detected
      console.log(`Transferring ${amount} from ${fromAccount} to ${toAccount}`)

      // Do the transfer...
    } finally {
      // Release both accounts
      await this.deadlockDetector.releaseResource(fromAccount, transactionId)
      await this.deadlockDetector.releaseResource(toAccount, transactionId)
      console.log('Released all locks')
    }
  }
}

const dbOps = new DatabaseOperations()

// This could create a deadlock if run simultaneously
async function runTransfers() {
  try {
    await Promise.all([
      dbOps.transferMoney('account1', 'account2', 100),
      dbOps.transferMoney('account2', 'account1', 50), // This will fail with deadlock
    ])
  } catch (error) {
    console.log('Detected potential deadlock:', error.message)
  }
}

runTransfers()
