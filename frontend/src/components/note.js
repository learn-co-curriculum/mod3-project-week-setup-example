class Note {
  constructor(body) {
    this.body = body
  }

  render() {
    return `<li class='note'>${this.body} </li>`
  }
}
