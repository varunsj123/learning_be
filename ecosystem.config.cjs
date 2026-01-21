module.exports = {
    apps: [
        {
            name: "new-be",
            script: "server.js",
            instances: "max",
            exec_mode: "cluster",
            env: {
                NODE_ENV: "development",
            },
            env_production: {
                NODE_ENV: "production",
            },
            watch: true,
            ignore_watch: ["node_modules", "logs"],
        },
    ],
};
