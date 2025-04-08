import { fileURLToPath } from "node:url";
// 在 Node.js 中，fs 模块是一个 CommonJS 模块，不支持默认导出。因此，当你使用 import fs from "node:fs"; 时，会出现“模块没有默认导出”的错误。
//应该使用命名导入的方式来导入 fs 模块
import * as fs from "node:fs";
import * as path from "node:path";
// console.log("import.meta.url", import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const projectDir = path.join(__dirname, "../");

export const resolveProjectPath = (...args: string[]) => {
  return path.join(projectDir, ...args);
};
export const resolvePackagePath = (...args: string[]) => {
  return path.join(__dirname, "../", "packages", ...args);
};

export const writeFile = (file: string, text: string) => {
  const dir = path.dirname(file);
  // console.log("file:", file);
  // console.log("dir:", dir);
  if (!(fs.existsSync(dir) && fs.statSync(dir).isDirectory())) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file, text);
};
