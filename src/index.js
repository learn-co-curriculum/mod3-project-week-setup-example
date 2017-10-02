$(document).ready(() => {
  fetch('http://localhost:3000/notes')
    .then(res => res.json())
    .then(json => {
      json.forEach(note => {
        $('#notes-list').append(new Note(note).renderListItem());
      });
    });
});
