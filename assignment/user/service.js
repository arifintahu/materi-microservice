const { ServiceBroker } = require('moleculer');
const HTTPServer = require('moleculer-web');
const DbService = require("moleculer-db");

const brokerNode1 = new ServiceBroker({
  namespace: 'dev',
  nodeID: 'node-1',
  transporter: 'NATS'
});

brokerNode1.createService({
  name: 'gateway',
  mixins: [HTTPServer],

  settings: {
    port: 7004,
    ip: '0.0.0.0',
    use: [],
    routes: [
      {
        path: '/users',
        aliases: {
          'GET list': 'users.listUsers',
          'POST create': 'users.createUsers',
          'GET info': 'users.getUsers',
          'DELETE remove': 'users.removeUsers',
          'PUT update': 'users.updateUsers',
        }  
      }          
    ],        
  }
});

const brokerNode2 = new ServiceBroker({
	namespace: 'dev',
  nodeID: 'node-2',
  transporter: 'NATS'
});

brokerNode2.createService({
  name: 'users',
  mixins: [DbService],

  settings: {
    fields: ['_id', 'name', 'email', 'address'],
    entityValidator: {
      name: 'string',
      email: 'string',
      address: 'string',
    }
   },

  actions: {
    listUsers: {
    	async handler(ctx) {
        this.broker.call('logger.createLog', { action: 'GET /users/list', date: new Date(), })
    		return this.broker.call('users.find', {});
    	}
    },
    createUsers: {
    	async handler(ctx) {
        this.broker.call('logger.createLog', { action: 'POST /users/create', date: new Date(), })
    		return this.broker.call('users.create', ctx.params);
    	}
    },
    getUsers: {
      async handler(ctx) {
        this.broker.call('logger.createLog', { action: 'GET /users/info', date: new Date(), })
        return this.broker.call('users.get', { id: ctx.params.id });
      }
    },
    removeUsers: {
      async handler(ctx) {
        this.broker.call('logger.createLog', { action: 'DELETE /users/remove', date: new Date(), })
        return this.broker.call('users.remove', { id: ctx.params.id });
      }
    },
    updateUsers: {
      async handler(ctx) {
        this.broker.call('logger.createLog', { action: 'PUT /users/update', date: new Date(), })
        return this.broker.call('users.update', ctx.params);
      }
    }
  },
});

Promise.all([brokerNode1.start(), brokerNode2.start()]).then(() => {
  brokerNode1.repl();
  brokerNode2.repl();
});