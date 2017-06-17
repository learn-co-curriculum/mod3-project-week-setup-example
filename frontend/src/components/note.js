class Note {
  constructor(noteJSON) {
    this.body = noteJSON.body
    this.id = noteJSON.id
  }

  render() {
    return `<li data-noteid='${this.id}' data-props='${JSON.stringify(this)}' class='note-element'>${this.body} <span class="delete-note-link">x</span></li>`
  }
}
