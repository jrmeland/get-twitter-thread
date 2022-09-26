import {Client, types} from 'twitter-api-sdk';

type Tweet = types.components['schemas']['Tweet'];

export interface QueryOptions {
  /** A comma separated list of Tweet fields to display. */
  'tweet.fields'?: types.components['parameters']['TweetFieldsParameter'];
  /** A comma separated list of fields to expand. */
  expansions?: types.components['parameters']['TweetExpansionsParameter'];
  /** A comma separated list of Media fields to display. */
  'media.fields'?: types.components['parameters']['MediaFieldsParameter'];
  /** A comma separated list of Poll fields to display. */
  'poll.fields'?: types.components['parameters']['PollFieldsParameter'];
  /** A comma separated list of User fields to display. */
  'user.fields'?: types.components['parameters']['UserFieldsParameter'];
  /** A comma separated list of Place fields to display. */
  'place.fields'?: types.components['parameters']['PlaceFieldsParameter'];
}

export class TwitterThread {
  private _client: Client;
  private readonly REQUIRED_TWEET_FIELDS: types.components['parameters']['TweetFieldsParameter'] =
    ['conversation_id', 'author_id', 'created_at', 'in_reply_to_user_id'];

  constructor(client: Client) {
    this._client = client;
  }

  private getEndDate(startDate: string): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }

  private getOptions(options?: QueryOptions): QueryOptions {
    if (!options) {
      // New options if non were passed
      options = {
        'tweet.fields': this.REQUIRED_TWEET_FIELDS,
      };
    } else if (!options['tweet.fields']) {
      // Add tweet fields option if wasn't in passed options
      options['tweet.fields'] = this.REQUIRED_TWEET_FIELDS;
    } else {
      // Supplment requred tweet fields if not present
      for (const tweetField of this.REQUIRED_TWEET_FIELDS) {
        if (!options['tweet.fields'].some(x => x === tweetField)) {
          options['tweet.fields'].push(tweetField);
        }
      }
    }

    return options;
  }

  public async getThread(id: string, options?: QueryOptions): Promise<Tweet[]> {
    const completeOptions = this.getOptions(options);
    const tweet = await this._client.tweets.findTweetById(id, completeOptions);
    const conversationId = tweet.data?.conversation_id as string;
    const userId = tweet.data?.author_id as string;
    const startDate = tweet.data?.created_at as string;
    const endDate = this.getEndDate(startDate);

    const timelineOptions: types.operations['usersIdTimeline']['parameters']['query'] =
      {
        start_time: startDate,
        end_time: endDate,
        max_results: 100,
        'tweet.fields': completeOptions['tweet.fields'],
        expansions: completeOptions['expansions'],
        'media.fields': completeOptions['media.fields'],
        'poll.fields': completeOptions['poll.fields'],
        'user.fields': completeOptions['user.fields'],
        'place.fields': completeOptions['place.fields'],
      };
    const timeline = this._client.tweets.usersIdTweets(userId, timelineOptions);
    const tweets: Tweet[] = [];
    for await (const page of timeline) {
      if (!page.data) {
        continue;
      }
      page.data
        .filter(
          x =>
            x.conversation_id === conversationId &&
            x.in_reply_to_user_id === userId
        )
        .forEach(x => tweets.push(x));
    }
    return tweets.reverse();
  }
}
