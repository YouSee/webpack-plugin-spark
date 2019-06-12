import path from 'path'

import express from 'express'
import WebSocket from 'ws'

const start = async function start() {
  if (this.listening) {
    return
  }

  const { app } = this
  const emitter = this

  // Setup websocket server
  this.wss = new WebSocket.Server({ port: this.options.wsPort })

  // Serve optional static files
  if (this.options.static) {
    app.use(express.static(this.options.static))
  }

  // Setup live reload
  if (this.options.liveReload) {
    app.use('*', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript')
      res.sendFile(path.join(__dirname, './client/index.js'))
    })
  }

  app.listen(this.options.port, () => {
    emitter.emit('listening', app)
  })

  this.listening = true

  // Send info to connected clients method
  const sendInfoToClients = data =>
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data))
      }
    })

  // Webpack events
  this.on('done', () => {
    // Build is done - tell the clients reload if needed
    if (this.options.liveReload) {
      sendInfoToClients({
        eventType: 'liveReloadEvent',
        hash: this.lastHash,
      })
    }
  })

  this.on('invalid', () => {
    if (this.options.progress) {
      // Send Progress event message
      sendInfoToClients({
        eventType: 'progressEvent',
        progress: 0,
        hash: '',
      })
    }
  })

  this.on('progress', data => {
    if (this.options.progress) {
      // Send Progress event message
      sendInfoToClients({
        eventType: 'progressEvent',
        progress: data.percent * 100,
        hash: this.lastHash,
      })
    }
  })

  this.on('failed', () => console.log('COMPILE FAILED!!'))
}

export default start
