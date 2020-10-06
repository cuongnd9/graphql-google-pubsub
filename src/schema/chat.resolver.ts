/* eslint-disable @typescript-eslint/camelcase */
import { GooglePubSub } from '@axelspringer/graphql-google-pubsub';

import config from './config.json';

const options = {
  projectId: config.project_id,
  credentials: {
    client_email: config.client_email,
    private_key: config.private_key,
  },
};
const pubsub = new GooglePubSub(options);

const CHAT_CHANNEL = 'stuff';
let chats = [
  {
    id: '1', from: 'admin', content: 'Hello', createdAt: '2020-10-06T03:58:28.283Z',
  },
];

const resolver = {
  Query: {
    chats: () => chats,
  },

  Mutation: {
    createChat: (_: any, { content, from }: any) => {
      const id = `_${
        Math.random()
          .toString(36)
          .substr(2, 9)}`;
      const chat = {
        id,
        from,
        content,
        createdAt: new Date().toISOString(),
      };

      chats = [chat, ...chats];
      chats = chats.splice(0, 8);
      pubsub.publish(CHAT_CHANNEL, { messageSent: chat });

      return chat;
    },
  },

  Subscription: {
    messageSent: {
      subscribe: () => pubsub.asyncIterator(CHAT_CHANNEL),
    },
  },
};

export default resolver;
