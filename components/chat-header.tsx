'use client';

import { Companion, Message } from '@prisma/client';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  Edit,
  MessageSquare,
  MoreVertical,
  Trash,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BotAvatar } from './bot-avatar';
import { useUser } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from './ui/use-toast';
import axios from 'axios';

/* The `ChatHeaderProps` interface is defining the props that can be passed to the `ChatHeader`
component. It specifies that the `companion` prop should be an object that has properties from the
`Companion` interface, as well as additional properties `messages` and `_count`. */
interface ChatHeaderProps {
  companion: Companion & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

export const ChatHeader = ({ companion }: ChatHeaderProps) => {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();

  const onDelete = async () => {
    /* The code is making a DELETE request to the `/api/companion/${companion.id}` endpoint using the
   axios library. It is deleting the companion with the specified ID. If the deletion is successful,
   it displays a success toast message using the `toast` function. */
    try {
      await axios.delete(`/api/companion/${companion.id}`);
      toast({
        description: 'Success',
      });

      router.refresh();
      router.push('/');
    } catch (error) {
      toast({ description: 'Something went wrong', variant: 'destructive' });
    }
  };
  return (
    <div
      className='flex w-full justify-between 
        items-center border-b border-primary/10 pb-4'
    >
      <div className='flex gap-x-2 items-center'>
        <Button onClick={() => router.back()} size='icon' variant='ghost'>
          <ChevronLeft className='h-8 w-8' />
        </Button>
        <BotAvatar src={companion.src} />
        <div className='flex flex-col gap-y-1'>
          <div className='flex items-center gap-x-2'>
            <p className='font-bold'>{companion.name}</p>
            <div className='flex items-center text-xs text-muted-foreground'>
              <MessageSquare className='w-3 h-5 mr-1' />
              {companion._count.messages}
            </div>
          </div>
          <p className='text-xs text-muted-foreground'>
            Created by {companion.userName}
          </p>
        </div>
      </div>
      {user?.id === companion.userId && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button size='icon' variant='secondary'>
              <MoreVertical />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() => router.push(`/companion/${companion.id}`)}
            >
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash className='w-4 h-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};
