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
            try {
							// pengecekan to
							let idTo = await this.broker.call("users.getByIdUser", {id: ctx.params.to});
							if(idTo.type === null){
								const nameTo = await this.broker.call("users.getByNameUser", {name: ctx.params.to});
								if(!nameTo[0]){
									return("error penerima tidak ditemukan");
								} else {
									idTo = nameTo[0];
								}
							}
							// pengecekan from
							let idFrom = await this.broker.call("users.getByIdUser", {id: ctx.params.from});
							if(idFrom.type === null){
								const nameFrom = await this.broker.call("users.getByNameUser", {name: ctx.params.from});
								if(!nameFrom[0]){
									return("error pengirim tidak ditemukan");
								} else {
									idFrom = nameFrom[0];
								}
							}
							// create parameters
							const parameters = {to: idTo._id, from: idFrom._id, value: ctx.params.value};
							const response = await this.broker.call("transaction.create", parameters);
							const log = await this.broker.call("logger.createLog", {action: "create transaction"});
							return response;
						} catch (err) {
							return err;
						}
          }
        },
				topupTransaction: {
          async handler(ctx) {
            try {
							// pengecekan to
							let idTo = await this.broker.call("users.getByIdUser", {id: ctx.params.to});
							if(idTo.type === null){
								const nameTo = await this.broker.call("users.getByNameUser", {name: ctx.params.to});
								if(!nameTo[0]){
									return("error penerima tidak ditemukan");
								} else {
									idTo = nameTo[0];
								}
							}
							// create parameters
							const parameters = {to: idTo._id, from: "topup", value: ctx.params.value};
							const response = await this.broker.call("transaction.create", parameters);
							const log = await this.broker.call("logger.createLog", {action: "topup transaction"});
							return response;
						} catch (err) {
							return err;
						}
          }
        },
				listTransactions: {
          async handler(ctx) {
              try {
                const response = await this.broker.call("transaction.find", {});
                const log = await this.broker.call("logger.createLog", {action: "list transaction"});
                return response;
              } catch (err) {
                return err;
              }
          }
				}
      }
})

Promise.all([brokerNode1.start()]).then(() => {
	brokerNode1.repl();
});