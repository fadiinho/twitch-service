import { ClientCredentialsAuthProvider } from '@twurple/auth';

export default (clientId: string, clientSecret: string) => {
  const provider = new ClientCredentialsAuthProvider(clientId, clientSecret);
  return provider;
};
