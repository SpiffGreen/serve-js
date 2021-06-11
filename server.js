const http = require("http");
const servejs= require("./serve-js");
const PORT = process.env.PORT || 4000;
process.env.PORT = PORT;

// console.log(servejs);

function handler(req, res) {
    servejs.route(req, res);
}

http.createServer(handler)
    .listen(PORT, () => console.info(`Server started on port ${PORT}`));