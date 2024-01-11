'use client';

import { ChatHeader } from '@/components/chat-header';
import { Companion, Message } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { useCompletion } from 'ai/react';
import { ChatForm } from '@/components/chat-form';
import { ChatMessages } from '@/components/chat-messages';
import { ChatMessageProps } from '@/components/chat-message';

/* The `ChatClientProps` interface is defining the props that can be passed to the `ChatClient`
component. It has a single prop called `companion`, which is of type `Companion` (imported from
`@prisma/client`) and has additional properties `messages` and `_count`. */
interface ChatClientProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}
export const ChatClient = ({ companion }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(companion.messages);

  /* The code is using the `useCompletion` hook from the `ai/react` library to handle autocompletion
  functionality in the chat client component. */
  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      /* The `api: `/api/chat/${companion.id}`` is specifying the API endpoint that will be used for
      the chat. It is using the companion's `id` property to dynamically generate the endpoint URL. */
      api: `/api/chat/${companion.id}`,
      onFinish(prompt, completion) {
        /* The code `const systemMessage = { role: 'system', content: completion };` is creating a new
      object called `systemMessage`. This object has two properties: `role` and `content`. */
        const systemMessage: ChatMessageProps = {
          role: 'system',
          content: completion,
        };
        /* The code `setMessages((current) => [...current, systemMessage]);` is updating the state of the
`messages` variable in the component. It is using the `setMessages` function, which is a state
updater function provided by the `useState` hook. */
        setMessages((current) => [...current, systemMessage]);
        setInput('');

        router.refresh();
      },
    });

  /* The `onSubmit` function is an event handler for the form submission event. It takes an event object
`e` of type `FormEvent<HTMLFormElement>` as a parameter. This function is called when the user
submits the form. */
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    /* The code `const userMessage = { role: 'user', content: input };` is creating a new object called
   `userMessage`. This object has two properties: `role` and `content`. */
    const userMessage: ChatMessageProps = {
      role: 'user',
      content: input,
    };
    /* The code `setMessages((current) => [...current, userMessage]);` is updating the state of the
    `messages` variable in the component. It is using the `setMessages` function, which is a state
    updater function provided by the `useState` hook. */
    setMessages((current) => [...current, userMessage]);
    handleSubmit(e);
  };

  return (
    <div className='flex flex-col h-full p-4 space-y-2'>
      <ChatHeader companion={companion} />
      <ChatMessages companion={companion} isLoading={isLoading} messages={messages} />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
