const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

const gatewayBroker = new ServiceBroker({
  namespace: "dev",
  nodeID: "gateway-node",
  transporter: "NATS"
});

gatewayBroker.createService({
  name: "gateway",
  mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 9111,
    ip: "0.0.0.0",
    use: [],
    routes: [
      {
        path: "/",
        aliases: {
          "GET logs": "logger.listLogs",
          "POST logs": "logger.createLog",
					"GET users": "users.listUsers",
          "POST users": "users.createUsers",
					"GET users/id/:id": "users.getByIdUser",
					"GET users/name/:name": "users.getByNameUser",
					"DELETE users/:id": "users.removeUser",
					"GET transactions": "transaction.listTransactions",
          "POST transactions": "transaction.doTransaction",
					"POST topup": "transaction.topupTransaction"
        }
      }
    ]
  },
});

// Start brokers
Promise.all([gatewayBroker.start()]).then(() => {
  gatewayBroker.repl();
});