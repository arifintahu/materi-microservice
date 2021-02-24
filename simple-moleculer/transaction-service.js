const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");

const brokerNodeTransaction = new ServiceBroker({
  namespace: "dev",
  nodeID: "node-transaction",
  transporter: "NATS"
});

brokerNodeTransaction.createService({
    name: "transaction",
    mixins: [DbService],
  
    settings: {
      fields: ["_id", "to", "from", "value"],
        entityValidator: {
                  name: "string"
              }
     },
  
    actions: {
        listTransaction: {
            async handler(ctx) {
                this.broker.call("transaction.find", {}).then((res) => {
                    this.broker.call("logger.create", {})
                });
            }
        },
        createTransaction: {
            async handler(ctx) {
                this.broker.call("transaction.create", ctx.params).then((res) => {
                    this.broker.call("logger.create", {})
                });;
            }
        },
        deleteTransaction: {
            async handler(ctx) {
                this.broker.call("transaction.remove", { id }).then((res) => {
                    this.broker.call("logger.create", {})
                });
            }
        }
    },
  
    afterConnected() {
        
    }
  });
  
  Promise.all([brokerNodeTransaction.start()]).then(() => {
    brokerNodeTransaction.repl();
  });