const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

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
    afterConnected(){

    }
})

Promise.all([brokerLogger.start()]).then(()=>{
  brokerLogger.repl()
}) 