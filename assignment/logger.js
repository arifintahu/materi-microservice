const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerLogger = new ServiceBroker({
    namespace: "dev",
    nodeID: "logger-gateway",
    transporter: "NATS",
  });

  brokerLogger.createService({
    name: "loggers",
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
            return await this.broker.call("loggers.find",{}).then((res)=>{
                return res
            }).catch((err)=>{
                console.log(err);
            })
        }
      },
        createLog: {
            async handler(ctx) {
                return await this.broker.call("loggers.create", ctx.params).then((res) => {
                    return res;
                }).catch((err)=>{
                    console.log(err);
                })
            }
        },
    }
})

Promise.all([brokerLogger.start()]).then(()=>{
  brokerLogger.repl()
}) 