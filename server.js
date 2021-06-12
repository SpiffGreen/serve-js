const http = require("http");
const servejs= require("./serve-js");
const PORT = process.env.PORT || 4000;

// Servejs Config
servejs.setLogger(true);
servejs.setStatic("View");

// Routes
servejs.get("/", (req, res) => {
    res.render(req, res, "View/index.html");
});

servejs.post("/api", (req, res) => {
    res.end(String(req.body));
});

servejs.delete("/api/todo", (req, res) => {
    // Logic to delete stuff
});

servejs.put("/api/todo", (req, res) => {
    // Update stuff
});

http
    .createServer((req, res) => servejs.route(req, res))
    .listen(PORT, () => console.info(`Serving HTTP on port ${PORT} : (http://[::]:${PORT}/)...`));