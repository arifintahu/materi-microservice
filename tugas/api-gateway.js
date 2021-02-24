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
        aliases: {
          "GET users"(req, res) {
            this.broker.call("users.listUsers", {}).then((response) => {
              res.end(JSON.stringify(response));
            });
          },
          "POST users"(req, res) {
            this.broker.call("users.createUser", req.body).then((response) => {
              res.end(JSON.stringify(response));
            });
          },
          "PUT users"(req, res) {
            this.broker.call("users.updateUser", req.body).then((response) => {
              res.end(JSON.stringify(response));
            });
          },
          "DELETE users"(req, res) {
            this.broker.call("users.deleteUser", req.query).then((response) => {
              res.end(JSON.stringify(response));
            });
          },
          "GET transactions"(req, res) {
            this.broker
              .call("transactions.listTransaction", {})
              .then((response) => {
                res.end(JSON.stringify(response));
              });
          },
          "POST transactions"(req, res) {
            this.broker
              .call("transactions.createTransaction", {})
              .then((response) => {
                res.end(JSON.stringify(response));
              });
          },
          "GET log"(req, res) {
            this.broker.call("log.listLog", {}).then((response) => {
              res.end(JSON.stringify(response));
            });
          },
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
}); //batas api

// Start brokers
Promise.all([brokerNode1.start()]).then(() => {
  brokerNode1.repl();
});
