'use client';

import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { BotAvatar } from './bot-avatar';
import { BeatLoader } from 'react-spinners';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from './ui/button';
import { Copy } from 'lucide-react';

export interface ChatMessageProps {
  role: 'system' | 'user';
  content?: string;
  isLoading?: boolean;
  src?: string;
}
export const ChatMessage = ({
  role,
  content,
  isLoading,
  src,
}: ChatMessageProps) => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const onCopy = () => {
    if (!content) {
      return;
    }
    navigator.clipboard.writeText(content);
    toast({
      description: 'Message copied to clipboard',
    });
  };
  return (
    <div
      className={cn(
        `group flex items-start gap-x-3 py-4 w-full`,
        //Positioning user Avatar on the right side of page
        role === 'user' && 'justify-end'
      )}
    >
      {/**  The line `{role !== 'user' && src && <BotAvatar src={src} />}`
       * is conditionally rendering the `BotAvatar` component. */}
      {role !== 'user' && src && <BotAvatar src={src} />}
      <div className='rounded-md px-4 py-2 max-w-sm text-sm bg-primary/10'>
        {/** When AI message is loading it will create spinner animation and will adapt on theme */}
        {isLoading ? (
          <BeatLoader size={5} color={theme === 'light' ? 'black' : 'white'} />
        ) : (
          content
        )}
      </div>
      {/** If role is user create User avatar */}
      {role === 'user' && <UserAvatar />}
      {/** There condition creating Copy button
       * only when user's mouse isnt near user message
       * or when AI message is still loading */}
      {role !== 'user' && !isLoading && (
        <Button
          onClick={onCopy}
          className='opacity-0 group-hover:opacity-100 transition'
          size='icon'
          variant='ghost'
        >
          <Copy className='w-4 h-4' />
        </Button>
      )}
    </div>
  );
};
