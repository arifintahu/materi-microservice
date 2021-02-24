const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const logBroker = new ServiceBroker({
	namespace: "dev",
  nodeID: "logger-node",
  transporter: "NATS"
});

logBroker.createService({
  name: "logger",
  mixins: [DbService],

  settings: {
    fields: ["_id", "action", "date"],
		entityValidator: {
			action: "string"
		}
   },

  actions: {
    listLogs: {
    	async handler(ctx) {
    		return this.broker.call("logger.find", {});
    	}
    },
    createLog: {
    	async handler(ctx) {
				const datetime = new Date();
				const parameters = {action: ctx.params.action, date: datetime};
    		return this.broker.call("logger.create", parameters);
    	}
    }
  },
});

Promise.all([logBroker.start()]).then(() => {
  logBroker.repl();
});