/**
 * @author  Spiff Jekey-Green <spiffjekeygreen@gmail.com>, Muhammed <midnightquatumprogrammer@gmail.com>
 * @name    Serve-js
 * @description Serve-JS is a JavaScript server-side framework for building server-rendered user interfaces
 * @version v0.0.0
 * @see     https://github.com/SpiffGreen/serve-js
 * Copyright(c) 2021 Spiff Jekey-Green <spiffjekeygreen@gmail.com>
 * Copyright(c) 2021 Muhammed <midnightquatumprogrammer@gmail.com>
 * @license MIT Licensed
 */

/**
 * @todo Implement cors method (incomplete)
 */

const path = require("path");
const fs = require("fs");
const http = require("http");

/**
 * @private
 * @param {String} text String to sanitize
 * @returns {text} Sanized text
 */
function sanitize(text) {
    text = text.replace(/<br>/g, "\n");
    text = text.replace(/</g, "&lt;"); 
    text = text.replace(/>/g, "&gt;");
    return text;
}

/**
 * @param {String} text String to test for html
 * @returns {Boolean}
 */
function containsHTML(text) {
    const reg = /<b[^<]*?>|<i[^<]*?>|<div[^<]*?>|<span[^<]*?>|<h[1-6][^<]*?>|<p[^<]*?>|<em[^<]*?>/i;
    return reg.test(text);
}

/**
 * 
 * @param {String} filePath Path to file
 * @returns {Boolean}
 */
