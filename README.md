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

  This may come as a shock but `config.api_only = true` tells our app that it is going to be an **API only**. In other words, our API **will not generate any HTML** and instead will return JSON. The frontend is responsible for taking that JSON, formatting the data, and generating HTML to show to the user. Read [this](https://www.w3schools.com/js/js_json_intro.asp) if you want to review what JSON is and why we use it.

  For now, we will leave the origins open. Later on, we can change this to only allow requests from the address of the frontend repo––localhost:8000 for example.

### Routes & Controller

Imagine we are building out a note sharing application like Evernote.

Since, eventually, our frontend application might be hosted on a specific domain i.e. `http://alwaysnote.com`, we will want all of our backend routes to be *namespaced* to indicate they are routes associated with the API.

An example route might look like `http://<your-domain>.com/api/v1/notes`

You may remember [nested resources in rails](http://guides.rubyonrails.org/routing.html#nested-resources) from Module 2.

### Example Controller

We'll have a `NotesController` with normal CRUD functionality. But remember we need namespaced routes, and in Rails the file structure and file names of the application are very closely tied to the implementation.

Run:
```
rails g controller api/v1/Notes
```
Notice that the controller file this created lives in `/app/controllers/api/v1/notes_controller.rb` and the actual class name of the controller is namespaced like `Api::V1::NotesController` as well.


**Note on API Versioning:**
*This is the first version of our API. Therefore, the controller should go inside api/v1. If anyone is relying on our API and we update the code in a way that would break other people's projects, it's good practice to make that update its own version of the API. Read [this](https://chriskottom.com/blog/2017/04/versioning-a-rails-api/) if you're curious about API versioning.*

We'll only be dealing with the index and update actions for this example `/app/controllers/api/v1/notes_controller`:

```ruby
class Api::V1::NotesController < ApplicationController

  def index
    @notes = Note.all
    render json: @notes
  end

  def update
    @note = Note.find(params[:id])

    @note.update(note_params)
    if @note.save
      render json: @note
    else
      render json: {errors: @note.errors.full_messages}, status: 422
    end
  end

  private
  def note_params
    params.permit(:title, :content)
  end

end

```
A few things are happening in the above methods:
1. We're rendering all notes in the form of JSON
2. We're creating a new note based on whatever note_params we get from our *frontend*
3. We're setting out `note_params` to permit a parameter named `title` and a parameter named `content`. *These must be included in the body of the POST or PATCH requests we will be making with JS `fetch`*

### Example Routes

The routes we define in `config/routes.rb` need to correspond to the namespaced controller we created. They should be defined as follows:

```ruby
Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :notes, only: [:index, :update]
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
# Code Along
![Wild West](http://chrisenss.com/wp-content/uploads/2016/10/wildwest.png)

Coming from Module 2 , you may be used to a framework such as Ruby on Rails being very *opinionated*. That is, it has a lot of opinions about how your application should be structured.  The same rules don't apply on the frontend, there is *not one right way to structure your code*. Specifically, we are not using any frontend framwork and many of the design decisions will be left up to you.

Here, we'll walk through one feature and provide some example code. The example code will demonstrate a reasonable/sensible way to structure this application. You should learn what you can from it and structure your code in a similar pattern.  

The key word here is *similar*, rather than directly copying the patterns shown, try to apply the principles you have learned (oo, single responsibility principle, encapsulation) to make code that will be easy for you and your partner to work with as your application grows.

### Initial Setup

Make sure you create **a separate directory and a separate GitHub repository for the frontend,**

Tip: you can open up a new tab in terminal window `command + t` if you'd like to have your rails server up and running in another tab

In the new folder you create you should touch a file called `index.html` and create a folder called `src` in which you will add your JavaScript files. At minimum you should have a file called `index.js` inside of the `src` folder.

In `index.html`, you need to add some HTML. Text editors will often have a shortcut for creating a blank HTML document. In Atom you can begin typing "doc" and then press tab to auto-generate the starter HTML. If you'd like to use jQuery, google for "jQuery cdn" and find the appropriate code to add to your html. We'll be using jQuery here because of it's shorter syntax, but we could have chosen to use vanilla JS.

##### Optional (and very easy) Setup for Code-Along
*If you want to code along with the following steps, this repo contains the appropriate files.  There is not a full Rails backend, but notice there is a `db.json` file. We are using a package called [json-server](https://github.com/typicode/json-server) that provides an easy ('easy', as in under 30 seconds) way to make RESTful JSON APIs for development and testing.*

*Install the package with the command:*
```
npm install -g json-server
```

*Boot up a server with the following command, by default it will run on port 3000*
```
json-server --watch db.json
```

*The package provides you with convential RESTful routes for all CRUD actions.*

### Example Feature (Updating a note)

We want to create the following features:

> As a user, when the page loads I should see a list of notes. Next to the title of each note will be a button to edit that note.

> As a user, when I click the edit button, I will see a form with the values of that note in the input fields. I can make changes, click 'Save Note' and see the changes reflected in the list of notes.

Delivering these features will involve several steps and we will want to be sure **to work iteratively**. We will make it work, and then make it better.

### Step 1: Fetching Notes

It seems like the first step is getting the list of notes to show up on the page. Translating that to more technical langauge, we need to:

1 - on the document ready event, fire off an AJAX fetch request to the index route (i.e GET '/notes')

2 - use the response JSON to append elements to the DOM.

Let's be sure not to overcomplicate our approach, we can (and will) refactor later.  At the same time, we don't want to be debugging the routes in our Rails application trying to figure why our server isn't responding when it turns we forgot to include a script tag linking `src/index.js` in `index.html`.

This may sound silly but step 1 should be:
```javascript
/* src/index.js */
$(document).ready(() => {
  alert('hello')
});
```

Until you see the alert, don't move forward. What would be some reasons you might not see the alert?

Now let's fetch the notes (remember that the route our real backend would be 'http://localhost:3000/api/v1/notes' whereas here we'll make the request to our json-server non-namespaced routes )
```javascript
/* src/index.js */
$(document).ready(() => {
  fetch('http://localhost:3000/notes')
    .then(res => res.json())
    .then(json => console.log(json));
});
```

If you see the notes printed to the console, you're good to move forward.

The next step is getting the Notes added to the DOM. No problem, add an empty div or ul element to index.html and go ahead an add each note title, along with an edit button
```javascript
/* src/index.js */
$(document).ready(() => {
  fetch('http://localhost:3000/notes')
    .then(res => res.json())
    .then(json =>
      json.forEach(note => {
        const markup = `
        <li>
          <h3>${note.title}
            <button>edit</button>
          </h3>
        </li>`;

        $('#notes-list').append(markup);
      })
    );
});
```

There's many ways to do this. Above is not super pretty, but it works.

### Step 2: Refactor

If our only deliverable was to show text on the page our code would be adequate.  There's a real deficiency with our current implementation though.

Think about the next step where a user clicks one of the edit buttons. Given our current implementation how could we a) determine which note got clicked on and b) show more information about that note (the content of the note)?

Please take a moment to think this through and make sure you understand the following before moving forward.

The only way to solve this problem would be to grab the text of the h3 element from the DOM, use that title to query our backend and do something along the lines of...
```ruby
@note = Note.find_by(title: params[:title])
```
in our Rails controller. This should feel really annoying. We *just* had access to this data when we retrieved all the notes, but we effectively threw it away.

This is where we can refactor to use Object Orientation. We can take advantage of the encapsulation provided by objects to store *all* the data about a particular note in one place.

A second annoyance we might notice about our current implementation is that when the edit button is clicked, nothing on the button itself indicates what note the button is for. We have to look at the text of it's parent h3 element. Let's solve this in our refactor as well.

Refactored code:

```javascript
/* create a file note.js */
class Note {
  constructor(data) {
    this.id = data.id;
    this.title = data.title;
    this.content = data.content;
    Note.all.push(this);
  }

  renderListItem() {
    return `
    <li>
      <h3>${this.title}
        <button data-id=${this.id}>edit</button>
      </h3>
    </li>`;
  }
}

Note.all = [];
```
*Note: if you are not familiar with html5 data-attributes [check them out](https://developer.mozilla.org/en-US/docs/Learn/HTML/Howto/Use_data_attributes). We totalllyyyy could have taken the id of the note and added it to the DOM in the button's id or class properties.  But this is exactly what data-attributes are for and should make our lives easier. The important takeaway here is that the data our application logic depends on* **lives in the DOM itself and we must put it there somehow.** *Understading that is more important than how exactly we put that data there*
```javascript
/* src/index.js */
$(document).ready(() => {
  fetch('http://localhost:3000/notes')
    .then(res => res.json())
    .then(json => {
      json.forEach(note => {
        $('#notes-list').append(new Note(note).renderListItem());
      });
    });
});
```

### Step 3: Clicking the 'edit' button & showing a form
Our code above was a true refactoring, we didn't change any functionality, we only changed (& hopefully improved) the implementation details.  

Now let's add the ability to click an edit button and show a filled out form.  As always, when we dealing with handling events we'll want to break this down into a couple steps.

1 - Can we respond to the event at all. First let's just console.log or alert something on a click.

2 - Can we then console.log some data specific to the event. We'll try to console.log the whole note object we're trying to edit.

3 - Only after all that is wired up will we attempt to show a form with the correct values

The first step, though straightforward, involves some decision making-- where should the code that attaches the event listener go?

There is not a right answer here. An argument could be made it is the responsibility of the Note class, something like `Note.addEditListeners()`. The choice we will go with is to make a class called `App` that will be responsible for higher level things like attaching event listeners.

```javascript
/* src/app.js */
class App {

  attachEventListeners() {
    $('#notes-list').on('click', 'button', (e) => {
      console.log('clicked');
    });
  }
}
```
*Note: we won't go into [event delegation](https://learn.jquery.com/events/event-delegation/) in detail here, but because the edit buttons are dynamically added to the page we cannot put the event listeners on them directly. We have to put the listener on a static element, i.e. the parent ul, and delgate the listening down to the children*

```javascript
/* src/index.js */
$(document).ready(() => {
  const app = new App();
  app.attachEventListeners();

  fetch('http://localhost:3000/notes')
    .then(res => res.json())
    .then(json => {
      json.forEach(note => {
        $('#notes-list').append(new Note(note).renderListItem());
      });
    });
});
```

When the page loads we'll create an instance of our App and call the `attachEventListeners` function. If you see 'clicked' in the console move on to the next step.

You are very much encouraged to try to get the next step working on you're own. You need to a) grab the data-id of the clicked button out of the DOM and b) find the associated note instance. Try it on your own, below is an implementation that works.

```javascript
/* src/app.js */
class App {
  constructor() {}

  attachEventListeners() {
    $('#notes-list').on('click', 'button', e => {
      const id = e.target.dataset.id;
      const note = Note.findById(id);
      console.log(note);
    });
  }
}
```
```javascript
/* src/note.js */
class Note {
  // ... prev code

  static findById(id) {
    return this.all.find(note => note.id === id);
  }
}
```

Once we have the note instance the next step is pretty easy. Just as we can call a prototype method `note.renderListItem` on a note instance we'll make a prototype method `note.renderUpdateForm` and attach HTML to the DOM. This is like telling a note object: 'turn yourself into the html for an update form'.

An implementation:
```javascript
/* src/note.js */
class Note {
  // ... prev code

  renderUpdateForm() {
    return `
    <form data-id=${this.id}>
      <label>Title</label>
      <p>
        <input type="text" value="${this.title}" />
      </p>
      <label>Content</label>
      <p>
        <textarea>${this.content}</textarea>
      </p>
      <button type='submit'>Save Note</button>
    </form>
  `;
  }
}
```

```javascript
/* src/app.js */
class App {

  attachEventListeners() {
    $('#notes-list').on('click', 'button', e => {
      const id = e.target.dataset.id;
      const note = Note.findById(id);
      $('#update').html(note.renderUpdateForm());
    });
  }
}
```

### Step 4: Making the PATCH request

When the form is submitted we need to make a PATCH request to our server to update this note record in our database. Like before, we will start with a straightforward approach and refactor.

It seems like we already have a place in our app where we attach event listeners. Let's add our code there. I will skip a few steps here and go straight to the implementation. When you are trying to grab data from the DOM in your own projects (code like `const title = $(e.target).find('input').val();`), open up the console, use a debugger, and play around!

```javascript
class App {
  attachEventListeners() {
    // prev code...
    $('#update').on('submit', 'form', e => {
      e.preventDefault();
      const id = e.target.dataset.id;
      const note = Note.findById(id);
      const title = $(e.target).find('input').val();
      const content = $(e.target).find('textarea').val();

      const bodyJSON = { title, content };
      fetch(`http://localhost:3000/notes/${note.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(bodyJSON)
      })
        .then(res => res.json())
        .then(updatedNote => console.log(updatedNote));
    });
  }
}
```

This should update the note in the database on submit. We don't yet do anything to the DOM with our response, but should see it updated if we refresh the page. Before tackling the next step, let's refactor!

### Step 5: Refactor (Adapter Pattern)

One thing that might become hard to follow about the current code is that we are making our fetch requests in all different places. We get all the notes on document ready in `index.js`, and we patch to update the note in `app.js`. You can imagine as our application grows we will be making more AJAX requests scattered across more places.

Let's create a class who's only responsibility is to communicate with the API. We can call this our adapter class or api class.

We're aiming to have code that can be used like this:

```javascript
app.adapter.fetchNotes().then(json => {
  json.forEach(note => {
    $('#notes-list').append(new Note(note).renderListItem());
  });
});
```

What then is the return value of `app.adapter.fetchNotes()`? Something that we can call `.then` on must be a promise!  All of our adapter methods should return promises that we can then chain `.then` onto and manipulate the data as needed. This is cool because the adapter can hide away some of the implementation details of `fetch`, such as setting the headers, converting the response into json etc.

```javascript
/* src/adapter.js */
class Adapter {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
  }
  fetchNotes() {
    return fetch(`${this.baseUrl}/notes`).then(res => res.json());
  }

  updateNote(id, body) {
    return fetch(`${this.baseUrl}/notes/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(body)
    }).then(res => res.json());
  }
}
```

```javascript
/* src/index.js */
$(document).ready(() => {
  const app = new App();
  app.attachEventListeners();

  app.adapter.fetchNotes().then(json => {
    json.forEach(note => {
      $('#notes-list').append(new Note(note).renderListItem());
    });
  });
});
```

```javascript
/* src/app.js */
class App {
  constructor() {
    this.adapter = new Adapter();
  }

  attachEventListeners() {
    //... prev code

    $('#update').on('submit', 'form', e => {
      // ... prev code
      this.adapter
        .updateNote(note.id, bodyJSON)
        .then(updatedNote => console.log(updatedNote));
    });
  }
}
```

Now everything should work as before, but we do have some methods that are long and hard to follow. The following is an example of some continued refactoring, abstracting away and encapsulating methods for re-use:

```javascript
/* src/index.js */
$(document).ready(() => {
  const app = new App();
  app.attachEventListeners();
  app.adapter.fetchNotes().then(app.createNotes);
});
```

```javascript
/* src/adapter.js */
class Adapter {
  constructor() {
    this.baseUrl = 'http://localhost:3000';
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }

  fetchNotes() {
    return this.get(`${this.baseUrl}/notes`);
  }

  updateNote(id, body) {
    return this.patch(`${this.baseUrl}/notes/${id}`, body);
  }

  get(url) {
    return fetch(url).then(res => res.json());
  }

  patch(url, body) {
    return fetch(url, {
      method: 'PATCH',
      headers: this.headers,
      body: JSON.stringify(body)
    }).then(res => res.json());
  }
}
```

```javascript
/* src/app.js */
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

  // notice the previous functionality is broken up
  // into two different methods for future re-use...
  createNotes(notes) {
    notes.forEach(note => {
      new Note(note);
    });
    this.addNotes();
  }

  addNotes() {
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
    this.adapter
      .updateNote(note.id, bodyJSON)
      .then(updatedNote => console.log(updatedNote));
  }

  handleEditClick(e) {
    const id = e.target.dataset.id;
    const note = Note.findById(id);
    $('#update').html(note.renderUpdateForm());
  }
}
```
*Note: we need to be extra sure that every time we call one of the methods on an app instance such as handleEditClick, that the context (i.e. what 'this' is) is always the app instance we'd expect. Sometimes when we pass around functions as callbacks the context can get mixed up.  There are several ways to solve this, but notice in the constructor we have code like `this.handleFormSubmit = this.handleFormSubmit.bind(this);`. With this setup, we can bind the correct context once and then not have to worry about it ever again :)*

### Step 6: The Home Stretch, Updating the Note

We now have a really solid codebase to work with to solve the last problem, which is that the title of the note should change on the DOM after the update.

The approach we will take is:

1 - Locate the code that logs the response from the PATCH request.

2 - Take the response JSON and update the note in our client side collection of all the notes (`Note.all`).

3 - and then re-render all the notes.

We'll choose to re-display all of the notes instead of just updating one because it's much easier. We already have a method that can display all notes, lets's use it!

The code only needs to change in a few places:
```javascript
/* src/app.js */
class App {
  // ...

  addNotes() {
    $('#notes-list').empty(); /* clear out whatever is there */
    Note.all.forEach(note => $('#notes-list').append(note.renderListItem()));
  }

  handleFormSubmit(e) {
    // ...
    this.adapter
      .updateNote(note.id, bodyJSON)
      .then(updatedNote => {
        const note = Note.findById(updatedNote.id);
        note.update(updatedNote);
        this.addNotes();
      });
  }
}
```

```javascript
/* src/note.js */
class Note {
  // ...
  update({ title, content }) {
    this.title = title;
    this.content = content;
  }
}
```

*Note: If you are not familiar with what is going on in the line `update({ title, content })`, look into [ES6 Destructuring](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)*


![thats all](https://media.giphy.com/media/mR3dXKpI6P8CA/giphy.gif)

Go out there and build something really cool!
