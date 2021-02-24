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
          return this.broker.call("transaction.create", ctx.params).then(async (res) => {
            await this.broker.call("logger.createLogger", {
              action: `Transaction_added_with_value ${ctx.params.value}`,
              date: new Date(),
            });
            return res;
          });
        }
        return "user id tidak ditemukan";
      },
    },

    removeTransaction: {
      async handler(ctx) {
        return this.broker.call("transaction.remove", {id: 1}).then(async (res) => {
          await this.broker.call("logger.createLogger", {
            action: `Transaction_deleted_with_id ${ctx.params.id}`,
            date: new Date(),
          });
          return res;
        });
      }
    },
  },
});


Promise.all([brokerNode.start()]).then(() => {
  brokerNode.repl();
});
