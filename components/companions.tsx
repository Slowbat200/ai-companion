'use client';

import { Companion } from '@prisma/client';
import Image from 'next/image';
import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';

/* The `interface CompanionProps` defines the type of the `data` prop that is passed to the
`Companions` component. */
interface CompanionProps {
  data: (Companion & {
    _count: {
      messages: number;
    };
  })[];
}

export const Companions = ({ data }: CompanionProps) => {
  if (data.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center space-y-3 pt-10'>
        <div className='relative w-60 h-60'>
          <Image className='grayscale' fill alt='Empty' src='/empty.png' />
        </div>
        <p className='text-sm text-muted-foreground'>No companions found!</p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 pb-10'>
      {data.map((item) => (
        <Card
          key={item.id}
          className='bg-primary/10 rounded-xl cursor-pointer hover:opacity-75 transition border-0'
        >
          <Link href={`/chat/${item.id}`}>
            <CardHeader className='flex items-center justify-center text-center text-muted-foreground'>
              <div className='relative w-32 h-32'>
                <Image
                  src={item.src}
                  fill
                  className='rounded-xl object-cover'
                  alt='AI Character'
                />
              </div>
              <p className='font-bold'>{item.name}</p>
              <p className='text-xs'>{item.description}</p>
            </CardHeader>
            <CardFooter className='flex items-center justify-between text-xs text-muted-foreground'>
              <p className='lowercase'>@{item.userName}</p>
              <div className='flex items-center'>
                <MessageSquare className='w-3 h-3 mr-1' />
                {item._count.messages}
              </div>
            </CardFooter>
          </Link>
        </Card>
      ))}
    </div>
  );
};

export default Companions;
