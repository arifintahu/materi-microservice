const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode2 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-2",
  transporter: "NATS",
});

brokerNode2.createService({
  name: "users",
  mixins: [DbService],

  settings: {
    fields: ["_id", "name", "email", "address"],
    entityValidator: {
      name: "string",
      email: "string",
      address: "string",
    },
  },

  actions: {
    addUser: {
      async handler(ctx) {
        return this.broker.call("users.create", ctx.params).then((res) => {
          this.broker.call("loggers.createLog", {
            action: "add user",
          });

          return res;
        });
      },
    },

    listUsers: {
      async handler(ctx) {
        return this.broker.call("users.find", {});
      },
    },

    getUser: {
      async handler(ctx) {
        return this.broker.call("users.get", ctx.params);
      }
    },

    deleteUser: {
      async handler(ctx) {
        return this.broker.call("users.remove", ctx.params).then((res) => {
          this.broker.call("loggers.createLog", {
            action: "delete user",
          });

          return res;
        });
      },
    },
  },

  afterConnected() {},
});

Promise.all([brokerNode2.start()]).then(() => {
  brokerNode2.repl();
});
