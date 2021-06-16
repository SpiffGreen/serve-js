<div align="center">
<h2>Serve-JS</h2>

<p>Serve-JS is a JavaScript server-side framework for building server-rendered user interfaces. Built to be adoptable on different levels, being  component based while still used for templating.</p>

![](https://img.shields.io/github/license/SpiffGreen/serve-js)
![](https://img.shields.io/github/issues/SpiffGreen/serve-js)
![](https://img.shields.io/github/forks/SpiffGreen/serve-js)<br>
![](https://img.shields.io/github/stars/SpiffGreen/serve-js)
![](https://img.shields.io/snyk/vulnerabilities/github/spiffgreen/serve-js)
![](https://img.shields.io/github/watchers/spiffgreen/serve-js?style=social)

</div>

Serve-JS is an implementation of [midnqp/frameworkless](https://github.com/midnqp/frameworkless) specification.
* __Its easy to write__: Any who knows simple html and css is good to go, except for writing the server side logic if required means one should have knowledge of nodejs.
* __Node in HTML__: Allows you write nodejs code inside html
* __Routing__: It intelligently performs the routing for you. So no need to worry about url paths, except you need to customize the endpoints. As a plus, you don't have to include .html at the end of URLs requesting HTML files.
* __Usable for both http and https__: Whether its http

## Features
* __Resuable Components__: You could build encapsulated components that manage their own logic and state. This could be used to build even more complex UIs.
* __Middlewares__: For more controlled routing logic e.g req.body's data validation.
* __Routing__: Serve-JS does automatic routing for you even without you writing server code.

## Installation

```sh
$ npm install serve
```

## Examples

### Basic ServeJS server
This example demonstrates the use of ServeJS for serving files from a folder.
```js
const app = require("serve-js");
app.listen(3000, () => console.log(`Server started on port 3000`));
```
Default folder it reads from is `Src` folder. In this folder contains the html, css and javascript files to be served. But this can be overwritten using a serveJS method. See example below.
```js
const app = require("serve-js");

app.setView("Public"); // Changes the default folder for reading files from.
app.listen(3000, () => console.log(`Server started on port 3000`));
```

### Using http/https modules
Servejs allows you the freedom and flexibility to structure your apps the way you want.
See example below:
```js
const http = require("http");
const app = require("serve-js");

http.createServer(app.route)
    .listen(process.env.PORT ||  4000, () => console.log('Server is running on PORT 3000'));
```

### Custom routes
This methods are used to assign function handlers to specific routes. Whenever the endpoint is hit and it matches the method type, the handler tied to that endpoint is called
#### `ServeJS.prototype.get()` - For GET requests.
#### `ServeJS.prototype.post()` - Adds endpoints with respective handlers for POST requests.
#### `ServeJS.prototype.delete()` - Adds endpoints for DELETE requests.
#### `ServeJS.prototype.put()` - For put requests.
#### `ServeJS.prototype.options()` - Adds endpoints for PUT requests.

## Methods
### `route`
This method handles the whole routing process. It's passed as argument to http/https createServer methods.
### `setView`
This sets the default folder for reading files from. Note: This is used if no custom route is set.
### `setStatic`
This sets the default folder to serve files from. This is only used when custom routes are defined and a static file e.g css, js files, etc are requested.
### `setLogger`
This function will tell ServeJS to log request details if given a value of __*`true`*__. Defualt value is false. Hence, ServeJS won't log requests by default.
### `listen`
This is a mere wrapper around http and simply starts a http server for you, given a PORT.
### `render`
The render method is passed to the response object of routes' callbacks. `res.render(fileName)` will render file with `fileName` to the client.
### `send`
The primary functionality of this method is to send the file a file to the client. It accepts three parameters `req`, `res`, and `filePath`.
### `use`
This method is used for adding middlewares(functions) that will be called upon every request made. For a more targetted use of middlewares may be on a specific set of routes and not all routes please be sure to add it to the route definition.

### `json`
This is a serve middleware which if assigned, will make the value of `req.body` in JSON format.
### `raw`
This serve middleware will keep `req.body`'s value in it's raw form.
### `text`
This serve middleware returns `req.body` as a string.
### `urlencoded`
This middleware will return the values of a request in url encoded form.

## Documentation
Not available yet: [https://spiffgreen.github.io/serve-js](https://spiffgreen.github.io/serve-js)

## Issues
You have suggestions? or something you wish is added to the framework to make users experience better? We have a working [issue tracker](https://github.com/SpiffGreen/serve-js/issues) to meet the request of many. Please note that if an issue does not conform to the standard of Serve-JS it will be closed immediately.

## Contributing Guide
Please read the [Contributing.md](./CONTRIBUTING.md) file for guidelines to contribute to this project.

## License
Serve-JS is [MIT licensed](./LICENSE)

Copyright 2021 Spiff Jekey-Green <spiffjekeygreen@gmail.com>

Copyright 2021 Muhammad Bin Zafar <midnightquantumprogrammer@gmail.com>

<p align="center">Made with in Nigeria</p>
