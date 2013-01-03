# Jade-handlebars for Meteor

Write the templates in your [Meteor](https://github.com/meteor/meteor) Application using [Handlebars](http://github.com/wycats/handlebars.js) and [Jade](https://github.com/visionmedia/jade) instead of HTML and Handlebars.

## Why?

Jade is a high performance template engine heavily influenced by [Haml](http://haml.info/). Main features are great readability, filters (stylus, less, markdown, coffee-script, etc), flexible indentation,...

## How?

Instead of writing (demo.html):
    
    <head>
      <title>demo</title>
    </head>

    <body>
      {{> hello}}
    </body>

    <template name="hello">
      <h1>Hello World!</h1>
      {{greeting}}
      <input type='button' value="Click"/>
    </template> 

You may write (demo.jade):
    
    head
      title test-jade-handlebars

    body
      {{> hello}}

    template(name="hello")
      h1 Hello World!
      {{greeting}}
      input(type="button", value="Click")

## Installation

To install Jade-handlebars using [Atmosphere](https://atmosphere.meteor.com), simply install Meteorite.
    
    $ npm install -g meteorite

Navigate to your Meteor project directory and add the package.

    $ mrt add jade-handlebars

Then, don't forget to run your project using `mrt` instead of `meteor`.
    

## Todo

Write tests