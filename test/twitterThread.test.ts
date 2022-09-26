/* eslint-disable @typescript-eslint/no-unused-vars */
import {Client, types} from 'twitter-api-sdk';
import {TwitterPaginatedResponse} from 'twitter-api-sdk/dist/types';
import {TwitterThread} from '../src/twitterThread';

const client = new Client('bearer token');

const findTweetByIdMock = jest
  .spyOn(client.tweets, 'findTweetById')
  .mockImplementation(
    (
      id: string,
      options?: types.operations['findTweetById']['parameters']['query']
    ): Promise<types.components['schemas']['Get2TweetsIdResponse']> => {
      return new Promise((resolve, reject) => {
        resolve({
          data: {
            id: id,
            text: 'Tweet text 1',
            author_id: 'UserId',
            created_at: '2022-08-23T05:00:00.000Z',
            conversation_id: id,
          },
        });
      });
    }
  );

// create an asyncIterable object
const asyncIterableObject = {
  [Symbol.asyncIterator]() {
    const id = '0';
    return {
      next() {
        return Promise.resolve({
          done: true,
          value: {
            data: [
              {
                id: id,
                text: 'Tweet text 1',
                author_id: 'UserId',
                created_at: '2022-08-23T05:00:00.000Z',
                conversation_id: id,
              },
            ],
          },
        });
      },
    };
  },
};

// create a function that returns TwitterPaginatedResponse<TwitterResponse<usersIdTweets>>
const usersIdTweetsMock = jest
  .spyOn(client.tweets, 'usersIdTweets')
  .mockImplementation(
    (
      id: string,
      options?: types.operations['usersIdTweets']['parameters']['query']
    ): TwitterPaginatedResponse<
      types.components['schemas']['Get2UsersIdTweetsResponse']
    > => {
      return asyncIterableObject as unknown as TwitterPaginatedResponse<
        types.components['schemas']['Get2UsersIdTweetsResponse']
      >;
    }
  );

test('test happy path', async () => {
  const twitterThread = new TwitterThread(client);

  await twitterThread.getThread('id');

  expect(findTweetByIdMock).toBeCalled();
  expect(usersIdTweetsMock).toBeCalled();
});
