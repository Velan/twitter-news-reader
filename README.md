Twitter News Reader
=======

## Description

Experimental application to retrieve tweets about articles and blog posts and show the title and excerpt in a simple, mobile-friendly webpage.

Technical features
* Uses Twitter's stream API to retrieve tweets real-time
* Parses for links inside tweets and sends those links to the Readability API to retrieve the title and an excerpt
* News are stored in a redis store
* News are pushed real-time to the front-end with socket.io


## Dependencies

* Node.js
* Redis
* Twitter API keys
* Readability read API key

## TODO

* Documentation
* Setup exemple
