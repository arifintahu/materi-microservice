const { ServiceBroker } = require('moleculer');
const DbService = require('moleculer-db');
const MESSAGE_ID_PARSE_ERROR = 'id parse error' ;
const MESSAGE_DATA_INVALID =  'data invalid'  ;
const MESSAGE_USER_SOURCE_NOT_FOUND = 'data pengirim tidak ditemukan';
const MESSAGE_USER_DESTINATION_NOT_FOUND = 'data penerima tidak ditemukan';
const MESSAGE_FAILED_CREATE_TRANSACTION = 'failed create transaction';
const MESSAGE_ERROR_UPDATE_TRANSACTION =  'error update transaction';


const transactionNode = new ServiceBroker({
  namespace: 'dev',
  nodeID: 'node-3',
  transporter: 'NATS',
});

transactionNode.createService({
  name: 'transaction',
  mixins: [DbService],

  settings: {
    fields: ['_id', 'to', 'from', 'value'],
  },

  actions: {
    listTransaction: {
      async handler(ctx) {
        return this.list();
      },
    },
    addTransaction: {
      async handler(ctx) {
        return this.add(ctx.params.body);
      },
    },
    updateTransaction: {
      async handler(ctx) {
        const id = parseInt(ctx.params.query?.id,10);
        const data = ctx.params.body;
        if (!id) {
          return { status: 'error', message: MESSAGE_ID_PARSE_ERROR};
        }
        
        return this.update(id,data)
      },
    },
  },
  methods : {
    add: async function (data) {
      const trans = {
        '_id' :data._id,
        'to'  :data.to,
        'from':data?.from,
        'value':data.value,
      }
      if(!trans._id || !trans.to || !trans.value ){
        await this.broker.call("log.createLogs", {
          action: `ERROR : ${MESSAGE_DATA_INVALID}`,
          date: new Date(),
        });
        return { status: 'error', message: MESSAGE_DATA_INVALID};
      }

      if(trans.from){
        const userSource = await this.broker.call("users.listUsers", {query : {id:trans.from}})
        if(!userSource.status){
          await this.broker.call("log.createLogs", {
            action: `ERROR : ${MESSAGE_USER_SOURCE_NOT_FOUND}`,
            date: new Date(),
          });
          return { status: 'error', message:  MESSAGE_USER_SOURCE_NOT_FOUND};
        }
      }

      const userDestination = await this.broker.call("users.listUsers", {query : {id:trans.from}})
      if(!userDestination.status){
        await this.broker.call("log.createLogs", {
          action: `ERROR : ${MESSAGE_USER_DESTINATION_NOT_FOUND}`,
          date: new Date(),
        });
        return { status: 'error', message: MESSAGE_USER_DESTINATION_NOT_FOUND };
      }

      return this.broker
          .call('transaction.create',trans)
          .then(async (trans) => {
            await this.broker.call("log.createLogs", {
                action: "SUCCESS : create transaction",
                date: new Date(),
            });
            return trans;
          })
          .catch(async ()=>{
            await this.broker.call("log.createLogs", {
              action: `ERROR : ${ MESSAGE_FAILED_CREATE_TRANSACTION }`,
              date: new Date(),
            });
            return { status: 'error', message:  MESSAGE_FAILED_CREATE_TRANSACTION};
          });
    },
    list: function(){
      return this.broker
          .call('transaction.find', {})
          .then((trans) => {
            return trans;
          })
          .catch();
    },
    update: async function(id,data){
      
      const trans = await this.adapter.findOne({ _id: id });
      if (trans) {
        return this.adapter.db
          .update({ _id: id }, { $set: data })
          .then(async () => {
            await this.broker.call("log.createLogs", {
                action: "SUCCESS :  update transaction",
                date: new Date(),
            });
            return { status: 'success', message: 'Success Update Data' };
          })
          .catch(async () => {
            await this.broker.call("log.createLogs", {
              action: `ERROR :  ${MESSAGE_ERROR_UPDATE_TRANSACTION}`,
              date: new Date(),
            });
            return { status: 'error', message: MESSAGE_ERROR_UPDATE_TRANSACTION };
          });
      }
      await this.broker.call("log.createLogs", {
        action: "error update transaction, id not found",
        date: new Date(),
      });
      return { status: 'error', message: 'Id not found' };
        
    }

  },

  afterConnected() {},
});

Promise.all([transactionNode.start()]).then(() => {
  transactionNode.repl();
});
