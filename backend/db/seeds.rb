# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


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

