const { ServiceBroker } = require("moleculer");
const HTTPServer = require("moleculer-web");
const DbService = require("moleculer-db");

const brokerNode1 = new ServiceBroker({
    namespace: "dev",
    nodeID: "broker-1",
    transporter: "NATS",    
})

brokerNode1.createService({
    name: 'transaction',
    mixins : [DbService],
    settings: {
        fields: ["_id", "to", "from", 'value'],
          entityValidator: {
                    to: "string",
                    from : 'string'
                }
       },
    actions: {
        doTransaction: {
          async handler(ctx) {
            return this.broker.call("transaction.create", ctx.params);
          }
        },
      },
    
})

const brokerNode2 = new ServiceBroker({
    namespace: "dev",
    nodeID: "broker-2",
    transporter: "NATS",    
})


brokerNode2.createService({
    name: 'gateway',
    mixins: [HTTPServer],

  settings: {
    port: process.env.PORT || 5000,
    ip: "0.0.0.0",
    version: 1,
    $noVersionPrefix : true,
    use: [],
    routes: [
      {
        path: "/",
        aliases: {
          "POST transaction": "transaction.doTransaction"          
        }
      }
    ]
  },
})

Promise.all([brokerNode1.start(),brokerNode2.start() ]).then(() => {
    brokerNode2.repl();
  });