const http = require("http");
const path = require("path");
const fs = require("fs");
const PORT = process.env.PORT || 80;

const SRC_FOLDER = "src"

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

    if(req.url.endsWith("/favicon.ico")) {
        res.writeHead(200, "OK", {
            "Content-Type": "image/x-icon"
        });
        const content = fs.readFileSync(path.join(__dirname, SRC_FOLDER, "favicon.ico"), { encoding: "utf-8"});
        res.write(content);
        // res.write();
        res.end();
    } else if(req.url.endsWith("/")) {
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
                    console.log(err);
                }
            } else {
                res.writeHead(404, "BAD", {
                    "Content-Type": "text/html"
                });
                res.write("<h1><u>404!</u></h1>");
                res.end();
            }
        })
    } else {
        // console.log(path.join(__dirname, "Public", req.url.split("?")[0]));
        if(Mimeof(req.url.split("?")[0]) === "application/octet-stream") {
            fs.stat(path.join(__dirname, SRC_FOLDER, req.url.split("?")[0]) + ".html", (err) => {
                if(!err) {
                    let content;
                    try {
                        content = fs.readFileSync(path.join(__dirname, SRC_FOLDER, req.url.split("?")[0]) + ".html", { encoding: "utf-8"});
                        res.writeHead(200, "OK", {
                            "Content-Type": "text/html"
                        });
                        res.write(checkNodecode(content));
                        res.end();
                    } catch(err) {
                        res.write("<h1><u>Sorry an error occured.</u></h1>");
                        res.end();
                        console.log(err);
                    }
                } else {
                    res.write("<h1><u>404!</u></h1>");
                    res.end();
                }
            });
        } else {
            fs.stat(path.join(__dirname, SRC_FOLDER, req.url.split("?")[0]), (err) => {
                if(!err) {
                    let content;
                    try {
                        content = fs.readFileSync(path.join(__dirname, SRC_FOLDER, req.url.split("?")[0]), { encoding: "utf-8"});
                        res.writeHead(200, "OK", {
                            "Content-Type": Mimeof(req.url.split("?")[0])
                        });
                        res.write(Mimeof(req.url.split("?")[0]) === "text/html" ? checkNodecode(content) : content);
                        res.end();
                    } catch(err) {
                        res.write("<h1><u>Sorry an error occured.</u></h1>");
                        res.end();
                        console.log(err);
                    }
                } else {
                    res.write("<h1><u>404!</u></h1>");
                    res.end();
                }
            });
        }
    }
    return;
}

http.createServer(handler)
    .listen(PORT, () => console.info(`Server started on port ${PORT}`));