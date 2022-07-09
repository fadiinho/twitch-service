import apiClient from './api';
import { IRouter } from 'express';
import { Service } from './structures';
import { initEvents } from './events';


import EventEmmiter from 'node:events';
export default class TwitchService extends EventEmmiter implements Service {
  serviceName = 'Twitch';
  serviceDescription = 'Service for interacting with Twitch';
  eventSubMiddleware: ReturnType<typeof initEvents>;
  client: ReturnType<typeof apiClient>;

  constructor(auth: { clientId: string | undefined, clientSecret: string | undefined }, hostname: string | undefined) {
    if (!auth || !auth.clientSecret || !auth.clientId) throw new Error('auth keys not provided. You need to pass clientId and clientSecret');
    if (!hostname) throw new Error('hostname not provided. You need to pass hostname');

    super()

    this.client = apiClient(auth.clientId, auth.clientSecret);

    this.eventSubMiddleware = initEvents({ 
      apiClient: this.client.apiClient,
      hostName: hostname,
      secret: auth.clientSecret 
    });
  }

  async applyMiddleware(app: IRouter) {
    await this.eventSubMiddleware.middleware.apply(app);
  }

  async markAsReady() {
    await this.eventSubMiddleware.middleware.markAsReady();
  }

  async streamOnline(userName: string) {
    if (!userName) throw new Error('You need to pass a username');

    const { listener } = await this.eventSubMiddleware.streamOnlineEvent(userName, (_data) => {
      this.emit('streamOnline', { ..._data });
    });

    console.log(await listener.getCliTestCommand());
  }

  async streamOffline(userName: string) {
    if (!userName) throw new Error('You need to pass a username');

    const { listener } = await this.eventSubMiddleware.streamOfflineEvent(userName, (_data) => {
      this.emit('streamOffline', { ..._data });
    });

    console.log(await listener.getCliTestCommand());
  }
}

