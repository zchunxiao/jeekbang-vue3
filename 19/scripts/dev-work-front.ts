import { createServer } from "vite";
import { resolvePackagePath } from "./util";
import pluginVue from "@vitejs/plugin-vue";
import pluginVueJsx from "@vitejs/plugin-vue-jsx";
import { watchBuildSSRCode } from "./build-work-front-ssr";
(async () => {
  const server = await createServer({
    configFile: false, // 不使用默认配置文件
    root: resolvePackagePath("work-front"), //"./", // 项目根目录
    plugins: [pluginVue(), pluginVueJsx()],
    server: {
      host: "127.0.0.1", // 主机
      port: 3100, // 端口
      open: true, // 自动打开浏览器,
      proxy: {
        "/api": {
          target: "http://localhost:3200", // 代理目标地址
          changeOrigin: true, // 是否改变源地址
        },
      },
    },
  });

  await server.listen(); // 启动服务器
  console.log(`Server is running at http://127.0.0.1:3100`); // 打印服务器地址

  // 可选：打印所有可用的 URL
  server.printUrls();

  watchBuildSSRCode();
})();