function fileExists(filePath) {
    try {
        fs.statSync(filePath);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * @param {String} text Route prototype
 * @param {Servejs|Object} self 
 */
function buildDynamicRoute(text = "", self) {
    const orig = text;
    text = text.startsWith("/") ? text.replace("/", "") : text;
    text = text.endsWith("/") ? text.slice(0, text.length - 1) : text;
    self.tempReg = "";
    text.split("/").forEach(i => i.startsWith(":") ? self.tempReg += "\/([^/]+)" : self.tempReg += "\/" + i);
    self.tempReg = "^" + self.tempReg + "$";
    // (new RegExp("^/users/([^/]+)/([^/]+)$")).exec("/users/spiff/ddfs"); // Simple test
    self.dynamicRoutes[self.tempReg] = Object.create(null);
    self.dynamicRoutes[self.tempReg].params = [];
    self.dynamicRoutes[self.tempReg].orig = orig;
    text.split("/").forEach(i => {
        if(i.startsWith(":")) self.dynamicRoutes[self.tempReg].params.push(i.slice(1, i.length));
    });
}

/**
 * @typedef Servejs
 */
class Servejs {
    constructor() {
        // static const version = "v0.0.0";
        this.version = "v0.0.0";

        this.SRC_FOLDER = "Src";
        this.STATIC_FOLDER = "Public";
        this.logger = false;
        this.DEFAULT_PORT = 4000;
        this.customRouting = false;
        this.tempReg = "";
        this.dynamicRoutes = Object.create(null);
        this.dynamicRoutes_get = Object.create(null);
        this.dynamicRoutes_post = Object.create(null);
        this.dynamicRoutes_put = Object.create(null);
        this.dynamicRoutes_delete = Object.create(null);
        this.dynamicRoutes_options = Object.create(null);
        this.get_routes = Object.create(null);
        this.post_routes = Object.create(null);
        this.delete_routes = Object.create(null);
        this.put_routes = Object.create(null);
        this.options_routes = Object.create(null);
        this.get_any = null;
        this.post_any = null;
        this.delete_any = null;
        this.put_any = null;
        this.options_any = null;
        this.buffer = null; // For storing data
        // this.useCbs = Array(); // Disabled: Used dependency injection

        // Utilities
        // this.Mimeof = this.Mimeof.bind(this);
        this.send404 = this.send404.bind(this);
        this.sendFile = this.sendFile.bind(this);
        this.include = this.include.bind(this);
        this.checkNodecode = this.checkNodecode.bind(this);
        this.returnNodeCode = this.returnNodeCode.bind(this);

        // Methods
        this.route = this.route.bind(this);
        this.setView = this.setView.bind(this);
        this.setStatic = this.setStatic.bind(this);
        this.setLogger = this.setLogger.bind(this);
        this.use = this.use.bind(this);
        this.json = this.json.bind(this);
        this.urlencoded = this.urlencoded.bind(this);
        this.text = this.text.bind(this);
        this.raw = this.raw.bind(this);
        this.listen = this.listen.bind(this);
        this.render = this.render.bind(this);
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.delete = this.delete.bind(this);
        this.put = this.put.bind(this);
        this.options = this.options.bind(this);
    }

    /**
     * @description Middleware for handling body of data
     * @returns {function}
     */
    json() {
        return (req, res) => {
            res.setHeader("Content-Type", "application/json");
            // Handling POST data - req.body
            req.on("data", chunk => {
                try {
                    this.buffer = JSON.parse(chunk.toString());
                    req.body = this.buffer;
                } catch (err) {
                    this.buffer = null;
                }
            });
            
        }
    }

    /**
     * @description Middleware for handling body of data
     * @returns {function}
     */
    text() {
        return (req, res) => {
            // Handling POST data - req.body
            req.on("data", chunk => {
                this.buffer ? buffer += chunk : this.buffer = "" + chunk;
            });
        }
    }

    /**
     * @description Middleware for handling body of data
     * @returns {function}
     */
    urlencoded() {
        return (req, res) => {
            // To be done later, Study urlencoded values for server side manipulation
        }
    }

    /**
     * @description Middleware for handling body of data
     * @returns {function}
     */
    raw() {
        return (req, res) => {
            req.on("data", chunk => this.buffer = chunk);
        }
    }

    /**
     * @description Middleware to handle Cross Origin Requests
     * @returns {Function}
     */
    cors() {
        return (req, res) => {
            // console.log("Res header", res.setHeader);
            res.setHeader("Access-Control-Allow-Origin", "*");

            // // For preflight requests
            res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            
            // // For Options
            this.options("*", (req, res) => {
                // allowed XHR method
                res.setHeader("Access-Control-Allow-Methods", "GET, PATCH, PUT, DELETE, OPTIONS");
                res.send();
            });
        }
    }

    /**
     * @description Sends a 404 response
     * @param {object} req The Request object
     * @param {object} res The Response object
     */
    send404(req, res) {
        if(!this.customRouting) {
            try {
                const content = fs.readFileSync(path.join(__dirname, this.SRC_FOLDER, "404.html"), { encoding: "utf-8" });
                res.writeHead(404, "BAD", {
                    "Content-Type": "text/html"
                });
                res.write(this.checkNodecode(content, req, res));
            } catch {
                res.writeHead(404, "BAD", {
                    "Content-Type": "text/text"
                });
                res.end(`Cannot ${req.method} ${req.url}`);
            }
        } else {
            res.writeHead(404, "BAD", {
                "Content-Type": "text/plain"
            });
            res.end(`Cannot ${req.method} ${req.url}`);
        }
    };

    /**
     * @description sends files based on the filePath.
     * @param {String} filePath Path to file
     */
    sendFile(req, res, filePath) {
        try {
            const content = fs.readFileSync(filePath, { encoding: "utf-8" });
            res.writeHead(200, "OK", {
                "Content-Type": this.Mimeof(filePath)
            });
            res.write(content);
            res.end();
            
        } catch {
            this.send404(req, res);
        }
    }

    /**
     * @description Finds the mimetype of a file
     * @param {String} filename The file name
     * @returns Mimetype of file based on the extension
     */
    Mimeof(filename) {
        const fileExtension = String(path.extname(filename).toLowerCase())
        const Mimes = {
            '.html': 'text/html',
            '.css' : 'text/css',
            '.md'  : 'text/markdown',

            '.ico' : 'image/x-icon',
            '.png' : 'image/png',
            '.jpg' : 'image/jpg',
            '.gif' : 'image/gif',
            '.svg' : 'image/svg+xml',

            '.wav' : 'audio/wav',
            '.mp3' : 'audio/mp3',
            '.mp4' : 'video/mp4',

            '.js':   'application/javascript',
            '.json': 'application/json',
            '.woff': 'application/font-woff',
            '.ttf' : 'application/font-ttf',
            '.eot' : 'application/vnd.ms-fontobject',
            '.otf' : 'application/font-otf',
            '.wasm': 'application/wasm'
        }
        return Mimes[fileExtension] || 'application/octet-stream'
    }

    /**
     * @param {Number} port Port number for server to listen on(optional)
     * @param {Function} cb Callback function(optional)
     * @returns 
     */
    listen(port, cb) {
        return http
                .createServer((req, res) => this.route(req, res))
                .listen(port || process.env.PORT || this.DEFAULT_PORT, () => cb && cb());
    }

    /**
     * @description This is different from the setview function in that this is used if customRouting is done, for serving files like css, js, img files, etc.
     * @param {String} folderPath Path to the folder to serve static files from
     * @returns {Object}
     */
    setStatic(folderPath) {
        this.STATIC_FOLDER = folderPath || this.STATIC_FOLDER;
        return this;
    }

    /**
     * @description This function sets Middlewares to be called upon every request. This functions are called before handlers for a route are called.
     * @param {Function} cb Callbacks|Middlewares
     * @returns {Object}
     */
    use(cb) {
        Array.isArray(this.useCbs)  ? this.useCbs.push(cb) : this.useCbs = Array(cb);
        return this;
    }

    /**
     * @description Handles routing for all requests
     * @param {object} req Request object
     * @param {object} res Response object
     */
    route(req, res) {
        const URL = req.url.endsWith("/") ? req.url.slice(0, req.url.length - 1) : req.url;

        // Handling POST data - req.body
        let buffer = "";
        req.on("data", chunk => buffer += chunk);
        req.on("end", () => req.body = buffer);
    
        // Adding path not url
        req.path = URL.split("?")[0];

        // Set Powered By
        res.setHeader('X-Powered-By', 'ServeJS');

        // Adding query data for easy use
        let queries = req.url.split("?")[1];
        if(typeof queries !== undefined) {
            const indQueries = typeof queries !== "undefined" ? queries.split("&"): [];
            const queryObj = {};
            indQueries.forEach(i => queryObj[i.split("=")[0]] = i.split("=")[1]);
            req.query = queryObj;
        }

        // Handle Logging
        if(this.logger) {
            let d = new Date().toLocaleDateString("en-GB", {day: "numeric", month: "short", year: "numeric"}).replace(", ", "/").replace(" ", "/").split("/");
            let temp = d[1];
            d[1] = d[0];
            d[0] = temp;
            d = d.join("/");
            const t = new Date();
            console.info(`${req.connection.remoteAddress || "localhost"} - - [${d} ${t.toTimeString().split(" ")[0]}] "${req.method} ${req.url} HTTP/${req.httpVersion}" ${res.statusCode}`)
        }

        
        // Handle Routing
        if(!this.customRouting) {
            // Execute Middlewares passed to this.use.
            Array.isArray(this.useCbs) ? this.useCbs.forEach(i => i(req, res)) : null;

            if(URL.endsWith("/favicon.ico")) {
                fs.readFile(path.join(__dirname, this.SRC_FOLDER, "favicon.ico"), function(err, content) {
                    if(err) res.end();
                    else {
                        res.writeHead(200, { 'Content-Type': "image/x-icon" });
                        res.end(content, "utf-8");
                    }
                })
            } else if(URL === "") {
                fs.stat(path.join(__dirname, this.SRC_FOLDER, "index.html"), (err) => {
                    if(!err) {
                        let content;
                        try {
                            content = fs.readFileSync(path.join(__dirname, this.SRC_FOLDER, "index.html"), { encoding: "utf-8"});
                            res.writeHead(200, "OK", {
                                "Content-Type": "text/html"
                            });
                            res.write(this.checkNodecode(content, req, res));
                            res.end();
                        } catch(err) {
                            res.write("<h1><u>Sorry an error occured.</u></h1>");
                            res.end();
                            console.log(err);
                        }
                    } else {
                        this.send404(req, res);
                    }
                });
            } else {
                if(this.Mimeof(URL.split("?")[0]) === "application/octet-stream") {
                    fs.stat(path.join(__dirname, this.SRC_FOLDER, URL.split("?")[0]) + ".html", (err) => {
                        if(!err) {
                            let content;
                            try {
                                content = fs.readFileSync(path.join(__dirname, this.SRC_FOLDER, URL.split("?")[0]) + ".html", { encoding: "utf-8"});
                                res.writeHead(200, "OK", {
                                    "Content-Type": "text/html"
                                });
                                res.write(this.checkNodecode(content, req, res));
                                res.end();
                            } catch(err) {
                                res.write("<h1><u>Sorry an error occured.</u></h1>");
                                res.end();
                                console.log(err);
                            }
                        } else {
                            this.send404(req, res);
                        }
                    });
                } else {
                    fs.stat(path.join(__dirname, this.SRC_FOLDER, URL.split("?")[0]), (err) => {
                        if(!err) {
                            let content;
                            try {
                                content = fs.readFileSync(path.join(__dirname, this.SRC_FOLDER, URL.split("?")[0]), { encoding: "utf-8"});
                                res.writeHead(200, "OK", {
                                    "Content-Type": this.Mimeof(URL.split("?")[0])
                                });
                                res.write(this.Mimeof(URL.split("?")[0]) === "text/html" ? this.checkNodecode(content, req, res) : content);
                                res.end();
                            } catch(err) {
                                res.write("<h1><u>Sorry an error occured.</u></h1>");
                                res.end();
                                console.log(err);
                            }
                        } else {
                            this.send404(req, res);
                        }
                    });
                }
         }

        } else {
            // For custom routes
            const urlPath = req.url.split("?")[0];
            res.render = this.render;
            res.send = this.send;

            // let buffer = "";

            // Execute Middlewares passed to this.use.
            Array.isArray(this.useCbs) ? this.useCbs.forEach(i => i(req, res)) : null;
            
            req.on("end", () => {
                req.body = this.buffer;
                req.param = {length: 0};

                switch(req.method) {
                    case "GET":
                        if(this.get_any) {
                            this.get_any.middleware && this.get_any.middleware(req, res);
                            this.get_any(req, res);
                        } else {
                            if(this.get_routes[urlPath]) {
                                this.get_routes[urlPath].middleware && this.get_routes[urlPath].middleware(req, res);
                                this.get_routes[urlPath](req, res)
                             } else {
                                 let reg_get = "";
                                 for(let x in this.dynamicRoutes) {
                                    var match = (new RegExp(x)).exec(urlPath);
                                    if(match) {
                                        for(let count = 1; count < match.length; count++) {
                                            req.param[this.dynamicRoutes[x].params[count - 1]] = match[count];
                                            req.param.length += 1;
                                        }
                                        reg_get = this.dynamicRoutes[x].orig;
                                    }
                                 }
                                 if(req.param.length === 0) {
                                     fileExists(path.join(__dirname, this.STATIC_FOLDER, urlPath)) ?  this.sendFile(req, res, path.join(__dirname, this.STATIC_FOLDER, urlPath)) : this.send404(req, res);
                                 } else {
                                     // execute dynamic route handler
                                     delete req.param.length;
                                    if(this.dynamicRoutes_get[reg_get]) {
                                        if(this.dynamicRoutes_get[reg_get].middleware) {
                                            this.dynamicRoutes_get[reg_get].middleware(req, res);
                                        }
                                        this.dynamicRoutes_get[reg_get](req, res);
                                     } else {
                                         this.send404(req, res);
                                     }
                                 }
                             }
                        }
                        break;
                    case "POST":
                        // this.post_any ? this.post_any(req, res) : this.post_routes[urlPath] ? this.post_routes[urlPath](req, res) : this.send404(req, res);
                        if(this.post_any) {
                            this.post_any.middleware && this.post_any.middleware(req, res);
                            this.post_any(req, res);
                        } else {
                            if(this.post_routes[urlPath]) {
                                this.post_routes[urlPath].middleware && this.post_routes[urlPath].middleware(req, res);
                                this.post_routes[urlPath](req, res)
                             } else {
                                 let reg_get = "";
                                 for(let x in this.dynamicRoutes) {
                                    var match = (new RegExp(x)).exec(urlPath);
                                    if(match) {
                                        for(let count = 1; count < match.length; count++) {
                                            req.param[this.dynamicRoutes[x].params[count - 1]] = match[count];
                                            req.param.length += 1;
                                        }
                                        reg_get = this.dynamicRoutes[x].orig;
                                    }
                                 }
                                 if(req.param.length === 0) {
                                    this.send404(req, res);
                                 } else {
                                     // execute dynamic route handler
                                     delete req.param.length;
                                    if(this.dynamicRoutes_post[reg_get]) {
                                        if(this.dynamicRoutes_post[reg_get].middleware) {
                                            this.dynamicRoutes_post[reg_get].middleware(req, res);
                                        }
                                        this.dynamicRoutes_post[reg_get](req, res);
                                     } else {
                                         this.send404(req, res);
                                     }
                                 }
                             }
                        }
                        break;
                    case "DELETE":
                        // this.delete_any ? this.delete_any(req, res) : this.delete_routes[urlPath] ? this.delete_routes[urlPath](req, res) : this.send404(req, res);
                        if(this.delete_any) {
                            this.delete_any.middleware && this.delete_any.middleware(req, res);
                            this.delete_any(req, res);
                        } else {
                            if(this.delete_routes[urlPath]) {
                                this.delete_routes[urlPath].middleware && this.delete_routes[urlPath].middleware(req, res);
                                this.delete_routes[urlPath](req, res)
                             } else {
                                 let reg_get = "";
                                 for(let x in this.dynamicRoutes) {
                                    var match = (new RegExp(x)).exec(urlPath);
                                    if(match) {
                                        for(let count = 1; count < match.length; count++) {
                                            req.param[this.dynamicRoutes[x].params[count - 1]] = match[count];
                                            req.param.length += 1;
                                        }
                                        reg_get = this.dynamicRoutes[x].orig;
                                    }
                                 }
                                 if(req.param.length === 0) {
                                    this.send404(req, res);
                                 } else {
                                     // execute dynamic route handler
                                     delete req.param.length;
                                    if(this.dynamicRoutes_delete[reg_get]) {
                                        if(this.dynamicRoutes_delete[reg_get].middleware) {
                                            this.dynamicRoutes_delete[reg_get].middleware(req, res);
                                        }
                                        this.dynamicRoutes_delete[reg_get](req, res);
                                     } else {
                                         this.send404(req, res);
                                     }
                                 }
                             }
                        }
                        break;
                    case "PUT":
                        // this.put_any ? this.put_any(req, res) : this.put_routes[urlPath] ? this.put_routes[urlPath](req, res) : this.send404(req, res);
                        if(this.put_any) {
                            this.put_any.middleware && this.put_any.middleware(req, res);
                            this.put_any(req, res);
                        } else {
                            if(this.put_routes[urlPath]) {
                                this.put_routes[urlPath].middleware && this.put_routes[urlPath].middleware(req, res);
                                this.put_routes[urlPath](req, res)
                             } else {
                                 let reg_get = "";
                                 for(let x in this.dynamicRoutes) {
                                    var match = (new RegExp(x)).exec(urlPath);
                                    if(match) {
                                        for(let count = 1; count < match.length; count++) {
                                            req.param[this.dynamicRoutes[x].params[count - 1]] = match[count];
                                            req.param.length += 1;
                                        }
                                        reg_get = this.dynamicRoutes[x].orig;
                                    }
                                 }
                                 if(req.param.length === 0) {
                                    this.send404(req, res);
                                 } else {
                                     // execute dynamic route handler
                                     delete req.param.length;
                                    if(this.dynamicRoutes_put[reg_get]) {
                                        if(this.dynamicRoutes_put[reg_get].middleware) {
                                            this.dynamicRoutes_put[reg_get].middleware(req, res);
                                        }
                                        this.dynamicRoutes_put[reg_get](req, res);
                                     } else {
                                         this.send404(req, res);
                                     }
                                 }
                             }
                        }
                        break;
                    case "OPTIONS":
                        // this.options_any ? this.options_any(req, res) : this.options_routes[urlPath] ? this.options_routes[urlPath](req, res) : this.send404(req, res);
                        if(this.options_any) {
                            this.options_any.middleware && this.options_any.middleware(req, res);
                            this.options_any(req, res);
                        } else {
                            if(this.options_routes[urlPath]) {
                                this.options_routes[urlPath].middleware && this.options_routes[urlPath].middleware(req, res);
                                this.options_routes[urlPath](req, res)
                             } else {
                                 let reg_get = "";
                                 for(let x in this.dynamicRoutes) {
                                    var match = (new RegExp(x)).exec(urlPath);
                                    if(match) {
                                        for(let count = 1; count < match.length; count++) {
                                            req.param[this.dynamicRoutes[x].params[count - 1]] = match[count];
                                            req.param.length += 1;
                                        }
                                        reg_get = this.dynamicRoutes[x].orig;
                                    }
                                 }
                                 if(req.param.length === 0) {
                                    this.send404(req, res);
                                 } else {
                                     // execute dynamic route handler
                                     delete req.param.length;
                                    if(this.dynamicRoutes_options[reg_get]) {
                                        if(this.dynamicRoutes_options[reg_get].middleware) {
                                            this.dynamicRoutes_options[reg_get].middleware(req, res);
                                        }
                                        this.dynamicRoutes_options[reg_get](req, res);
                                     } else {
                                         this.send404(req, res);
                                     }
                                 }
                             }
                        }
                        break;
                    default:
                        res.end("UNKNOWN METHOD");
                        break;
                }
            });
        }
    }

    /**
     * @description This method is used for sending data to clients. Capable of sending html from string and json.
     * @param {Object|Array|String|Number} respObject Data to send to client
     */
    send(res, respObject) {
        const type = typeof respObject;
        if(type === "object" || Array.isArray(respObject)) {
            try {
                const jsonResp = JSON.stringify(respObject);
                res.writeHead(200, "OK", {
                    "Content-Type": "application/json"
                });
                res.write(jsonResp);
                res.end();
            } catch {
                res.writeHead(500, "BAD", {
                    "Content-Type": "text/html"
                });
                res.write("Server Error");
                res.end();
            }
        } else if(type === "string" || type === "number") {
            res.writeHead(200, "OK", {
                "Content-Type": containsHTML(respObject) ? "text/html" : "text/plain"
            });
            res.write(respObject);
            res.end();
        } else throw Error("Invalid output to send");
    }

    /**
     * @description Renders files like include, but doesn't not return anything
     * @param {object} req Request object
     * @param {object} res Response object
     * @param {String} filePath The path to returned file
     * @param {object} stObj State object to be passed into the file
     */
    render(req, res, filePath, stObj = {}) {
        try {
            const content = fs.readFileSync(path.join(__dirname, this.STATIC_FOLDER, this.Mimeof(filePath) === "application/octet-stream" ? filePath + ".html" : filePath), { encoding: "utf-8" });
            /**
             * stObj is for passing down props into components []
             * Each state within square braces e.g [username] can be passed through include("/dashboard", {username: "Admin"})
             */
             for(let i in stObj) {
                const reg = new RegExp(`\\[${i}\\]`, "g");
                content = content.replace(reg, sanitize(stObj[i]));
                const reg2 = new RegExp(`\\[=(${i})\\]`, "g");
                content = content.replace(reg2, stObj[i]);
            }
            // console.log(this.checkNodecode(content, req, res));
            res.writeHead(200, "OK", {
                "Content-Type": this.Mimeof(filePath)
            });
            res.write(this.checkNodecode(content, req, res));
            res.end();
        } catch (error) {
            throw Error("Component Not Found");
        }
    }

    /**
     * @description Sets the folder name for fetch resources
     * @param {String} folderName Name of new folder.
     */
    setView(folderName = "src") {
        this.SRC_FOLDER = folderName;
        return this;
    }

    /**
     * @description Turns ON/OFF logger
     * @param {Boolean} b true or false
     */
    setLogger(b = true) {
        this.logger = b;
        return this;
    }

    /**
     * @description Handles all 'GET' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    get(appPath, handler) {
        this.customRouting = true;
        if(appPath.includes(":")) {
            buildDynamicRoute(appPath, this);
            this.dynamicRoutes_get[appPath] = handler;
            if(arguments.length > 2) {
                this.dynamicRoutes_get[appPath] = arguments[2];
                this.dynamicRoutes_get[appPath].middleware = handler;
                return this;
            }
            return this;
        }
        if(arguments.length > 2) {
            if(appPath !== "*") {
                this.get_routes[appPath] = arguments[2];
                this.get_routes[appPath].middleware = handler;
            } else {
                this.get_any.middleware = handler;
                this.get_any = arguments[2];
            }
            return this;
        }
        appPath !== "*" ? this.get_routes[appPath] = handler : this.get_any = handler;
        return this;
    }

    /**
     * @description Handles all 'POST' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    post(appPath, handler) {
        this.customRouting = true;
        if(appPath.includes(":")) {
            buildDynamicRoute(appPath, this);
            this.dynamicRoutes_post[appPath] = handler;
            if(arguments.length > 2) {
                this.dynamicRoutes_post[appPath] = arguments[2];
                this.dynamicRoutes_post[appPath].middleware = handler;
                return this;
            }
            return this;
        }
        if(arguments.length > 2) {
            if(appPath !== "*") {
                this.post_routes[appPath] = arguments[2];
                this.post_routes[appPath].middleware = handler;
            } else {
                this.post_any.middleware = handler;
                this.post_any = arguments[2];
            }
            return this;
        }
        appPath !== "*" ? this.post_routes[appPath] = handler : this.post_any = handler;
        return this;
    }

    /**
     * @description Handles all 'DELETE' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    delete(appPath, handler) {
        this.customRouting = true;
        if(appPath.includes(":")) {
            buildDynamicRoute(appPath, this);
            this.dynamicRoutes_delete[appPath] = handler;
            if(arguments.length > 2) {
                this.dynamicRoutes_delete[appPath] = arguments[2];
                this.dynamicRoutes_delete[appPath].middleware = handler;
                return this;
            }
            return this;
        }
        if(arguments.length > 2) {
            if(appPath !== "*") {
                this.delete_routes[appPath] = arguments[2];
                this.delete_routes[appPath].middleware = handler;
            } else {
                this.delete_any.middleware = handler;
                this.delete_any = arguments[2];
            }
            return this;
        }
        appPath !== "*" ? this.delete_routes[appPath] = handler : this.delete_any = handler;
        return this;
    }

    /**
     * @description Handles all 'PUT' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    put(appPath, handler) {
        this.customRouting = true;
        if(appPath.includes(":")) {
            buildDynamicRoute(appPath, this);
            this.dynamicRoutes_put[appPath] = handler;
            if(arguments.length > 2) {
                this.dynamicRoutes_put[appPath] = arguments[2];
                this.dynamicRoutes_put[appPath].middleware = handler;
                return this;
            }
            return this;
        }
        if(arguments.length > 2) {
            if(appPath !== "*") {
                this.put_routes[appPath] = arguments[2];
                this.put_routes[appPath].middleware = handler;
            } else {
                this.put_any.middleware = handler;
                this.put_any = arguments[2];
            }
            return this;
        }
        appPath !== "*" ? this.put_routes[appPath] = handler : this.put_any = handler;
        return this;
    }

    /**
     * @description Handles all 'OPTIONS' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    options(appPath, handler) {
        this.customRouting = true;
        if(appPath.includes(":")) {
            buildDynamicRoute(appPath, this);
            this.dynamicRoutes_options[appPath] = handler;
            if(arguments.length > 2) {
                this.dynamicRoutes_options[appPath] = arguments[2];
                this.dynamicRoutes_options[appPath].middleware = handler;
                return this;
            }
            return this;
        }
        if(arguments.length > 2) {
            if(appPath !== "*") {
                this.options_routes[appPath] = arguments[2];
                this.options_routes[appPath].middleware = handler;
            } else {
                this.options_any.middleware = handler;
                this.options_any = arguments[2];
            }
            return this;
        }
        appPath !== "*" ? this.option_routes[appPath] = handler : this.option_any = handler;
        return this;
    }


    /**
     * @description A function to include components
     * @param {String} filePath Path to file to include as component
     * @param {object} stObj For passing state to components
     * @returns {String} Content of component
     */
    include(filePath, stObj = {}) {
        let content = "";
        try {
            // console.log(path.join(__dirname, this.customRouting ? this.STATIC_FOLDER : this.SRC_FOLDER, this.Mimeof(filePath) === "application/octet-stream" ? filePath + ".html" : filePath));
            if(this.customRouting && (this.Mimeof(filePath) === "application/octet-stream" || this.Mimeof(filePath) === "text/html")) {
                content = fs.readFileSync(path.join(__dirname, this.STATIC_FOLDER, this.Mimeof(filePath) === "application/octet-stream" ? filePath + ".html" : filePath), { encoding: "utf-8" });
            } else {
                content = fs.readFileSync(path.join(__dirname, this.SRC_FOLDER, this.Mimeof(filePath) === "application/octet-stream" ? filePath + ".html" : filePath), { encoding: "utf-8" });
            }
            /**
             * stObj is for passing down props into components []
             * Each state within square braces e.g [username], [=code] can be passed through include("/dashboard", {username: "Admin"})
             */
            for(let i in stObj) {
                const reg = new RegExp(`\\[${i}\\]`, "g");
                content = content.replace(reg, sanitize(stObj[i]));
                const reg2 = new RegExp(`\\[=(${i})\\]`, "g");
                content = content.replace(reg2, stObj[i]);
            }
        } catch {
            throw Error("Component Not Found");
        }
        return content;
    }
    
    /**
     * @description This will Get all scripts with nodejs attribute together with their content
     * @param {String} scr Content of nodejs scripts to be executed
     * @param {object} req Request object
     * @param {object} res Response object
     * @see     https://github.com/SpiffGreen/serve-js/issues For issue concerning include functions state passing. returnNodeCode may fail if scripts are passed.
     * @returns {String} Generated code(HTML, JSON, etc)
     */
    returnNodeCode(scr, req, res) {
        scr = scr.replace(/<script\s+nodejs>/g, "");
        scr = scr.replace(/<\/script>/g, "");
        try {
            const scriptFunc = Function("require", "req", "res", "include", scr);
            return typeof scriptFunc(require, req, res, this.include) === "undefined" ? "" : scriptFunc(require, req, res, this.include);
        } catch (err) {
            /**
             * NOTE: If a script was passed in here using from include function for passing it would fail.
             * Please do proper logging here for security issues.
             * Scripts can not be passed by an everyday user
             */
            console.log(err);
            throw Error("Error while parsing node script");
        }
    }
    
    /**
     * @description Checks for script tags with nodejs code.
     * @param {String} str Code to execute
     * @param {object} req Request object
     * @param {object} res Response object
     * @returns {String} Generated code(HTML, JSON, etc)
     */
    checkNodecode(str, req, res) {
        var reg = new RegExp("<script\\s+nodejs>(\\s|\\D|\\S)+?<\\/script>", "g");
        const matches = str.match(reg);
        Array.isArray(matches) ? matches.forEach(element => {
            try {
                str = str.replace(element, this.returnNodeCode(element, req, res));
            } catch {
                str = str.replace(element, "");
            }
        }) : "";
        return str;
    }
}

module.exports = (new Servejs);