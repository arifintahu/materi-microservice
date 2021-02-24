const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");
const DbService = require("moleculer-db");

const brokerNode1 = new ServiceBroker({
    namespace: "dev",
    nodeID: "logger-gateway",
    transporter: "NATS",
  });