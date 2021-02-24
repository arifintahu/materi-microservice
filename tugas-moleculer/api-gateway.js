const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

const nodeApi = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-api",
  transporter: "NATS",
});

nodeApi.createService({
  name: "gateway",
  mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 3333,
    ip: "127.0.0.1",
    use: [],
    routes: [
      {
        path: "/api",
        aliases: {
          "GET users": "users.listUsers",
          "POST users": "users.createUsers",
          "GET transaction": "transaction.listTransaction",
          "POST transaction": "transaction.createTransaction",
          "GET logger": "logger.listLogger",
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
    welcome: {
      params: {
        name: "string",
      },
      async handler(ctx) {
        return `Welcome, ${ctx.params.name}`;
      },
    },
  },
});


Promise.all([nodeApi.start()]).then(() => {
  nodeApi.repl();
});