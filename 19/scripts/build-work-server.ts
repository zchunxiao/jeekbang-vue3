import fs from "node:fs";
import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import glob from "fast-glob";
import type { OutputOptions } from "rollup";
import esbuild from "rollup-plugin-esbuild";
import { resolvePackagePath, writeFile } from "./util";

/**
 * @description 读取 package.json 中的依赖
 * @param pkgDirName 包名
 * @returns
 */
async function getExternal(pkgDirName: string) {
  const pkgPath = resolvePackagePath(pkgDirName, "package.json");
  const manifest = require(pkgPath) as any;
  const {
    dependencies = {},
    peerDependencies = {},
    devDependencies = {},
  } = manifest;
  const deps: string[] = [
    ...new Set([
      ...Object.keys(dependencies),
      ...Object.keys(peerDependencies),
      ...Object.keys(devDependencies),
    ]),
  ];
  return (id: string) => {
    if (id.endsWith(".less")) {
      return true;
    }
    return deps.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));
  };
}
/**
 *
 * @param pkgDirName 包名
 * @description 编译 ts 文件
 * @returns
 */
async function compileTsFiles(pkgDirName: string) {
  removeDist(pkgDirName);
  const tsInput = await glob(
    [
      "**/*.{js,jsx,ts,tsx,vue}",
      "!public",
      "!template",
      "!dist",
      "!node_modules",
    ],
    {
      cwd: resolvePackagePath(pkgDirName, "src"),
      absolute: true,
      onlyFiles: true,
    }
  );

  const bundle = await rollup({
    input: tsInput,
    plugins: [
      nodeResolve({
        extensions: [".mjs", ".js", ".json", ".ts"],
      }),
      commonjs(),
      esbuild({
        sourceMap: true,
        target: "es2015",
        loaders: {
          ".vue": "ts",
        },
      }),
    ],
    external: await getExternal(pkgDirName),
    treeshake: false,
  });
  const option: OutputOptions = {
    format: "cjs",
    dir: resolvePackagePath(pkgDirName, "dist"),
    exports: "named",
    preserveModules: true,
    preserveModulesRoot: resolvePackagePath(pkgDirName, "src"),
    sourcemap: true,
    entryFileNames: "[name].cjs",
  };
  return bundle.write(option);
}

/**
 *
 * @param pkgDirName 包名
 * @description 复制前端文件
 * @returns
 */
const copyServerFiles = async (pkgDirName: string) => {
  const filePaths = await glob(
    ["!node_modules", "template/**/*.html", "public/**/*.{js,css}"],
    {
      cwd: resolvePackagePath(pkgDirName, "src"),
      absolute: false,
      onlyFiles: true,
    }
  );
  filePaths.forEach((filePath) => {
    const srcFullPath = resolvePackagePath(pkgDirName, "src", filePath);
    const distFullPath = resolvePackagePath(pkgDirName, "dist", filePath);
    const text = fs.readFileSync(srcFullPath, { encoding: "utf-8" });
    writeFile(distFullPath, text);
  });
};

/**
 *
 * @param pkgDirName 包名
 * @description 复制前端文件
 * @returns
 */
const copyFrontFiles = async (pkgDirName: string) => {
  const filePaths = await glob(["**/*.{js,css}", "!node_modules"], {
    cwd: resolvePackagePath(
      pkgDirName,
      "node_modules",
      "@my",
      "work-front",
      "dist"
    ),
    absolute: false,
    onlyFiles: true,
  });
  filePaths.forEach((filePath) => {
    const srcFullPath = resolvePackagePath(
      pkgDirName,
      "node_modules",
      "@my",
      "work-front",
      "dist",
      filePath
    );
    const distFullPath = resolvePackagePath(
      pkgDirName,
      "dist",
      "public",
      "dist",
      filePath
    );
    const text = fs.readFileSync(srcFullPath, { encoding: "utf-8" });
    writeFile(distFullPath, text);
  });
};

/**
 *
 * @param pkgDirName 包名
 * @returns
 * @description 删除 dist 目录
 */
async function removeDist(pkgDirName: string) {
  const dist = resolvePackagePath(pkgDirName, "dist");
  if (fs.existsSync(dist) && fs.statSync(dist).isDirectory()) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
}
async function build(pkgDirName: string) {
  console.log("pkgDirName:", pkgDirName);
  await compileTsFiles(pkgDirName);
  await copyServerFiles(pkgDirName);
  await copyFrontFiles(pkgDirName);
}
(async () => {
  console.log("[TS] 开始编译 Node.js 项目···");
  await build("work-server");
  console.log("[TS] 编译所有 Node.js 项目成功！");
})();
