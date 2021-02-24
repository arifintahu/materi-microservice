const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");
const DbService = require("moleculer-db");

const brokerNode1 = new ServiceBroker({
  namespace: "dev",
  nodeID: "logger-gateway",
  transporter: "NATS",
});

brokerNode1.createService({
  name: "loggerGateway",
  mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 3002,
    ip: "0.0.0.0",
    use: [],
    routes: [
      {
        path: "/",
        aliases: {
          "GET list": "logs.list",
        },
      },
    ],
  },
});

const brokerNode2 = new ServiceBroker({
  namespace: "dev",
  nodeID: "logger",
  transporter: "NATS",
});

brokerNode2.createService({
  name: "logs",
  mixins: [DbService],

  settings: {
    fields: ["_id", "action", "date"],
    entityValidator: {
      action: "string",
    },
  },

  actions: {
    list: {
      async handler(ctx) {
        return this.broker.call("logs.find", {});
      },
    },
    add: {
      async handler(ctx) {
        return this.broker.call("logs.create", {
          action: ctx.params,
          date: new Date(),
        });
      },
    },
  },

  afterConnected() {},
});

// Start both brokers
Promise.all([brokerNode1.start()], [brokerNode2.start()]).then(() => {
  brokerNode1.repl();
  brokerNode2.repl();
});
