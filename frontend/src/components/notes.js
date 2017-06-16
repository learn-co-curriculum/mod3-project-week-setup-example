class Notes {
  constructor() {
    this.notesForm = document.getElementById('new-note-form')
    this.noteInput = document.getElementById('new-note-body')
    this.notesNode = document.getElementById('notes-container')
    this.adapter = new NotesAdapter()
    this.notesIndex()
    this.notesForm.addEventListener('submit',this.addNote.bind(this))
  }

  notesIndex() {
    this.notes = []
    this.adapter.loadAllNotesInto(this.notes)
    .then( () => this.notesNode.innerHTML = this.render() )
  }

  addNote() {
    event.preventDefault()
    let body = this.noteInput.value
    this.adapter.createNote(body)
    .then( (noteJSON) => this.notes.push(new Note(noteJSON)) )
    .then( () => this.notesIndex() )
    .then( () => this.noteInput.value = '' )
  }

  notesHTML() {
    return this.notes.map( note => note.render() ).join('')
  }

  render() {
    return `<ul>${this.notesHTML()}</ul>`
  }
}
