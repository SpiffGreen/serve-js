const http = require("http");
const path = require("path");
const fs = require("fs");
const { url } = require("inspector");
const PORT = process.env.PORT || 4000;
process.env.PORT = PORT;

const SRC_FOLDER = "src";

function Mimeof(filename) {
	fileExtension = String(path.extname(filename).toLowerCase())
	Mimes = {
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


function handler(req, res) {

    const URL = req.url.endsWith("/") ? req.url.slice(0, req.url.length - 1) : req.url;

    // Handling POST data - req.body
    let buffer = "";
    req.on("data", chunk => buffer += chunk);
    req.on("end", () => req.body = buffer);
    
    // Adding path not url
    // req.path = req.url.split("?")[0];
    req.path = URL.split("?")[0];
    // console.log("Path: ", req.path);
    // console.log("URL: ", URL);

    
    // Adding query data for easy use
    let queries = req.url.split("?")[1];
    if(typeof queries !== undefined) {
        const indQueries = typeof queries !== "undefined" ? queries.split("&"): [];
        const queryObj = {};
        indQueries.forEach(i => queryObj[i.split("=")[0]] = i.split("=")[1]);
        req.query = queryObj;
    }

    function send404(res) {
        const content = fs.readFileSync(path.join(__dirname, SRC_FOLDER, "404.html"), { encoding: "utf-8" });
        res.writeHead(404, "BAD", {
            "Content-Type": "text/html"
        });
        res.write(checkNodecode(content));
        res.end();
    };

    function include(filePath, stObj = {}) {
        const content = fs.readFileSync(path.join(__dirname, SRC_FOLDER, Mimeof(filePath) === "application/octet-stream" ? filePath + ".html" : filePath), { encoding: "utf-8" });
        /**
         * stObj is for passing down props into components []
         * Each state within square braces e.g [username] can be passed through include("/dashboard", {username: "Admin"})
         */
        // for(let i in stObj) {
        //     const reg = new RegExp(`[^\\\]\[(${i})]`);
        //     console.log(content.match(reg));
        //     console.log(reg);
        // }
        return checkNodecode(content);
    }
    function returnNodeCode(scr) {
        scr = scr.replace(/<script\s+nodejs>/g, "");
        scr = scr.replace(/<\/script>/g, "");
        const scriptFunc = Function("require", "req", "res", "include", scr);
        return typeof scriptFunc(require, req, res, include) === "undefined" ? "" : scriptFunc(require, req, res, include);
    }
    
    function checkNodecode(str) {
        var reg = new RegExp("<script\\s+nodejs>(\\s|\\D|\\S)+?<\\/script>", "g");
        const matches = str.match(reg);
        Array.isArray(matches) ? matches.forEach(element => {
            str = str.replace(element, returnNodeCode(element));
        }) : "";
        return str;
    }

    // Handle Routing

    if(URL.endsWith("/favicon.ico")) {
        fs.readFile(path.join(__dirname, "favicon.ico"), function(err, content) {
            if(err) throw err;
            else {
                res.writeHead(200, { 'Content-Type': "image/x-icon" });
                res.end(content, "utf-8");
            }
        })
    } else if(URL === "") {
        fs.stat(path.join(__dirname, SRC_FOLDER, "index.html"), (err) => {
            if(!err) {
                let content;
                try {
                    content = fs.readFileSync(path.join(__dirname, SRC_FOLDER, "index.html"), { encoding: "utf-8"});
                    res.writeHead(200, "OK", {
                        "Content-Type": "text/html"
                    });
                    res.write(checkNodecode(content));
                    res.end();
                } catch(err) {
                    res.write("<h1><u>Sorry an error occured.</u></h1>");
                    res.end();
                }
            } else {
                send404(res);
            }
        })
    } else {
        if(Mimeof(URL.split("?")[0]) === "application/octet-stream") {
            fs.stat(path.join(__dirname, SRC_FOLDER, URL.split("?")[0]) + ".html", (err) => {
                if(!err) {
                    let content;
                    try {
                        content = fs.readFileSync(path.join(__dirname, SRC_FOLDER, URL.split("?")[0]) + ".html", { encoding: "utf-8"});
                        res.writeHead(200, "OK", {
                            "Content-Type": "text/html"
                        });
                        res.write(checkNodecode(content));
                        res.end();
                    } catch(err) {
                        res.write("<h1><u>Sorry an error occured.</u></h1>");
                        res.end();
                    }
                } else {
                    send404(res);
                }
            });
        } else {
            fs.stat(path.join(__dirname, SRC_FOLDER, URL.split("?")[0]), (err) => {
                if(!err) {
                    let content;
                    try {
                        content = fs.readFileSync(path.join(__dirname, SRC_FOLDER, URL.split("?")[0]), { encoding: "utf-8"});
                        res.writeHead(200, "OK", {
                            "Content-Type": Mimeof(URL.split("?")[0])
                        });
                        res.write(Mimeof(URL.split("?")[0]) === "text/html" ? checkNodecode(content) : content);
                        res.end();
                    } catch(err) {
                        res.write("<h1><u>Sorry an error occured.</u></h1>");
                        res.end();
                    }
                } else {
                    send404(res);
                }
            });
        }
    }
    return;
}

http.createServer(handler)
    .listen(PORT, () => console.info(`Server started on port ${PORT}`));