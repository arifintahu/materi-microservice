const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode3 = new ServiceBroker({
	namespace: "dev",
  nodeID: "node-3",
  transporter: "NATS"
});

brokerNode3.createService({
  name: "users",
  mixins: [DbService],

  settings: {
    fields: ["_id", "name", "age"],
      entityValidator: {
				name: "string"
			}
   },

  actions: {
    listUsers: {
    	async handler(ctx) {
    		return this.broker.call("users.find", {});
    	}
    },
    createUsers: {
    	async handler(ctx) {
    		return this.broker.call("users.create", ctx.params);
    	}
    }
  },

  afterConnected() {
  	
  }
});

Promise.all([brokerNode3.start()]).then(() => {
  brokerNode3.repl();
});