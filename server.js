const next = require("next");
const http = require("http");
const url = require("url");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  http
    .createServer((req, res) => {
      const parsedUrl = url.parse(req.url, true);
      handle(req, res, parsedUrl);
    })
    .listen(process.env.PORT || 3000, (err) => {
      if (err) throw err;
      console.log(`> Next.js is ready and running on miailtd.com`);
    });
});
