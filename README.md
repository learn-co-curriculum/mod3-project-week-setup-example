# JavaScript Rails API Project Setup
---
![rube goldberg](https://media.giphy.com/media/Lpi4ytAmEDF1m/giphy.gif)

You will be building a Ruby on Rails backend and JavaScript frontend project this week. Two applications talking to each other means there will be a lot of moving parts! This document will walk you through setting up your project. The instructions and requirements for this assignment can be found [here](https://github.com/learn-co-curriculum/js-final-project-guidelines)

We are going to need two separate repositories. This guide has everything in one repo for simplicity but your JS should be in one repo and your API in another.

## Setting Up the Backend Rails API

Remember that when you create a new Rails application with `rails new <your_app>`, by default Rails will provide you with a ton of stuff we will not need to build an API. Think of the entire ActionView library (all the view helper methods like `form_for`), ERB, the way sessions and cookies are handled, etc.

[Rails provides a way](http://edgeguides.rubyonrails.org/api_app.html) to set up a project that will not have all that by default and will also include some of the common tools needed for APIs. What you'll type is `rails new <your_app> --api`  

### Instructions

  + In your terminal enter the following command:

  ```
  rails new <my_app_name> --database=postgresql --api
  ```

  *(Replace `<my_app_name>` with the actual name of your project)*

  + This will generate a new rails project using postgres as the database. **Make sure you are running postgres on your computer**. Look for the elephant icon at the top of your screen. We'll want to use postgres in case you want to push this application to production on heroku.

  + We specify the `--api` flag so rails knows to set this up as an API.

  + `cd` into the new project folder you just created

+ Navigate to your gemfile and uncomment `gem 'rack-cors'` This will allow us to setup Cross Origin Resource Sharing (CORS) in our API. You can read more about CORS [here](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing).

  + Basically, CORS is a security feature that prevents API calls from unknown origins. For example, if someone tried to use some malicious JavaScript to steal your bank information and your bank allowed API calls from anywhere, this could be a bad news bears situation.


+ Make sure you add the `gem 'active_model_serializers'` to your gemfile. Read [this](https://en.wikipedia.org/wiki/Serialization) if you're curious about serialization. Essentially, we need to convert our data into a format that can be easily transferred across a network and reconstructed later. Remember, our frontend and backend live in different repositories and therefore have to make requests across the *interwebs*.

+ Run `bundle install` or just `bundle` if you feel fancy and like shortcuts

+ Inside of `config/initializers/cors.rb` uncomment the following code:

  ```
  Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
      origins '*'

      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head]
    end
  end

  ```

  (This snippet is from the [documentation for the rack-cors gem](https://github.com/cyu/rack-cors))

  Inside the `allow` block, `origins '*'` means we are allowing requests from **all** origins and are allowing `[:get, :post, :patch, :delete]` requests to the API. Read [this](https://www.w3schools.com/tags/ref_httpmethods.asp) if you need a refresher on HTTP methods.

  This may come as a shock but `config.api_only = true` tells our app that it is going to be an **API only**. In other words, our API **will not generate any HTML** and instead will return JSON. The frontend is responsible for taking that JSON, formatting the data, and generating HTML to show to the user.

  For now, we will leave the origins open. Later on, we can change this to only allow requests from the address of the frontend repo––localhost:8000 for example.

### Routes & Controller

Imagine we are building out a note sharing application like Evernote.

Since, eventually, our frontend application might be hosted on a specific domain i.e. `http://alwaysnote.com`, we will want all of our backend routes to be *namespaced* to indicate they are routes associated with the API.

An example route might look like `http://alwaysnoteapi.com/api/v1/notes`

### Example Controller

We'll have a `NotesController` with normal CRUD functionality. But remember we need namespaced routes, and in Rails the file structure and file names of the application are very closely tied to the implementation.

Run:
```
rails g controller api/v1/Notes
```
Notice that the controller file this created lives in `/app/controllers/api/v1/notes_controller.rb` and the actual class name of the controller is namespaced like `Api::V1::NotesController` as well.


**Note on API Versioning:**
*This is the first version of our API. Therefore, the controller should go inside api/v1. If anyone is relying on our API and we update the code in a way that would break other people's projects, it's good practice to make that update its own version of the API. Read [this](https://chriskottom.com/blog/2017/04/versioning-a-rails-api/) if you're curious about API versioning.*

Add our index and create methods to `/app/controllers/api/v1/notes_controller`:

```
class Api::V1::NotesController < ApplicationController

  def index
    @notes = Note.all
    render json: @notes
  end

  def create
    @note = Note.create(note_params)
    render json: @note
  end

  private
  def note_params
    params.permit(:content)
  end

end

```
A few things are happening in the above methods:
1. We're rendering all notes in the form of JSON
2. We're creating a new note based on whatever note_params we get from our *frontend*
3. We're setting out `note_params` to permit a parameter named `content` *that must be included in the body of the POST request we will be making with JS `fetch`*

### Example Routes

The routes we define in `config/routes.rb` need to correspond to the namespaced controller we created. They should be defined as follows:

```
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :notes, only: [:index, :create]
    end
  end
end
```

### Test Out your Application

Your API now has two working *endpoints*, or routes that it exposes to the public. To see all the notes, for example, we could navigate to `http://localhost:3000/api/v1/notes`

At this point it is probably a good idea to add some seed data and make sure everything is properly wired up.

**Major 🔑 alert:** Having the [JSON Viewer](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh?hl=en-US) Chrome extension installed. This will make JSON data *much* easier to read.


---

# Setting Up the Frontend Client Application
![Wild West](http://chrisenss.com/wp-content/uploads/2016/10/wildwest.png)

Coming from Module 2 , you may be used to a framework such as Ruby on Rails being very *opinionated*. That is, it has a lot of opinions about how your application should be structured.  The same rules don't apply on the frontend, there is *not one right way to structure your code*. Specifically, we are not using any frontend framwork and many of the design decisions will be left up to you.

Here, we'll walk through one feature and provide some example code. The example code will be a reasonable/sensible way to structure this application. You should learn what you can from it and structure your code in a similar pattern.  

The key word here is *similar*, rather than directly copying the patterns shown apply the principles you have learned (oo, single responsibility principle, encapsulation) to make code that will be easy for you and your partner to work with as your application grows.

### Inital Setup

Make sure you create **a separate directory and a separate GitHub repository for the frontend,**

Tip: you can open up a new tab in terminal window `command + t` if you'd like to have your rails server up and running in another tab

In the new folder you create you should touch a file called `index.html` and create a folder called `src` in which you will add your JavaScript files. At minimum you should have a file called `index.js` inside of the `src` folder.

In `index.html`, you need to add some HTML. Text editors will often have a shortcut for creating a blank HTML document. In Atom you can begin typing "doc" and then press tab to auto-generate the starter HTML.

### Example Feature (Fetching Notes)

TODO: pick up here



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

Make sure you read through the code and understand what's going on here before moving on. The notesAdapter component is responsible for communicating with our API backend.

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
    this.initBindingsAndEventListeners()
    this.adapter = new NotesAdapter()
    this.fetchAndLoadNotes()
  }

  initBindingsAndEventListeners() {
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
      .catch( (error) => console.log(error) )
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

a {
    color:#97659;
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

+ **Make sure you're still running your rails server** and open up `index.html` and marvel at our work! Our seed data is loaded from the API and we are able to submit new comments and watch as they appear on the page. NOICE!

![alt text](https://media.giphy.com/media/RDbZGZ3O0UmL6/giphy.gif "DJ Khalid with a comically large bottle of champagne in his pool")
