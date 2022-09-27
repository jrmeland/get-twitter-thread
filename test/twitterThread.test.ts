/* eslint-disable @typescript-eslint/no-unused-vars */
import {Client, types} from 'twitter-api-sdk';
import {TwitterPaginatedResponse} from 'twitter-api-sdk/dist/types';
import {TwitterThread} from '../src/twitterThread';

const client = new Client('bearer token');
const id = '0';

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
  async *[Symbol.asyncIterator]() {
    yield {
      data: [
        {
          id: id,
          text: 'Tweet text 1',
          author_id: 'UserId',
          created_at: '2022-08-23T05:00:00.000Z',
          conversation_id: id,
          in_reply_to_user_id: 'UserId',
        },
        {
          id: 'abc123',
          text: 'Second tweet',
          author_id: 'UserId',
          created_at: '2022-08-23T05:01:00.000Z',
          conversation_id: id,
          in_reply_to_user_id: 'UserId',
        },
        {
          id: 'xyz789',
          text: 'This is not in thread',
          author_id: 'UserId',
          created_at: '2022-08-23T05:02:00.000Z',
        },
      ],
    };
  },
};

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

  const tweets = await twitterThread.getThread(id);

  expect(findTweetByIdMock).toBeCalled();
  expect(usersIdTweetsMock).toBeCalled();
  expect(tweets.length).toBe(2);
});
