const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const nodeLogger = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-logger",
  transporter: "NATS",
});

nodeLogger.createService({
  name: "logger",
  mixins: [DbService],

  settings: {
    fields: ["_id", "action", "date"],
  },

  actions: {
    listLogger: {
      async handler(ctx) {
        return this.broker.call("logger.find");
      },
    },
    createLogger: {
      async handler(ctx) {
        return this.broker.call("logger.create", ctx.params);
      },
    },
  },
});

Promise.all([nodeLogger.start()]).then(() => {
  nodeLogger.repl();
});
