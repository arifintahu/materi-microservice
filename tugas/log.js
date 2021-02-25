const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

//LOGGING TERJADI SAAT ADA PERUBAHAN DI TRANSACTION MAUPUN USER
//  this.broker.call("log.createLogs", {
//   action: "the Action Name",
//   date: new Date(),
// });

const brokerNode4 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-4",
  transporter: "NATS"
});

brokerNode4.createService({
  name: "log",
  mixins: [DbService],

  settings: {
    fields: ["_id", "action", "date"],
   },

  actions: {
    createLogs: {
    	async handler(ctx) {
    		return this.broker.call("log.create", ctx.params);
    	}
    },
    listLogs: {
    	async handler(ctx) {
        return this.broker.call("log.find");
    	}
    }
  },
  afterConnected() {
  	
  }
});

Promise.all([brokerNode4.start()]).then(() => {
  brokerNode4.repl();
});