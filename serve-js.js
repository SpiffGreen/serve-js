/**
 * @author  Spiff Jekey-Green <spiffjekeygreen@gmail.com>
 * @name    Serve-js
 * @description Serve-JS is a JavaScript server-side framework for building server-rendered user interfaces
 * @version v0.0.0
 * @see     https://github.com/SpiffGreen/serve-js
 */
const path = require("path");
const fs = require("fs");

class Servejs {
    constructor() {
        // static const version = "v0.0.0";
        this.version = "v0.0.0";

        this.SRC_FOLDER = "src";
        this.logger = false;
        this.customRouting = false;
        this.get_routes = Object.create(null);
        this.post_routes = Object.create(null);
        this.delete_routes = Object.create(null);
        this.put_routes = Object.create(null);

        // Utilities}
        this.Mimeof = this.Mimeof.bind(this);
        this.send404 = this.send404.bind(this);
        this.include = this.include.bind(this);
        this.checkNodecode = this.checkNodecode.bind(this);
        this.returnNodeCode = this.returnNodeCode.bind(this);

        // Methods
        this.route = this.route.bind(this);
        this.setStatic = this.setStatic.bind(this);
        this.setLogger = this.setLogger.bind(this);
        this.render = this.render.bind(this);
        this.get = this.get.bind(this);
        this.post = this.post.bind(this);
        this.delete = this.delete.bind(this);
        this.put = this.put.bind(this);
    }

    /**
     * @description Sends a 404 response
     * @param {object} req The Request object
     * @param {object} res The Response object
     */
    send404(req, res) {
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
    };

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

        // Adding query data for easy use
        let queries = req.url.split("?")[1];
        if(typeof queries !== undefined) {
            const indQueries = typeof queries !== "undefined" ? queries.split("&"): [];
            const queryObj = {};
            indQueries.forEach(i => queryObj[i.split("=")[0]] = i.split("=")[1]);
            req.query = queryObj;
        }

        // Handle Routing
        if(!this.customRouting) {
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
            const urlPath = req.url.split("?")[0];
            res.render = this.render
            switch(req.method) {
                case "GET":
                    this.get_routes[urlPath] ? this.get_routes[urlPath](req, res) : this.send404(req, res);
                    break;
                case "POST":
                    this.post_routes[urlPath] ? this.post_routes[urlPath](req, res) : this.send404(req, res);
                    break;
                case "DELETE":
                    this.delete_routes[urlPath] ? this.delete_routes[urlPath](req, res) : this.send404(req, res);
                    break;
                case "PUT":
                    this.put_routes[urlPath] ? this.put_routes[urlPath](req, res) : this.send404(req, res);
                    break;
                default:
                    res.end("UNKNOWN METHOD");
                    break;
            }
        }

        // Handle Logging
        if(this.logger) {
            const d = new Date();
            console.info(`${req.connection.remoteAddress || "localhost"} - - [${d.toLocaleDateString()} ${d.toTimeString().split(" ")[0]}] "${req.method} ${req.url} HTTP/${req.httpVersion}" ${res.statusCode}`)
        }
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
            const content = fs.readFileSync(path.join(__dirname, this.Mimeof(filePath) === "application/octet-stream" ? filePath + ".html" : filePath), { encoding: "utf-8" });
            /**
             * stObj is for passing down props into components []
             * Each state within square braces e.g [username] can be passed through include("/dashboard", {username: "Admin"})
             */
            // for(let i in stObj) {
            //     const reg = new RegExp(`[^\\\]\[(${i})]`);
            //     console.log(content.match(reg));
            //     console.log(reg);
            // }
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
    setStatic(folderName = "src") {
        this.SRC_FOLDER = folderName;
    }

    /**
     * @description Turns ON/OFF logger
     * @param {Boolean} b true or false
     */
    setLogger(b = true) {
        this.logger = b;
    }

    /**
     * @description Handles all 'GET' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    get(appPath, handler) {
        this.customRouting = true;
        this.get_routes[appPath] = handler;
    }

    /**
     * @description Handles all 'POST' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    post(appPath, handler) {
        this.customRouting = true;
        this.post_routes[appPath] = handler;
    }

    /**
     * @description Handles all 'DELETE' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    delete(appPath, handler) {
        this.customRouting = true;
        this.delete_routes[appPath] = handler;
    }

    /**
     * @description Handles all 'PUT' requests for appPath using handler
     * @param {String} appPath Expected Endpoint
     * @param {Function} handler Callback for allowing user handle the req and res
     */
    put(appPath, handler) {
        this.customRouting = true;
        this.put_routes[appPath] = handler;
    }


    /**
     * @description A function to include components
     * @param {String} filePath Path to file to include as component
     * @param {object} stObj For passing state to components
     * @returns {String} Content of component
     */
    include(filePath, stObj = {}) {
        try {
            const content = fs.readFileSync(path.join(__dirname, this.SRC_FOLDER, this.Mimeof(filePath) === "application/octet-stream" ? filePath + ".html" : filePath), { encoding: "utf-8" });
        } catch (error) {
            throw Error("Component Not Found");
        }
        /**
         * stObj is for passing down props into components []
         * Each state within square braces e.g [username] can be passed through include("/dashboard", {username: "Admin"})
         */
        // for(let i in stObj) {
        //     const reg = new RegExp(`[^\\\]\[(${i})]`);
        //     console.log(content.match(reg));
        //     console.log(reg);
        // }
        return content;
    }
    
    /**
     * @description This will Get all scripts with nodejs attribute together with their content
     * @param {String} scr Content of nodejs scripts to be executed
     * @param {object} req Request object
     * @param {object} res Response object
     * @returns {String} Generated code(HTML, JSON, etc)
     */
    returnNodeCode(scr, req, res) {
        scr = scr.replace(/<script\s+nodejs>/g, "");
        scr = scr.replace(/<\/script>/g, "");
        const scriptFunc = Function("require", "req", "res", "include", scr);
        return typeof scriptFunc(require, req, res, this.include) === "undefined" ? "" : scriptFunc(require, req, res, this.include);
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
            str = str.replace(element, this.returnNodeCode(element, req, res));
        }) : "";
        return str;
    }
}

module.exports = (new Servejs);