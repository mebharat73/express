// HTTP module - Server create
import http from "http";

const PORT = 5000;

// Request - User sends/requests to Server
// Response - Server sends to User
const app = http.createServer(function (request, response) {
  if (request.url == "/") {
    response.writeHead(200, { "content-type": "text/html" });
    return response.end("<h1>Home page</h1>");
  } else if (request.url == "/about") {
    return response.end("<h1>About page</h1>");
  } else if (request.url == "/posts") {
    if (request.method == "POST") {
      return response.end("<h1>Create Posts</h1>");
    } else if (request.method == "PUT") {
      return response.end("<h1>Update Posts</h1>");
    }

    return response.end("<h1>Posts page</h1>");
  } else {
    response.writeHead(404, { "content-type": "text/html" });
    return response.end("<h1>Page not found</h1>");
  }
});

app.listen(PORT, () => {
  console.log("Server running at port 5000...");
});
