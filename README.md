# JetFire.js
JetFire is a YARLF ( YET ANOTHER RAILS LIKE FRAMEWORK ). It uses conventions learnt from rails and aims to be a rails alternative for JS Ninjas out there. It has a full stack MVC and a lot of features on the way.

# Installation

Through npm : 
```sh
sudo npm install jetfire -g
```

# Creating a new app

```sh
jetfire new jetapp
```

# Starting up the server

```sh
# cd into the app folder
cd jetapp

# start the server
jetfire server
```

Now open up your favorite browser ( and i am sure its not IE :P ) and navigate to localhost:3000.
This is the default jetfire homepage.

Now, lets start building our jetfire powered application. I promise it'll be fn ;)

# Generating a controller

```sh
jefire generate controller home
```

The above command will create a file called HomeController.js in app-folder/app/controllers. 

An action can be defined inside the controller as follows

```javascript
module.exports = {
	index: function($, next) {
		next();
	}	
}
```

The action accepts 2 params, $ and next. The $ will contain params to be passed to the controller
and also it can be used to pass template variables to the view from the controller. 

The next function needs to be called after the execution of the controller ends. If the controller has a callback for eg:

```javascript
module.exports = {
	index: function($, next) {
		User.findAll().success(function(users) {
			next();
		});
	}	
}
```
the next function preferebly should be called from inside the inner most callback.

# Defining a route

Route for the home#index can be specified like this,

```javascript
module.exports = {
	'/': 'home#index',
};
```

# Creating the view

Now we need to create a view.

JetFire by default uses <a href="https://github.com/visionmedia/jade">jade</a> 
as the templating system. Alternatively you can use <a href="https://github.com/visionmedia/ejs">ejs</a> or <a href="https://github.com/creationix/haml-js">haml</a>

This setting is present in the app config file app-folder/config/application.js

```javascript
module.exports = {
	appName: "JetPack App",

	port: "3000",

	env: "development",

	viewEngine: "jade" // also supports ejs and haml
};
```

Set viewEngine to ejs or haml to use them for templating. 

Along with the viewEngine the app config also has the port setting and env setting of the app.

Now to create the view. Lets create a file called index.jade in app-folder/app/views/home. This folder is automatically generated when you create the controller. The jade file as follows

```jade
h1 Hurray we finally see something!!
```

Now run the server again using

```sh
jetfire s
```
Now you can see the page says "Hurray we finally see something"

# Generating models

JetFire currently uses <a href="http://www.sequelizejs.com/">sequelize</a> internally for the ORM, which by default supports sqlite, postgres and mysql. ( Mongo through mongoose is on the way!! :) )

to create a model use the following command

```sh
jetfire g model User name:string email:string
```

The above command creates a model file @ app-folder/app/models called User.js and also a 
Create file migration in app-folder/db/migrate and a schema app-folder/db/schema

More documentation on models coming soon...

Roadmap
--
- Complete migration support
- Mongo support
- Asset pipeline
- Caching
- Mailer

The MIT License (MIT)
--

Copyright © 2013 Ameen Ahmed

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

