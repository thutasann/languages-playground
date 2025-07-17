// @ts-check

const Mutex = require('./mutex')
const fs = require('fs')

const fileMutex = new Mutex()

async function writeToLog(message) {
  // Using withLock ensures we always release the lock
  await fileMutex.withLock(async () => {
    // Only one write operation can happen at a time
    fs.appendFile('app.log', message + '\n', () => {})
    console.log('Wrote to log:', message)
  })
}

async function runExample() {
  await Promise.all([writeToLog('First message'), writeToLog('Second message'), writeToLog('Third message')])
}

runExample()
