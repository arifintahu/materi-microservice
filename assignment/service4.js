const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

const brokerNode4 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-4",
  transporter: "NATS",
});

brokerNode4.createService({
  name: "gateway",
  mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 3000,
    ip: "0.0.0.0",
    use: [],
    routes: [
      {
        path: "/api",
        aliases: {
          "POST users": "users.addUser",
          "GET users": "users.listUsers",
          "DELETE users": "users.deleteUser",
          "GET loggers": "loggers.listLogs",
        },
      },
    ],
  },

  actions: {
    home: {
      async handler() {
        return "My Home";
      },
    },
  },
});

Promise.all([brokerNode4.start()]).then(() => {
  brokerNode4.repl();
});
