window.addEventListener('message', function (event) {
  var data = event.data

  if (data.hasOwnProperty('type')) {
    var type = data.type
    var drawable = data.value
    var max = data.max
    const text = this.document.getElementById('text')

    text.innerHTML = `${drawable}/${max} ${type}`
  }
  if (data.hasOwnProperty('start')) {
    const text = this.document.getElementById('text')
    const container = this.document.getElementById('container')
    text.innerHTML = 'Loading up ...'
    container.style.display = 'block'
  }
  if (data.hasOwnProperty('end')) {
    const text = this.document.getElementById('text')
    const container = this.document.getElementById('container')
    text.innerHTML = 'Finished!'
    this.setTimeout(() => {
      container.style.display = 'none'
    }, 2000)
  }
  if (data.hasOwnProperty('error')) {
    var type = data.error
    const text = this.document.getElementById('text')
    const container = this.document.getElementById('container')

    if (type == 'weathersync') {
      text.innerHTML = 'Disable weathersync resource!'
      this.setTimeout(() => {
        container.style.display = 'none'
      }, 2000)
    } else {
      text.innerHTML = 'Error!'
      this.setTimeout(() => {
        container.style.display = 'none'
      }, 2000)
    }
  }
})
