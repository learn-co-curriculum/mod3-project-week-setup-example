class Note {
  constructor(noteJSON) {
    this.body = noteJSON.body
    this.id = noteJSON.id
  }

  render() {
    return `<li data-noteid='${this.id}' data-props='${JSON.stringify(this)}' class='note-element'>${this.body} <i data-action='delete-note' class="em em-scream_cat"></i></li>`
  }
}
