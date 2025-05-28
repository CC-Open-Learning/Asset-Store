module.exports = {
  apps: [
    {
      name: "client-assetstore",
      script: "npm",
      args: "run start",
      cwd: "/home/shopkeeper/varlab-asset-store/client-portual",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "server-assetstore",
      cwd: "/home/shopkeeper/varlab-asset-store/server",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
