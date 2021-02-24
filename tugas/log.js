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
    fields: ["_id", "action", "date"],
      entityValidator: {
				name: "string"
			}
   },

  actions: {
    createLogs: {
    	async handler(ctx) {
            let mantap="ini";
    		return this.broker.call('log.create', ctx.params);
    	}
    },
    listLogs: {
    	async handler(ctx) {
    		return this.logList(ctx);
            return this.broker.call("log.find", {})
    	}
    }
  },
  // methods: {
      
  //   createLogs: (mantap) => {
        
  //     return new Promise((resolve) => {
          
  //       resolve(mantap);
  //     });
  //   },

  //   logList: (ctx) => {
  //       let _id=mantap;
  //       let action="delete";
  //       let date =new Date()
  //       return new Promise((resolve) => {
  //         resolve([
  //             {_id,action,date}
  //           ]);
  //       });
  //     }

  // }
  // ,

  afterConnected() {
  	
  }
});

Promise.all([brokerNode4.start()]).then(() => {
  brokerNode4.repl();
});