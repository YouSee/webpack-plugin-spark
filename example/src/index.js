px.import('px:scene.1.js').then(scene => {
  scene.create({
    t: 'text',
    parent: scene.root,
    text: 'Hello World!',
    textColor: 'green',
    pixelSize: 40,
  })

  scene.on('onClose', () => console.log('Hello got OnClose'))
})
