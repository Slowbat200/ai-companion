import prismadb from '@/lib/prismadb';
import { auth, redirectToSignIn } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { ChatClient } from './components/client';

interface ChatIdPageProps {
  params: {
    chatId: string;
  };
}

const ChatIdPage = async ({ params }: ChatIdPageProps) => {
  const { userId } = auth();

  //If user doesnt have account, user will be redirect to SignIn form
  if (!userId) {
    return redirectToSignIn();
  }

  const companion = await prismadb.companion.findUnique({
    /* The `where` clause in the code is specifying the condition for the database query. In this case,
   it is filtering the `companion` records based on the `id` field, where the `id` matches the
   `chatId` parameter passed to the page. This allows the code to retrieve the specific `companion`
   record associated with the provided `chatId`. */
    where: {
      id: params.chatId,
    },
    /* The `include` property in the code is used to specify the related records that should be
    included in the query result. In this case, it includes the `messages` related to the
    `companion` record. */
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc',
        },
        where: {
          userId,
        },
      },
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  //checking if there is AI companion. If not user will be redirect to main page
  if (!companion) {
    return redirect('/');
  }
  return <ChatClient companion={companion} />;
};

export default ChatIdPage;
