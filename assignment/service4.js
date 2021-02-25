const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");
const { config } = require("./config");

const brokerNode4 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-4",
  transporter: "NATS",
});

brokerNode4.createService({
  name: "gateway",
  mixins: [HTTPServer],

  settings: {
    port: config.server?.port,
    ip: "0.0.0.0",
    use: [],
    routes: [
      {
        path: "/api",
        aliases: {
          "GET transaction": "transaction.listTransaction",
          "GET transaction/:id": "transaction.getTransaction",
          "POST transaction": "transaction.createTransaction",
          "DELETE transaction/:id": "transaction.deleteTransaction",
          "PUT transaction/:id": "transaction.updateTransaction",
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
