const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const HTTPServer = require('moleculer-web');

const brokerNode1 = new ServiceBroker({
  namespace: 'dev',
  nodeID: 'node-5',
  transporter: 'NATS'
});

brokerNode1.createService({
  name: 'gateway',
  mixins: [HTTPServer],

  settings: {
    port: 7006,
    ip: '0.0.0.0',
    use: [],
    routes: [
      {
        path: '/logger',
        aliases: {
          'GET list': 'logger.listLog',          
        }  
      }          
    ],        
  }
});

const brokerLogger = new ServiceBroker({
    namespace: "dev",
    nodeID: "node-logger",
    transporter: "NATS",
  });

  brokerLogger.createService({
    name: "logger",
    mixins: [DbService],

    settings: {
        fields: ["_id","action", "date"],
        entityValidator: {
          action: 'string',
          date: 'string',
        }
    },

    actions: {
      listLog: {
        async handler(ctx){
            return await this.broker.call("logger.find",{}).then((res)=>{
                return res
            }).catch((err)=>{
                console.log(err);
            })
        }
      },
      createLog: {
        async handler(ctx) {
          return await this.broker.call("logger.create", ctx.params).then((res) => {
              return res;
          }).catch((err)=>{
              console.log(err);
          })
        }
      },
    },
})

Promise.all([brokerLogger.start(), brokerNode1.start()]).then(() => {
  brokerLogger.repl();
  brokerNode1.repl();
}) 