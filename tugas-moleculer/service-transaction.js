const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-transaction",
  transporter: "NATS",
});

brokerNode.createService({
  name: "transaction",
  mixins: [DbService],

  settings: {
    fields: ["_id", "to", "from", "value"],
  },

  actions: {
    listTransaction: {
      async handler(ctx) {
        return this.broker.call("transaction.find");
      },
    },

    createTransaction: {
      async handler(ctx) {
        const listUsers = await this.broker.call("users.listUsers");
        let from = false;
        let to = false;
        for (let i = 0; i < listUsers.length; i++) {
          if (listUsers[i]["_id"] == ctx.params.from) {
            from = true;
          }
          if (listUsers[i]["_id"] == ctx.params.to) {
            to = true;
          }
        }
        if (from && to) {
          return this.broker.call("transaction.create", ctx.params);
        }
        return "user id tidak ditemukan";
      },
    },
  },
});

Promise.all([brokerNode.start()]).then(() => {
  brokerNode.repl();
});
