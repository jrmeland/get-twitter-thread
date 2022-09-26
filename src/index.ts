import {Client} from 'twitter-api-sdk';
import {TwitterThread} from './twitterThread';

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw Error('Bearer token required');
}

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const client = new Client(BEARER_TOKEN);

async function main() {
  const thread = new TwitterThread(client);
  const threadTweets = await thread.getThread('1561942174165450753', {
    'tweet.fields': [
      'conversation_id',
      'author_id',
      'in_reply_to_user_id',
      'created_at',
      'reply_settings',
    ],
  });
  console.log(threadTweets);

  const printLine = (text: string) => {
    console.log(text);
    console.log('\n---------------------\n');
  };
  threadTweets.forEach(x => printLine(x.text as string));
}

main();
