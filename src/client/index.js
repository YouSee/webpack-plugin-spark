/*
  Spark UI Hot reloading client
  This client is updating and refreshing UI based on websocket communication
  NOTE: px.import is specific for the Spark Browser
  https://www.sparkui.org/
*/
/* eslint-disable no-console */
/* eslint-disable import/prefer-default-export */

// Global
let GlobalScene = null
let GlobalProgressScene = null
let WebpackCompilationHash = null

const clientResponseTypes = {
  progressEvent: 'progressEvent',
  liveReloadEvent: 'liveReloadEvent',
  failedEvent: 'FailedEvent',
}

const disposeCurrentSceneAndReload = (scene, data) => {
  if (!GlobalScene) return
  if (GlobalProgressScene) {
    GlobalProgressScene.dispose()
    GlobalProgressScene = null
  }
  GlobalScene.dispose()
  WebpackCompilationHash = data.hash
  GlobalScene = scene.create({
    t: 'scene',
    parent: scene.root,
    url: 'http://localhost:55555/bundle.js',
  })
}

const updateProgressInfomation = (scene, progress, hash) => {
  // Don't draw progress if build already rendered
  if (WebpackCompilationHash === hash) return
  const infoText = `Webpack build: ${progress}%`
  if (GlobalProgressScene) {
    GlobalProgressScene.text = infoText
  } else {
    GlobalProgressScene = scene.create({
      t: 'text',
      parent: scene.root,
      text: infoText,
      textColor: 0xff0000ff,
      pixelSize: 40,
    })
  }
}

const handleServerResponse = (scene, data) => {
  const jsonResponse = data && JSON.parse(data)
  if (!jsonResponse && !jsonResponse.eventType) return null
  console.log(`received event type: ${jsonResponse.eventType}`)
  console.log(`received hash: ${jsonResponse.hash}`)
  switch (jsonResponse.eventType) {
    case clientResponseTypes.liveReloadEvent:
      return disposeCurrentSceneAndReload(scene, jsonResponse)
    case clientResponseTypes.progressEvent:
      return updateProgressInfomation(
        scene,
        jsonResponse.progress,
        jsonResponse.hash,
      )
    default:
      return null
  }
}

px.import({ scene: 'px:scene.1.js', ws: 'ws' }) // eslint-disable-line no-undef
  .then(imports => {
    const { ws: Websocket, scene } = imports

    let websocket = null

    GlobalScene = scene.create({
      t: 'scene',
      parent: scene.root,
      url: 'http://localhost:55555/bundle.js',
    })
    GlobalScene.focus = true

    // Websocket initializer
    const startWebSocket = () => {
      websocket = new Websocket('ws://localhost:33333')

      // Handle websocket messages from server
      websocket.on('message', data => handleServerResponse(scene, data))

      websocket.on('error', () => console.log('Connection error'))
    }

    const checkSocketConnection = () =>
      (!websocket || websocket.readyState === 3) && startWebSocket()

    // Start websocket
    startWebSocket()

    // Check connection every 5 seconds
    setInterval(checkSocketConnection, 5000)
  })
  .catch(err => console.error(`Imports failed for hotreload client: ${err}`))
