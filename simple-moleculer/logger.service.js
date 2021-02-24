const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");

const brokerNodeLogger = new ServiceBroker({
    namespace: "dev",
    nodeID: "node-loggers",
    transporter: "NATS"
})

brokerNodeLogger.createService({
    name: "loggers",
    mixins: [DbService],

    settings: {
        fields: ["action", "date"],
        entityValidator: {
            action: "string",
            date: "string"
        }
    },

    actions: {
        createLog: {
            async handler(ctx) {
                return await this.broker.call("loggers.create", ctx.params).then((res) => {
                    console.log('logged')
                    return res;
                }).catch((err)=>{
                    console.log(err);
                })
            }
        },

        listLog: {
            async handler(ctx){
                return await this.broker.call("loggers.find",{}).then((res)=>{
                    console.log('berhasil menampilkan');
                    return res
                }).catch((err)=>{
                    console.log(err);
                })
            }
        }
    },

    afterConnected(){

    }
})

Promise.all([brokerNodeLogger.start()]).then(()=>{
    brokerNodeLogger.repl()
})