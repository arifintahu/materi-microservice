const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");
const DbService = require("moleculer-db");

const brokerNode1 = new ServiceBroker({
  namespace: "dev",
  nodeID: "transaction-gateway",
  transporter: "NATS",
});

brokerNode1.createService({
  name: "transactionGateway",
  mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 3001,
    ip: "0.0.0.0",
    use: [],
    routes: [
      {
        path: "/",
        aliases: {
          "GET list": "transactions.list",
          "POST add": "transactions.add",
        },
      },
    ],
  },
});

const brokerNode2 = new ServiceBroker({
  namespace: "dev",
  nodeID: "transaction",
  transporter: "NATS",
});

brokerNode2.createService({
  name: "transactions",
  mixins: [DbService],

  settings: {
    fields: ["_id", "to", "from", "value"],
    entityValidator: {
      to: "string",
      value: "string",
    },
  },

  actions: {
    list: {
      async handler(ctx) {
        this.broker.call("logs.add", "get transaction list");
        return this.broker.call("transactions.find", {});
      },
    },
    add: {
      async handler(ctx) {
        const to = await this.broker.call("users.userInfo", ctx.params.to);
        if (to) {
          this.broker.call("logs.add", "add new transaction");
          return this.broker.call("transactions.create", ctx.params);
        } else {
          return "user tidak ditemukan";
        }
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
