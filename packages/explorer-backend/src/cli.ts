import Worker from './worker'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))
console.debug('flags:', argv)

function main () {
  const worker = new Worker({
    transfers: argv.transfers,
    days: argv.days,
    offsetDays: argv.offsetDays
  })

  worker.start().catch((err) => {
    console.error('error:', err)
    console.log('exiting...')
    process.exit(1)
  })
}

main()
