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
      // belum berhasil
      async handler(ctx) {
        if (ctx.params.from) {
          const listUsers = this.broker.call("users.listUsers");
          console.log(listUsers);
          if (listUsers) {
            for (let i = 0; i < listUsers.length; i++) {
              if (ctx.params.from == listUsers[i]["_id"]) {
                if (!ctx.params.to)
                  return this.broker.call("transaction.create", ctx.params);
                for (let i = 0; i < listUsers.length; i++) {
                  if (ctx.params.to == listUsers[i]["_id"])
                    return this.broker.call("transaction.create", ctx.params);
                }
              }
            }
          }
        }
        return;
      },
    },
  },
});

Promise.all([brokerNode.start()]).then(() => {
  brokerNode.repl();
});
