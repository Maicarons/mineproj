export default {
  configFile: false,
  logLevel: 'warn',
  build: {
    outDir: "G:\\GitHub\\mineproj\\examples\\basic\\dist\\@mp",
    emptyOutDir: false,
    minify: true,
    rollupOptions: {
      input: "G:\\GitHub\\mineproj\\examples\\basic\\.mineproj\\tmp\\mp-islands.entry.ts",
      output: { entryFileNames: 'islands.js', format: 'es' },
    },
  },
};
