import dotenv from 'dotenv'
import { StreamingTextResponse, LangChainStream } from 'ai';
import { currentUser } from '@clerk/nextjs';
import { CallbackManager } from 'langchain/callbacks';
import { Replicate } from 'langchain/llms/replicate';
import { NextResponse } from 'next/server';

import { MemoryManager } from '@/lib/memory';
import { rateLimit } from '@/lib/rate-limit';
import prismadb from '@/lib/prismadb';



dotenv.config({path: `.env`})
export async function POST(
  request: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { prompt } = await request.json();
    const user = await currentUser();

   /* The code is checking if the `user` object or any of its required properties (`firstName` and
   `id`) are falsy. If any of these conditions are true, it means that the user is not authorized or
   authenticated. In this case, it returns a `NextResponse` object with a status code of 401
   (Unauthorized). This is used to handle unauthorized access to the endpoint and prevent further
   execution of the code. */
    if (!user || !user.firstName || !user.id) {
      return new NextResponse('Unautorized', { status: 401 });
    }

    /* The code is generating an identifier by concatenating the request URL and the user ID. This
    identifier is used to track the rate limit for the specific user and endpoint. The `rateLimit`
    function is then called with the identifier as an argument to check if the user has exceeded the
    rate limit. The result of the rate limit check is stored in the `success` variable. */
    
    const identifier = request.url + '-' + user.id;
    const { success } = await rateLimit(identifier);

    if (!success) {
      return new NextResponse('Rate limit exceeded', { status: 429 });
    }

    /* The code is updating the `companion` object in the `prismadb` database. It is finding the
    companion with the specified `chatId` and adding a new message to its `messages` array. The new
    message has the `content` of the `prompt` variable, the `role` of 'user', and the `userId` of
    the current user. */
    const companion = await prismadb.companion.update({
      where: {
        id: params.chatId,
      },
      data: {
        messages: {
          create: {
            content: prompt,
            role: 'user',
            userId: user.id,
          },
        },
      },
    });

    // If there are no companions or the companion doesn't exist, we send back an error response.
    if (!companion) {
      return new NextResponse('Companion not found', { status: 404 });
    }
    /* The code is assigning the value of `companion.id` to the variable `name`. It is then
    concatenating the value of `name` with the string '.txt' and assigning the result to the
    variable `companion_file_name`. Essentially, it is creating a file name by appending the '.txt'
    extension to the `companion.id`. */
    const name = companion.id;
    const companion_file_name = name + '.txt';

    /* The `companionKey` object is used to uniquely identify a conversation companion in the code. It
 contains three properties: */
    const companionKey = {
      companionName: name!,
      userId: user.id,
      modelName: 'llama2-13b',
    };
    const memoryManager = await MemoryManager.getInstance();

    const records = await memoryManager.readLatestHistory(companionKey);

    if (records.length === 0) {
      await memoryManager.seedChatHistory(companion.seed, '\n\n', companionKey);
    }

    await memoryManager.writeToHistory('User:' + prompt + '\n', companionKey);

    const recentChatHistory = await memoryManager.readLatestHistory(
      companionKey
    );

    const similarDocs = await memoryManager.vectorSearch(
      recentChatHistory,
      companion_file_name
    );

    let relevantHistory = '';

/* The code is checking if the `similarDocs` variable is truthy and if its length is not equal to 0. If
both conditions are true, it means that there are similar documents found. */
    if (!!similarDocs && similarDocs.length !== 0) {
      relevantHistory = similarDocs.map((doc) => doc.pageContent).join('\n');
    }

    const { handlers } = LangChainStream();
    const model = new Replicate({
      model:
        'a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5',
      input: {
        max_length: 2048,
      },
      apiKey: process.env.REPLICATE_API_TOKEN,
      callbackManager: CallbackManager.fromHandlers(handlers),
    });

    model.verbose = true;

    const resp = String(
      await model
        .call(
          `
      ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix. 

      ${companion.instructions}

      Below are relevant details about ${companion.name}'s past and the conversation you are in.
      ${relevantHistory}


      ${recentChatHistory}\n${companion.name}:`
        )
        .catch(console.error)
    );

    const cleaned = resp.replaceAll(',', '');
    const chunks = cleaned.split('\n');

/* The line is assigning the first element of the `chunks` array to the
variable `response`. */
    const response = chunks[0];

    await memoryManager.writeToHistory('' + response.trim(), companionKey);
    var Readable = require('stream').Readable;

    let s = new Readable();
    s.push(response);
    s.push(null);

    if (response !== undefined && response.length > 1) {
      memoryManager.writeToHistory('' + response.trim(), companionKey);

      await prismadb.companion.update({
        where: {
          id: params.chatId,
        },
        data: {
          messages: {
            create: {
              content: response.trim(),
              role: 'system',
              userId: user.id,
            },
          },
        },
      });
    }
    return new StreamingTextResponse(s);
  } catch (error) {
    console.log('[CHAT_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
