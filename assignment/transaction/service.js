const { ServiceBroker } = require('moleculer');
const HTTPServer = require('moleculer-web');
const DbService = require('moleculer-db');

const brokerNode1 = new ServiceBroker({
  namespace: 'dev',
  nodeID: 'node-3',
  transporter: 'NATS'
});

brokerNode1.createService({
  name: 'gateway',
  mixins: [HTTPServer],

  settings: {
    port: 7005,
    ip: '0.0.0.0',
    use: [],
    routes: [
      {
        path: '/transaction',
        aliases: {
          'POST create': 'transaction.createTransaction',
          'GET list': 'transaction.listTransaction',
        }  
      }          
    ],        
  }
});

const brokerNode2 = new ServiceBroker({
  namespace: 'dev',
  nodeID: 'node-4',
  transporter: "NATS"
});

brokerNode2.createService({
  name: 'transaction',
  mixins: [DbService],

  settings: {
    fields: ['_id', 'to', 'from', 'value'],
    entityValidator: {
      to: 'string',
      from: 'string',
      value: 'string',
    }
  },

  actions: {
    createTransaction: {
      async handler(ctx) {
        try {
          const to = await this.broker.call('users.get', { id: ctx.params.to });        
          if (to) {
            return this.broker.call('transaction.create', ctx.params);
          }      
        } catch (err) {
          return 'transaction failed, id penerima salah !!';          
        }
      }
    },
    listTransaction: {
      async handler(ctx) {      
        return this.broker.call('transaction.find', {});
      }
    }
  }
});

Promise.all([brokerNode1.start(), brokerNode2.start()]).then(() => {
  brokerNode1.repl();
  brokerNode2.repl();
});