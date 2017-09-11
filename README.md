# JavaScript Rails API Project Setup
---
You will be building a rails backed and JS frontend project this week. This document will walk you through setting up your project. The instructions and requirements for this assignment can be found [here](https://github.com/learn-co-curriculum/js-final-project-guidelines)

We are going to need two separate repositories. This guide has everything in one repo for simplicity but your JS should be in one repo and your API in another.

# Setting Up the Rails API
---
+ We are going to generate a new rails **API** project.

  + In your terminal enter the following command:

  + `rails new MY-NEW-PROJECT-NAME --database=postgresql --api`

  + **Replace MY-NEW-PROJECT-NAME with the *actual* name of your project**

  + This will generate a new rails project using postgres as the database. **Make sure you are running postgres on your computer**. Look for the elephant icon at the top of your screen.

  + We specify the `--api` flag so rails knows to set this up as an API.
  
  + `cd` into the new project folder you just created

+ Navigate to your gemfile and uncomment `gem 'rack-cors'` This will allow us to setup Cross Origin Resource Sharing (CORS) in our API. You can read more about CORS [here](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

  + Basically, CORS is a security feature that prevents API calls from unknown origins. For example, if someone tried to use some malicious JavaScript to steal your bank information and your bank allowed API calls from anywhere, this could be a bad news bears situation.

+ Make sure you add the `gem 'active_model_serializers'` to your gemfile. Read [this](https://en.wikipedia.org/wiki/Serialization) if you're curious about serialization. Essentially, we need to convert our data into a format that can be easily transferred across a network and reconstructed later. Remember, our frontend and backend live in different repositories and therefore have to make requests across the *interwebs*.

+ Run `bundle install` or just `bundle` if you feel fancy and like shortcuts

---

+ Inside of `config/application.rb` **type** the following code:

```
module JsProjectWeekSetup
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 5.1

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*', :headers => :any, :methods => [:get, :post, :patch, :delete, :options]
      end
    end
    config.api_only = true
  end
end
```

This snippet is from the [documentation for the rack-cors gem](https://github.com/cyu/rack-cors)

**The name after `module` should be whatever you named your project**

Inside the `allow` block, `origins '*'` means we are allowing requests from **all** origins and are allowing `[:get, :post, :patch, :delete]` requests to the API. Read [this](https://www.w3schools.com/tags/ref_httpmethods.asp) if you need a refresher on HTTP methods.

As you may recall from the [JS fetch() documentation](https://github.github.io/fetch/), options refer to the body of our AJAX call.

This may come as a shock but `config.api_only = true` tells our app that it is going to be an **API only**. In other words, our API **will not generate any HTML** and instead will return JSON. The frontend is responsible for taking that JSON, formatting the data, and generating HTML to show to the user.

For now, we will leave the origins open. Later on, we can change this to only allow requests from the address of the frontend repo––localhost:8000 for example.

---

+ Next we are going to create our Notes controller: `rails g controller api/v1/Notes`
We need to make sure the controllers are namespaced properly. This is the first version of our API. Therefore, the controller should go inside api/v1. If anyone is relying on our API and we update the code in a way that would break other people's projects, it's good practice to make that update its own version of the API. Read [this](https://chriskottom.com/blog/2017/04/versioning-a-rails-api/) if you're curious about API versioning.

Add our index and create methods to `/app/controllers/api/v1/notes_controller`:

```
class Api::V1::NotesController < ApplicationController

  def index
    @notes = Note.all
    render json: @notes, status: 200
  end

  def create
    @note = Note.create(note_params)
    render json: @note, status: 201
  end

  private
  def note_params
    params.permit(:body)
  end

end

```
A few things are happening in the above methods:
1. we're rendering all notes in the form of JSON an sending back an HTTP status code of 200
2. We're creating a new note based on whatever note_params we get from our *frontend*
3. We're setting out note_params to permit the `body` of our post request; recall that JS `fetch()` requests include a body

---

+ Next let's setup our model: `rails g model Notes body:string`

---

In `db/migrate` add this to `db/seeds.rb`:

```
Note.create([
  { body: 'The frontend (Vanilla JS) and backend (Rails API) will reside in two separate repos'},
  { body: 'Install and configure Postgresql <a target="_blank" href="https://postgresapp.com/">Postgresapp</a>.' },
  { body: 'Remember to use "--database=postgresql" when generating your Rails application to use Postgresql vs SqlLite.' },
  { body: 'Create your Rails application as an <a target="_blank" href="http://guides.rubyonrails.org/api_app.html">API</a>.' },
  { body: 'Add support for <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS">cross-origin resource sharing</a>, using <a target="_blank" href=" https://github.com/cyu/rack-cors">rack-cors</a>. See this <a target="_blank" href="https://github.com/learn-co-curriculum/js-project-week-setup/commit/8272dbfcde33503adbb22bb0dbc731233527fad6">commit</a> as a reference.' },
  { body: 'Design your data model and define the structure of your JSON data.' },
  { body: 'Remember to namespace your <a target="_blank" href="http://guides.rubyonrails.org/routing.html#controller-namespaces-and-routing">routes and controllers</a>.' },
  { body: 'Learn <a href="https://chriskottom.com/blog/2017/04/versioning-a-rails-api"/>why</a> version an API'},
  { body: 'When lost take a walk, then bifriend <a target="_blank" href="https://developer.mozilla.org/en-US/">MDN</a> and <a target="_blank" href="http://api.rubyonrails.org/">api.rubyonrails.org</a>.' }
  ])
```

+ Run `rails db:create`

+ Run `rails db:migrate`

+ Run `rails db:seed`

---

+ Next we'll need to setup our routes. Inside of `config/routes.rb`:
```
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :notes, only: [:index, :create]
    end
  end
end

```

The namespacing means our api can be accessed by navigating to `http://localhost:3000/api/v1/notes`

+ Let's verify that everything worked by running `rails s` and navigating to [http://localhost:3000/api/v1/notes](http://localhost:3000/api/v1/notes). You should see JSON in your browser.

**Major 🔑 alert:** make sure you have the [JSON Viewer](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh?hl=en-US) Chrome extension installed. This will make JSON data *much* easier to read.


If that worked, then congratulations!! Now it's time to setup the frontend.

# Setting Up the Frontend

Make sure you create **a separate directory and a separate GitHub repository for the frontend**

Once there, `cd` into that directory and we'll start building out the frontend

+ Let's create the files and folders we'll need:

  + `mkdir bin src styles`

  + `touch index.html`

+ Verify everything worked by running `ls` You should see `bin src styles and index.html` at the root directory of your frontend project

---

+ Add the following to `index.html`

```
<!DOCTYPE html>
<html>
  <head>
    <title>Sample JS Project frontend</title>
    <link href="https://afeld.github.io/emoji-css/emoji.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="styles/style.css">
    <style>
      a {
        color:#97659;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div id="new-note-container">
        <form id="new-note-form">
          <input type="text" name="note-body" id="new-note-body">
          <input type="submit" value="Save note">
        </form>
      </div>
      <div id="notes-container">

      </div>
    </div>

    <script type="text/javascript" src="src/components/note.js"></script>
    <script type="text/javascript" src="src/adapters/notesAdapter.js"></script>
    <script type="text/javascript" src="src/components/notes.js"></script>
    <script type="text/javascript" src="src/components/app.js"></script>
    <script type="text/javascript" src="src/index.js"></script>
  </body>
</html>
```
Notice that we have a form to create a new note as well as a `notes-container` div. Our notes will be rendered inside this div. We're also loading several JS files: `note.js`, `notesAdapter.js`, `notes.js`, `app.js`, `index.js`

---

+ `cd` into src then

  + `touch index.js`

  + `mkdir adapters components`

+ Add the following line to `index.js`: `const app = new App()` Our index file has one responsibility: kicking off the app by creating a new App object

---

+ `cd` into `adapters` and `touch notesAdapter.js`. We will build out the `notesAdapter` in this file. The adapter will be responsible for communicating with our rails API backend

Your notes adapter should look like this:
```
class NotesAdapter {
  constructor() {
    this.baseUrl = 'http://localhost:3000/api/v1/notes'
  }

  getNotes() {
    return fetch(this.baseUrl).then(response => response.json())
  }

  deleteNote(noteId) {
    const deleteUrl = `${this.baseUrl}/${noteId}`
    const noteDeleteParams = {
      method: 'DELETE',
      headers: {
        'Content-Type':'application/json'
      }
    }
    return fetch(deleteUrl, noteDeleteParams).then(response => response.json())
  }

  createNote(body) {
    const noteCreateParams = {
      method: 'POST',
      headers: {
        'Content-Type':'application/json'
      },
      body: JSON.stringify({body})
    }
    return fetch(this.baseUrl, noteCreateParams).then(resp => resp.json())
  }

}

```

---

+ `cd..` up on level and then `cd` down into `components` and let's make three files:
  + `touch app.js note.js notes.js`

---

+ `app.js` should look like this:

```
class App {
  constructor() {
    this.notes = new Notes()
  }
}
```

Let's review the flow of the app: `index.js` gets loaded and calls `new App()` which will run the App constructor function defined above, which will set a property on that newly created app called notes that points to a new instance of our `Notes` object. If that was confusing, stop, re-read it and walk through the app so far until the flow makes sense. Managing all the different files and the game of catch we're playing with them is key to understanding how this project works.

---

+  Add the following to `notes.js`:

```
class Notes {
  constructor() {
    this.notes = []
    this.initBindingsAndEventListiners()
    this.adapter = new NotesAdapter()
    this.fetchAndLoadNotes()
  }

  initBindingsAndEventListiners() {
    this.notesForm = document.getElementById('new-note-form')
    this.noteInput = document.getElementById('new-note-body')
    this.notesNode = document.getElementById('notes-container')
    this.notesForm.addEventListener('submit',this.handleAddNote.bind(this))
    this.notesNode.addEventListener('click',this.handleDeleteNote.bind(this))
  }

  fetchAndLoadNotes() {
    this.adapter.getNotes()
    .then( notesJSON => notesJSON.forEach( note => this.notes.push( new Note(note) )))
      .then( this.render.bind(this) )
      .catch( () => alert('The server does not appear to be running') )
  }

  handleAddNote() {
    event.preventDefault()
    const body = this.noteInput.value
    this.adapter.createNote(body)
    .then( (noteJSON) => this.notes.push(new Note(noteJSON)) )
    .then(  this.render.bind(this) )
    .then( () => this.noteInput.value = '' )
  }

  handleDeleteNote() {
    if (event.target.dataset.action === 'delete-note' && event.target.parentElement.classList.contains("note-element")) {
      const noteId = event.target.parentElement.dataset.noteid
      this.adapter.deleteNote(noteId)
      .then( resp => this.removeDeletedNote(resp) )
    }
  }

  removeDeletedNote(deleteResponse) {
    this.notes = this.notes.filter( note => note.id !== deleteResponse.noteId )
    this.render()
  }

  notesHTML() {
    return this.notes.map( note => note.render() ).join('')
  }

  render() {
    this.notesNode.innerHTML = `<ul>${this.notesHTML()}</ul>`
  }
}
```

---

+ Next let's build out the `Note` class/object in `note.js`:
```
class Note {
  constructor(noteJSON) {
    this.body = noteJSON.body
    this.id = noteJSON.id
  }

  render() {
    return `<li data-noteid='${this.id}' data-props='${JSON.stringify(this)}' class='note-element'>${this.body} <i data-action='delete-note' class="em em-scream_cat"></i></li>`
  }
}
```

---

+ Finally, let's add a little bit of styling. `cd` back up to the root directory of this project and then into `/styles` and let's `touch style.css` and add the following:
```
body {
   font-family: "HelveticaNeue-Light", "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
   font-weight: 300;
   line-height: 1.6em;
   font-size: 1.3em;
}

input {
  font-size: 1.5em;
}

.container {
  width: 960px;
  margin:auto;
  margin-top:50px;
}

ul {
  padding-left: 20px;
}

.delete-note-link {
  color:red;
}
```
# Last Step

+ Open up `index.html` and marvel at our work! Our seed data is loaded from the API and we are able to submit new comments and watch as they appear on the page. NOICE!

![alt text](https://media.giphy.com/media/RDbZGZ3O0UmL6/giphy.gif "DJ Khalid with a comically large bottle of champagne in his pool")
