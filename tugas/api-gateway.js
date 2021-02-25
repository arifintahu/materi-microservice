const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

const brokerNode1 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-1",
  transporter: "NATS",
});

brokerNode1.createService({
  name: "gateway",
  mergeParams: false,
  mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 3001,
    ip: "0.0.0.0",
    use: [],
    routes: [
      {
        path: "/api",
        mergeParams: false,
        aliases: {   
          "GET users": "users.listUsers",
          "POST users": "users.createUser",
          "PUT users": "users.updateUsers",
          "GET transactions": "transaction.listTransaction",
          "POST transactions": "transaction.addTransaction",
          "GET log": "log.listLogs",
        }
      }
    ]
  },

  actions: {
    home: {
      async handler() {
        return "My Home";
      },
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
}); //batas api gateway

// Start brokers
Promise.all([brokerNode1.start()]).then(() => {
  brokerNode1.repl();
});
