import { EventSubMiddleware, EventSubMiddlewareConfig, EventSubStreamOnlineEventStreamType, EventSubSubscription } from '@twurple/eventsub';
import { HelixUser, HelixStream } from '@twurple/api';

type UserData = {
  broadcasterDisplayName?: string;
  broadcasterId?: string;
  broadcasterName?: string;
  broadcaster?: HelixUser;
  streamInfo?: HelixStream;
  streamType?: EventSubStreamOnlineEventStreamType
}

type EventReturnType = { data: UserData; listener: EventSubSubscription<unknown> }

export function initEvents(middlewareConfig: EventSubMiddlewareConfig) {
  const { apiClient } = middlewareConfig;

  const middleware = new EventSubMiddleware({
    strictHostCheck: true,
    pathPrefix: '/twitch',
    ...middlewareConfig
  });

  apiClient.eventSub.deleteAllSubscriptions();

  return {
    middleware,
    streamOnlineEvent: async (userName: string, handler?: (data: UserData, listener: EventReturnType['listener']) => void): Promise<EventReturnType> => {
      const helixUser = await apiClient.users.getUserByName(userName).catch((err: Error) => { throw new Error(err.message) });
      if (!helixUser) throw new Error('User not found');

      const userId = helixUser.id;

      let data: UserData = {};

      const listener = await middleware.subscribeToStreamOnlineEvents(userId, async e => {
         data = {
          broadcasterDisplayName: e.broadcasterDisplayName,
          broadcasterId: e.broadcasterId,
          broadcasterName: e.broadcasterName,
          broadcaster: await e.getBroadcaster(),
          streamInfo: await e.getStream(),
          streamType: e.streamType
        }

      if (typeof handler === 'function') handler(data, listener);
      }).catch((err) => { throw new Error(err); });

      return { 
        data, 
        listener 
      };
    },
    streamOfflineEvent: async (user: string, handler?: (data: UserData, listener: EventReturnType['listener']) => void): Promise<EventReturnType> => {
      const helixUser = await apiClient.users.getUserByName(user).catch((err: Error) => { throw new Error(err.message); });
      if (!helixUser) throw new Error('User not found');

      const userId = helixUser.id;

      let data: UserData = {};

      const listener = await middleware.subscribeToStreamOfflineEvents(userId, async e => {
        data = {
          broadcasterDisplayName: e.broadcasterDisplayName,
          broadcasterId: e.broadcasterId,
          broadcasterName: e.broadcasterName,
          broadcaster: await e.getBroadcaster()
        }
      }).catch((err) => { throw new Error(err); });


      if (typeof handler === 'function') handler(data, listener);
      return { 
        data, 
        listener 
      };
    }
  }
}


