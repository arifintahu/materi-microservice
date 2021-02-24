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
          "GET products": "products.listProducts",
          "GET users": "users.listUsers",
          "POST users": "users.createUsers",
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