import fs from "node:fs";
import path from "node:path";
import glob from "fast-glob";
import less from "less";
import { writeFile, resolvePackagePath } from "./util";

async function compileLess(file: string): Promise<string> {
  return new Promise((resolve: Function, reject: Function) => {
    const content = fs.readFileSync(file, { encoding: "utf8" });
    less
      .render(content, {
        paths: [path.dirname(file)],
        filename: file,
        plugins: [],
        javascriptEnabled: true,
      })
      .then((result: { css: any }) => {
        resolve(result.css);
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}
async function build(pkgDirName: string) {
  const pkgDir = resolvePackagePath(pkgDirName, "src");
  const filePaths = await glob(["**/style/index.less"], {
    cwd: pkgDir,
  });
  console.log("filePaths:", filePaths);
  const indexLessPath = path.join(pkgDir, "src", "index.less");
  /**
   * 获取src根目录下的index.less文件  ，如果存在则添加到文件列表中
   */
  if (fs.existsSync(indexLessPath)) {
    filePaths.push(indexLessPath);
  }
  for (let i = 0, len = filePaths.length; i < len; i++) {
    const file = filePaths[i];
    const absolutePath = resolvePackagePath(pkgDirName, "src", file);
    const cssContent = await compileLess(absolutePath);
    //console.log("cssContent:", cssContent);
    const cssPath = resolvePackagePath(
      pkgDirName,
      "dist",
      "css",
      file.replace(/\.less$/, ".css")
    );
    // console.log("cssPath:", cssPath);
    writeFile(cssPath, cssContent);
  }
}

(async () => {
  console.log("[CSS] 开始编译Less文件···");
  await build("components");
  await build("business");
  console.log("[CSS] 编译Less成功！");
})();
