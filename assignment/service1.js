const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNode1 = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-1",
  transporter: "NATS"
});

brokerNode1.createService({
  name: "transaction",
  mixins: [DbService],

  settings: {
    fields: ["_id", "to", "from", "value"],
      entityValidator: {
				to: "string",
                from: "string",
			}
   },

  actions: {
    listTransaction: {
    	async handler(ctx) {
    		return this.broker.call("transaction.find", {});
    	}
    },
    getTransaction: {
        params: {
            id: { type: "string" }
        },

    	async handler(ctx) {
            const id = ctx.params.id;
    		return this.broker.call("transaction.get", { id: id });
    	}
    },
    createTransaction: {
        params: {
              to: { type: "string"},
              from: { type: "string"},
              value: {type: "string"}
            },
    	async handler(ctx) {
    		return this.broker.call("transaction.create", ctx.params).then((res) => {
          this.broker.call("loggers.createLog", {
            action: "add transaction",
            date: new Date(),
          });
          return res;
        });
    	}
    },
    deleteTransaction: {
        params: {
            id: { type: "string" }
        },

    	async handler(ctx) {
    		return this.broker.call("transaction.remove", { id: ctx.params.id }).then((res) => {
          this.broker.call("loggers.createLog", {
            action: "delete transaction",
            date: new Date(),
          });

          return res;
        })
    	}
    },
    updateTransaction: {
         params: {
              to: { type: "string", optional: true} ,
              from: { type: "string", optional: true},
              value: {type: "string", optional: true}
            },
    	async handler(ctx) {
    		return this.broker.call("transaction.update", ctx.params).then((res) => {
          this.broker.call("loggers.createLog", {
            action: "update transaction from id "+ctx.params.id,
            date: new Date(),
          });

          return res;
        })
    	}
    },
  },

  afterConnected() {
  	
  }
});

Promise.all([brokerNode1.start()]).then(() => {
  brokerNode1.repl();
});