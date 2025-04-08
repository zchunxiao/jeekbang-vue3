//console.log("hello world:", process.env.NODE_ENV);
import path from "node:path";
import koa from "koa";
import koaStatic from "koa-static";
import koaMount from "koa-mount";
import routers from "./routers";
import { getServerDir } from "./util/file";

const app = new koa();

const publicDirPath = path.join(getServerDir(), "public");

app.use(koaMount("/public", koaStatic(publicDirPath)));
app.use(routers);

const port = 8001;

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  console.log(`Public directory is served at http://localhost:${port}/public`);
});
