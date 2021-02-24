const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const nodeUser = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-user",
  transporter: "NATS",
});

nodeUser.createService({
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
    listUsers: {
      async handler(ctx) {
        return this.broker.call("users.find", {});
      },
    },
    createUsers: {
      async handler(ctx) {
        return this.broker.call("users.create", ctx.params).then(async (res) => {
          await this.broker.call("logger.createLogger", {
            action: `Create_User ${ctx.params.name}`,
            date: new Date(),
          });
          return res;
        });
      },
    },
    removeUsers: {
      async handler(ctx) {
        return this.broker.call("users.remove", {id: 1}).then(async (res) => {
          await this.broker.call("logger.createLogger", {
            action: `Delete_User ${ctx.params._id}`,
            date: new Date(),
          });
          return res;
        });
      }
    }
  },
});

Promise.all([nodeUser.start()]).then(() => {
  nodeUser.repl();
});

