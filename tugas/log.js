const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode4 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-4",
  transporter: "NATS"
});

brokerNode4.createService({
  name: "log",
  mixins: [DbService],

  settings: {
    fields: ["_id", "name", "date"],
      entityValidator: {
				name: "string"
			}
   },

  actions: {
    listLogs: {
    	async handler(ctx) {
    		return this.logList();
    	}
    }
  },
  methods: {
    logList: () => {
      return new Promise((resolve) => {
        resolve([
          { name: "Apples", price: 5 },
          { name: "Oranges", price: 3 },
          { name: "Bananas", price: 2 }
        ]);
      });
    }
  }
  ,

  afterConnected() {
  	
  }
});

Promise.all([brokerNode3.start()]).then(() => {
  brokerNode3.repl();
});