import fs from "node:fs";
import { resolvePackagePath } from "./util";
import glob from "fast-glob";
import { rollup } from "rollup";
import VueMacros from "unplugin-vue-macros/rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import esbuild from "rollup-plugin-esbuild";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import type { OutputOptions } from "rollup";

const getExternal = async (pkgDirName: string) => {
  const pkgPath = resolvePackagePath(pkgDirName, "package.json");
  //console.log("pkgPath:", pkgPath);
  const mainfest = require(pkgPath) as any;
  //console.log("mainfest:", mainfest);
  const {
    dependencies = {},
    peerDependencies = {},
    devDependencies = {},
  } = mainfest;
  const deps: string[] = [
    ...new Set([
      ...Object.keys(dependencies),
      ...Object.keys(peerDependencies),
      ...Object.keys(devDependencies),
    ]),
  ];
  console.log("deps:", deps);
  /**
   * 该方法是一个返回函数的高阶函数
   * 返回一个函数，该函数接收一个参数id，类型为string
   * if (id.endsWith(".less")) { return true; }
   * 这行代码检查传入的 id 是否以 .less 结尾。如果是，则返回 true，表示该 id 是符合条件的。
   * return deps.some((pkg) => id === pkg || id.startsWith(${pkg}/));
   * 这里使用了 Array.prototype.some 方法来检查 deps 数组中的每一个 pkg。
   * id === pkg：检查 id 是否与当前的 pkg 完全相同。
   * id.startsWith(${pkg}/)：检查 id 是否以当前 pkg 加上斜杠 / 开头。这通常用于识别模块的子路径，表示 id 是 pkg 的一部分。
   */
  return (id: string) => {
    if (id.endsWith(".less")) {
      return true;
    }
    return deps.some((pkg) => id === pkg || id.startsWith(`${pkg}/`));
  };
};

async function build(pkgDirName: string) {
  const pkgDistPath = resolvePackagePath(pkgDirName, "dist");
  if (fs.existsSync(pkgDistPath) && fs.statSync(pkgDistPath).isDirectory()) {
    fs.rmSync(pkgDistPath, { recursive: true });
  }
  const input = await glob(["**/*.{js,jsx,ts,tsx,vue}", "!node_modules"], {
    cwd: resolvePackagePath(pkgDirName, "src"),
    absolute: true,
    onlyFiles: true,
  });

  const bundle = await rollup({
    input,
    plugins: [
      VueMacros({
        setupComponent: false,
        setupSFC: false,
        plugins: {
          vue: vue({
            isProduction: true,
          }),
          vueJsx: vueJsx(),
        },
      }),
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
    /**
     * external是需要排除在bundle之外的模块
     */
    external: await getExternal(pkgDirName),
    treeshake: false,
  });
  const options: OutputOptions[] = [
    {
      format: "cjs",
      dir: resolvePackagePath(pkgDirName, "dist", "cjs"),
      exports: "named",
      preserveModules: true,
      preserveModulesRoot: resolvePackagePath(pkgDirName, "src"),
      sourcemap: true,
      entryFileNames: "[name].cjs",
    },
    {
      format: "esm",
      dir: resolvePackagePath(pkgDirName, "dist", "esm"),
      exports: undefined,
      preserveModules: true,
      preserveModulesRoot: resolvePackagePath(pkgDirName, "src"),
      sourcemap: true,
      entryFileNames: "[name].mjs",
    },
  ];
  return Promise.all(options.map((option) => bundle.write(option)));
}
(async () => {
  console.log("[TS] 开始编译所有子模块···");
  await build("components");
  await build("business");
  console.log("[TS] 编译所有子模块成功！");
})();
