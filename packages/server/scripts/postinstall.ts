import { exec } from 'child_process'

// Deploying migrations
if (process.env.NODE_ENV === 'production') {
  exec('yarn prisma migrate deploy', (error, stdout, stderr) => {
    if (error) console.error(error)
    if (stdout) console.log(stdout)
    if (stderr) console.log(stderr)
  })
}
