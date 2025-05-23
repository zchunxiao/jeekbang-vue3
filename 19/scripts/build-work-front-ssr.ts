import { resolvePackagePath } from "./util";
import glob from "fast-glob";
import path from "path";
import type { UserConfig } from "vite";
import pluginVue from "@vitejs/plugin-vue";
import pluginVueJsx from "@vitejs/plugin-vue-jsx";
import { build } from "vite";
import fs from "node:fs";
export const getSSRPageInputs = async (): Promise<string[]> => {
  const ssrBaseSrcPath = resolvePackagePath("work-front", "src", "ssr");
  const inputs = await glob(["pages/*/index.ts", "index.ts"], {
    cwd: ssrBaseSrcPath,
    absolute: false,
    onlyFiles: true,
  });
  return inputs;
};

async function buildFile(input: string) {
  const ssrPath = resolvePackagePath("work-front", "src", "ssr", input);
  const ssrDistDirPath = path.dirname(
    resolvePackagePath("work-front", "dist", "ssr", input)
  );
  const config: UserConfig = {
    plugins: [pluginVue(), pluginVueJsx()],
    build: {
      minify: false,
      lib: {
        entry: ssrPath,
        formats: ["cjs"],
        fileName: () => {
          return "index.js";
        },
      },
      outDir: ssrDistDirPath,
      rollupOptions: {
        external: ["vue", "node:fs", "node:path"],
        output: {
          assetFileNames: "index[extname]",
        },
      },
    },
  };
  console.log("开始编译前端项目页面SSR代码");
  await build(config);
}

export const buildSSRCode = async () => {
  const inputs = await getSSRPageInputs();
  console.log("inputs:", inputs);
  for (let i = 0, len = inputs.length; i < len; i++) {
    const input = inputs[i];
    await buildFile(input);
  }
};

export function watchBuildSSRCode(
  callback?: (eventType: string, filename: string) => void
) {
  const ssrPath = resolvePackagePath("work-front", "src", "ssr");
  try {
    buildSSRCode();
  } catch (err) {
    console.log(err);
  }
  console.log("[开发模式] 编译前端项目页面SSR代码");
  fs.watch(
    ssrPath,
    {
      recursive: true,
    },
    (eventType: string, filename: string) => {
      console.log(`修改了文件 ${filename}，等待重新编译SSR代码`);
      try {
        buildSSRCode();
      } catch (err) {
        console.log(err);
      }
      if (typeof callback === "function") {
        callback(eventType, filename);
      }
    }
  );
}
