import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

const htmlPlugin = (txt = "") => {
  return {
    name: "html-transform",
    transformIndexHtml(html: string) {
      return html.replace(
        /<\/head>/,
        `<script>{try{window.KC_AUTH_SERVER = ${txt};}catch{console.log('Error KC_AUTH_SERVER');};}</script></head>`
      );
    }
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const plugins = [
    react({
      babel: {
        plugins: [["babel-plugin-styled-components", { displayName: true }]]
      }
    }),
    tsconfigPaths()
  ];
  if (mode === "development") {
    plugins.push(htmlPlugin(JSON.stringify(env.KC_AUTH_SERVER)));
  }
  const resolve = {
    alias: {
      src: "/src"
    }
  };

  const build = {
    outDir: "./dist",
    emptyOutDir: true,

    chunkSizeWarningLimit: 300,
    rollupOptions: {
      // output: {
      //   assetFileNames: (asset: any) => {
      //     if (parse(asset.name).name === "im2") {
      //       return "src/assers/[name][extname]";
      //     }
      //     return "assets/[name].[hash][extname]";
      //   }
      // }
      output: {
        manualChunks: {
          react: ["react", "react-dom/client"],
          vendors: ["axios", "mobx", "mobx-react-lite"],
          "styled-components": ["styled-components"],
          antd: ["antd"]
        }
      }
    }
  };

  return {
    plugins,
    resolve,
    build,

    // css: {
    //   preprocessorOptions: {
    //     less: {
    //       javascriptEnabled: true
    //     }
    //   }
    // },

    server: {
      port: 8088
    }
  };
});
