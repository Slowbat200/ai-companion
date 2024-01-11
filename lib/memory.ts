import { Redis } from '@upstash/redis';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeClient } from '@pinecone-database/pinecone';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import CompanionId from '@/app/(root)/(routes)/companion/[companionId]/page';

/**
 * The `CompanionKey` type represents a unique identifier for a companion file associated with a
 * specific model and user.
 * @property {string} companionFileName - A string representing the name of the companion file.
 * @property {string} modelName - The `modelName` property represents the name of a model. It is a
 * string value.
 * @property {string} userId - The `userId` property represents the unique identifier of a user.
 */
export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

/* The MemoryManager class is responsible for managing memory and storing data in Redis and Pinecone. */
export class MemoryManager {
  /* The lines `private static instance: MemoryManager;`, `private history: Redis;`, and `private
  vectorDBClient: PineconeClient;` are declaring private class properties in the `MemoryManager`
  class. */
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: PineconeClient;

  /**
   * The constructor initializes the history and vectorDBClient variables.
   */
  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new PineconeClient();
  }

  /* The `init()` method is an asynchronous function that initializes the `vectorDBClient` object. It
checks if the `vectorDBClient` is an instance of the `PineconeClient` class and then calls the
`init()` method on the `vectorDBClient` object. The `init()` method takes an object as an argument
with the `apiKey` and `environment` properties set to the corresponding values from the environment
variables `PINECONE_API_KEY` and `PINECONE_ENVIRONMENT`. */
  public async init() {
    if (this.vectorDBClient instanceof PineconeClient) {
      await this.vectorDBClient.init({
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    }
  }

  /* The `vectorSearch` method is a public asynchronous function that takes two parameters:
 `recentChatHistory` of type string and `companionFileName` of type string. */
  public async vectorSearch(
    recentChatHistory: string,
    companionFileName: string
  ) {
    /* The line `const pineconeClient = <PineconeClient>this.vectorDBClient;` is casting the
`vectorDBClient` object to the type `PineconeClient`. This is done to access the specific methods
and properties of the `PineconeClient` class that are not available in the base `PineconeClient`
type. By casting the object to the specific class type, the developer can use the methods and
properties specific to that class. */
    const pineconeClient = <PineconeClient>this.vectorDBClient;
    /* The code `const pineconeIndex = pineconeClient.Index(process.env.PINECONE_INDEX! || '')` is creating
an instance of the `Index` class from the `pineconeClient` object. */

    const pineconeIndex = pineconeClient.Index(
      process.env.PINECONE_INDEX! || ''
    );

    /* The code `const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({
   openAIApiKey: process.env.OPENAI_API_KEY }), { pineconeIndex })` is creating a `vectorStore`
   object using the `PineconeStore.fromExistingIndex` method. */
    const vectorStore = await PineconeStore.fromExistingIndex(
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex }
    );

    /* The code `const similarDocs = await vectorStore.similaritySearch(recentChatHistory, 3, { fileName:
 companionFileName })` is performing a similarity search using the `vectorStore` object. */
    const similarDocs = await vectorStore

      /* The code `.similaritySearch(recentChatHistory, 3, { fileName: companionFileName })` is calling
      the `similaritySearch` method on the `vectorStore` object. This method is used to perform a
      similarity search based on the `recentChatHistory` input. */
      .similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
      .catch((err) => {
        console.log('Error in similarity search', err);
      });
    return similarDocs;
  }

  /**
   * The function `getInstance` returns a promise that resolves to a singleton instance of the
   * `MemoryManager` class, ensuring that only one instance is created and initialized.
   * @returns The `getInstance` method returns a Promise that resolves to an instance of the
   * `MemoryManager` class.
   */
  public static async getInstance(): Promise<MemoryManager> {
    /* The if condition is a singleton pattern implementation. It
   ensures that only one instance of the `MemoryManager` class is created and used throughout the
   application. */
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
      await MemoryManager.instance.init();
    }
    return MemoryManager.instance;
  }

  //Creating function which will generate Redis companion key
  private generateRedisCompanionKey(companionKey: CompanionKey): string {
    /* This line is generating a Redis companion key by concatenating the `companionName`, `modelName`, and `userId`
properties of the `companionKey` object. The generated key will be used to uniquely identify a
companion file associated with a specific model and user in Redis. */
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }

  /**
   * The function writes a history entry to a Redis database using a companion key.
   * @param {string} text - The `text` parameter is a string that represents the history text that you
   * want to write. It could be any text that you want to store in the history.
   * @param {CompanionKey} companionKey - The `companionKey` parameter is an object that contains the
   * following properties:
   * @returns the result of the `zadd` operation, which is a Promise.
   */
  public async writeToHistory(text: string, companionKey: CompanionKey) {
    /* The code is checking if the
   `CompanionId` variable is falsy or if the `userId` property of the `companionKey` object is
   undefined. */
    if (!CompanionId || typeof companionKey.userId == 'undefined') {
      console.log('Companion key set incorrectly');
      return '';
    }

    /* The code generates a Redis companion
   key by concatenating the `companionName`, `modelName`, and `userId` properties of the
   `companionKey` object. This key is used to uniquely identify a companion file associated with a
   specific model and user in Redis. */
    const key = this.generateRedisCompanionKey(companionKey);

    /* The code is
   using the `zadd` method of the `history` Redis client to add a new entry to a sorted set in
   Redis. */
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });
    return result;
  }

  /* The `readLatestHistory` method is a public asynchronous function that takes a `companionKey`
parameter of type `CompanionKey` and returns a Promise that resolves to a string. */
  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    /* The code block `if (!companionKey || typeof companionKey.userId == 'undefined')` is checking if
    the `companionKey` object is falsy or if the `userId` property of the `companionKey` object is
    undefined. */
    if (!companionKey || typeof companionKey.userId == 'undefined') {
      console.log('Companion key set incorrectly');
      return '';
    }

    /* The line is generating a Redis companion
key by concatenating the `companionName`, `modelName`, and `userId` properties of the `companionKey`
object. This key is used to uniquely identify a companion file associated with a specific model and
user in Redis. */
    const key = this.generateRedisCompanionKey(companionKey);

    /* The line is using
   the `zrange` method of the `history` Redis client to retrieve a range of elements from a sorted
   set in Redis. */
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });

    /* The line `result = result.slice(-30).reverse()` is performing two operations on the `result`
    array. */
    result = result.slice(-30).reverse();

    /* The code `const recentChats = result.reverse().join('\n')` is reversing the order of elements in
    the `result` array and then joining them together with a newline character (`\n`). This creates
    a single string where each element of the array is separated by a newline. */
    const recentChats = result.reverse().join('\n');
    return recentChats;
  }

  /* The `seedChatHistory` method is a public asynchronous function that is used to seed chat history in
 the Redis database. It takes three parameters: */
  public async seedChatHistory(
    seedContent: String,
    delimiter: string = '\n',
    companionKey: CompanionKey
  ) {
    /* The line `const key = this.generateRedisCompanionKey(companionKey);` is generating a Redis companion
key by concatenating the `companionName`, `modelName`, and `userId` properties of the `companionKey`
object. This key is used to uniquely identify a companion file associated with a specific model and
user in Redis. */
    const key = this.generateRedisCompanionKey(companionKey);

    /* The code `if (await this.history.exists(key))` is checking if a key exists in the Redis
    database. It uses the `exists` method of the `history` Redis client to check if the specified
    key exists. */
    if (await this.history.exists(key)) {
      console.log('User already has chat history');
      return;
    }

    /* The code `const content = seedContent.split(delimiter);` is splitting the `seedContent` string
   into an array of substrings using the `split()` method. The delimiter specified in the
   `delimiter` variable is used to determine where the string should be split. Each substring will
   be stored as an element in the `content` array. */
    /* The line `let counter = 0` is declaring a variable named `counter` and initializing it with a value
of 0. This variable can be used to keep track of the number of iterations or any other
counting-related operations within the `seedChatHistory` method. */
    const content = seedContent.split(delimiter);
    let counter = 0;

    /* The code block `for (const line of content) { await this.history.zadd(key, {score: counter,
  member: line}) counter += 1 }` is iterating over each element in the `content` array and
  performing the following actions: */
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1;
    }
  }
}
