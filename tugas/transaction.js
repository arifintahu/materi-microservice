const { ServiceBroker } = require('moleculer');
const DbService = require('moleculer-db');

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
          return { status: 'error', message: 'Id parse error' };
        }
        
        return this.update(id,data)
      },
    },
  },
  methods : {
    add: function (data) {
      const trans = {
        '_id' :data._id,
        'to'  :data.to,
        'from':data?.from,
        'value':data.value,
      }
      console.log(trans)
      if(!trans._id || !trans.to || !trans.value ){
        return { status: 'error', message: 'data invalid' };
      }

      return this.broker
          .call('transaction.create',trans)
          .then((trans) => {
            return trans;
          })
          .catch();
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
          .then(() => {
            return { status: 'success', message: 'Success Update Data' };
          })
          .catch(() => {
            return { status: 'error', message: 'Error Update Data' };
          });
      }
      return { status: 'error', message: 'Id not found' };
        
    }

  },

  afterConnected() {},
});

Promise.all([transactionNode.start()]).then(() => {
  transactionNode.repl();
});
