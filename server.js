/* const servejs= require("./serve-js");
const PORT = process.env.PORT || 4000;
const http = require("http");

// Servejs Config
servejs.setLogger(true);
servejs.use(servejs.json());
servejs.use(servejs.cors());
// servejs.setView("Src");
servejs.setStatic("Public");

// Routes
// servejs.get("*", (req, res) => res.send(res, "Frameworkless :)"));
// servejs.get("/", (req, res) => res.send(res, "a"));
servejs.get("/", (req, res) => {
    res.render(req, res, "index.html");
});

servejs.get("/abc", (req, res) => {
    res.render(req, res, "about.html");
});


servejs.post("/api", (req, res) => {
    res.send(res, {packageName: "Serve-js", version: "v0.0.0", author: "Spiff Jekey-Green", method: req.method, body: req.body});
});

// servejs.get("/api", (req, res) => {
//     res.send(res, {packageName: "Serve-js", version: "v0.0.0", author: "Spiff Jekey-Green", method: req.method})
// })

// servejs.delete("/api/todo", (req, res) => {
//     // Logic to delete stuff
// });

// servejs.put("/api/todo", (req, res) => {
//     // Update stuff
// });

// servejs.listen(PORT, () => console.log(`Running on port ${PORT}`));

http
    .createServer(servejs.route)
    .listen(PORT, () => console.dir(`Serving HTTP on port ${PORT} : (http://[::]:${PORT}/)...`)); */

const serveJs = require("./serve-js");

serveJs
    .setLogger(true)
    .use(serveJs.text())
    .get("/", (req, res) => res.send(res, "<H2 align='center'>Welcome To ServeJS</H2>"))
    .get("/product/:productId/details", (req, res) => res.send(res, {...req.param}))
    .get("/:topic", (req, res) => console.log("Middleware: ", req.param), (req, res) => res.send(res, {...req.param, ...req.query}))
    .post("/api", (req, res) => res.send(res, {body: req.body, message: "Recieved"}))
    .options("/api/:product/:id", (req, res) => res.send(res, {...req.param, method: req.method, body: req.body}))
    .listen();