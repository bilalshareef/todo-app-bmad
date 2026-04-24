import { createApp } from './app.js'

const PORT = parseInt(process.env.PORT || '3001', 10)

const app = createApp()

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err)
    process.exit(1)
  }
  app.log.info(`Server listening at ${address}`)
})
