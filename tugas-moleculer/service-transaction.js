const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode = new ServiceBroker({
  namespace: "dev",
  node: "node-transaction",
  transporter: "NATS",
});

brokerNode.createService({
  name: "transaction",
  mixins: [DbService],

  settings: {
    fields: ["_id", "to", "from", "value"],
    entityValidator: {
      name: "string",
    },
  },

  actions: {
    listTransaction: {
      async handler(ctx) {
        return this.broker.call("transaction.find");
      },
    },

    createTransaction: {
      async handler(ctx) {
        if (ctx.params.from) {
          return this.broker.call("transaction.create", ctx.params);
        }
        return;
      },
    },
  },
});

Promise.all([brokerNode.start()]).then(() => {
  brokerNode.repl();
});
