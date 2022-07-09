import { ApiClient } from '@twurple/api';
import provider from './auth';

export default (clientId: string, clientSecret: string ) => {
  const authProvider = provider(clientId, clientSecret);

  const apiClient = new ApiClient({ authProvider });

  return { 
    apiClient,
    getStreamByUsername: async (userName: string) => {
      const stream = await apiClient.streams.getStreamByUserName(userName);

      return {
        username: stream?.userName,
        title: stream?.title,
        game: stream?.gameName
      }
    }
  };
};

