import {Client} from 'twitter-api-sdk';

if (!process.env.TWITTER_BEARER_TOKEN) {
  throw Error('Bearer token required');
}

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
// const client = new Client(process.env.BEARER_TOKEN);
const client = new Client(BEARER_TOKEN);

async function main() {
  // await client.tweets.
  const tweet = await client.tweets.findTweetById('1561942174165450753', {
    'tweet.fields': ['conversation_id', 'author_id'],
  });
  console.log(tweet);
  // const author_id = tweet.data?.author_id;
  // // console.log(tweet.data?.text);
  // const conversation = await client.tweets.searchStream({"tweet.fields":["author_id","id"]});
  //   '1561942174165450753',
  //   {'tweet.fields': ['conversation_id', 'author_id']}
  // );
  // const quoted = conversation.data?.filter(x => x.author_id === author_id);
  // console.log(quoted);
}

main();
