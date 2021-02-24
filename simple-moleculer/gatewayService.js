const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

const brokerNode1 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-gateway",
  transporter: "NATS"
});

brokerNode1.createService({
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
          "GET users": "users.listUsers",
          "GET user": "users.getUser",
          "POST users": "users.createUsers",
          "PUT users": "users.updateUsers",
          "DELETE users": "users.deleteUsers",
          "POST loggers": "loggers.createLog",
          "GET loggers": "loggers.listLog"
          "GET transaction": "transaction.listTransaction",
          "POST transaction": "transaction.createTransaction",
          "DELETE transaction": "transaction.deleteTransaction",
        }
      }
    ]
  },

  actions: {
    home: {
        async handler() {
            return "My Home";
        }
    },
    welcome: {
        params: {
            name: "string"
        },
        async handler(ctx) {
            return `Welcome, ${ctx.params.name}`;
        }
    }
  }
});

// Start both brokers
Promise.all([brokerNode1.start()]).then(() => {
  brokerNode1.repl();
});