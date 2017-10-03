class App {
  constructor() {
    this.adapter = new Adapter();

    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.createNotes = this.createNotes.bind(this);
    this.addNotes = this.addNotes.bind(this);
  }

  attachEventListeners() {
    $('#notes-list').on('click', 'button', this.handleEditClick);
    $('#update').on('submit', 'form', this.handleFormSubmit);
  }

  createNotes(notes) {
    notes.forEach(note => {
      new Note(note);
    });
    console.log(this);
    this.addNotes();
  }

  addNotes() {
    $('#notes-list').empty();
    Note.all.forEach(note => $('#notes-list').append(note.renderListItem()));
  }

  handleFormSubmit(e) {
    e.preventDefault();
    const id = e.target.dataset.id;
    const note = Note.findById(id);
    const title = $(e.target)
      .find('input')
      .val();
    const content = $(e.target)
      .find('textarea')
      .val();

    const bodyJSON = { title, content };
    this.adapter.updateNote(note.id, bodyJSON).then(updatedNote => {
      const note = Note.findById(updatedNote.id);
      note.update(updatedNote);
      this.addNotes();
    });
  }

  handleEditClick(e) {
    const id = e.target.dataset.id;
    const note = Note.findById(id);
    $('#update').html(note.renderUpdateForm());
  }
}
