class Notes {
  constructor() {
    this.notesBindings()
    this.adapter = new NotesAdapter()
    this.fetchAndLoadNotes()
  }

  notesBindings() {
    this.notesForm = document.getElementById('new-note-form')
    this.noteInput = document.getElementById('new-note-body')
    this.notesNode = document.getElementById('notes-container')
    this.notesForm.addEventListener('submit',this.handleAddNote.bind(this))
    this.notesNode.addEventListener('click',this.handleDeleteNote.bind(this))
  }

  fetchAndLoadNotes() {
    this.notes = []
    this.adapter.loadAllNotesInto(this.notes)
    .then( this.render.bind(this) )
  }

  handleAddNote() {
    event.preventDefault()
    let body = this.noteInput.value
    this.adapter.createNote(body)
    .then( (noteJSON) => this.notes.push(new Note(noteJSON)) )
    .then(  this.render.bind(this) )
    .then( () => this.noteInput.value = '' )
  }

  handleDeleteNote() {
    if (event.target.parentElement.classList.contains("note-element")) {
      const noteId = event.target.parentElement.dataset.noteid
      this.adapter.deleteNote(noteId)
      .then( resp => this.removeDeletedNote(resp) )
    }
  }

  removeDeletedNote(deleteResponse) {
    const nodeObjToRemove = this.notes.filter( note => note.id === deleteResponse.noteId )
    const indexOfNoteToRemove = this.notes.indexOf( nodeObjToRemove[0] )
    this.notes.splice(indexOfNoteToRemove,1)
    this.render()
    return deleteResponse
  }

  notesHTML() {
    return this.notes.map( note => note.render() ).join('')
  }

  render() {
    this.notesNode.innerHTML = `<ul>${this.notesHTML()}</ul>`
  }
}
