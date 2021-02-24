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
        return this.broker.call("users.find");
      },
    },
    createUsers: {
      async handler(ctx) {
        return this.broker.call("users.create", ctx.params);
      },
    },
  },
});

Promise.all([nodeUser.start()]).then(() => {
  nodeUser.repl();
});
