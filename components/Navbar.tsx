'use client';

import { cn } from '@/lib/utils';
import { UserButton } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import { MobileSidebar } from '@/components/mobile-sidebar';
import { useProModal } from '@/hooks/use-pro-modal';

interface NavbarProps {
  isPro: boolean;
}
const font = Poppins({
  weight: '600',
  subsets: ['latin'],
});
export const Navbar = ({ isPro }: NavbarProps) => {
  const proModal = useProModal();
  return (
    <div
      className='fixed w-full z-50 flex justify-between items-center 
    py-2 px-4 border-b border-primary/10 bg-secondary h-16'
    >
      <div className='flex items-center'>
        {/** Menu: Creating navbar with hamburger menu in mobile devices */}
        <MobileSidebar />
        {/** Creating heading as a link */}
        <Link href='/'>
          <h1
            className={cn(
              //primary className
              'hidden md:block text-xl md:text-3xl font-bold text-primary',
              //dynamic className
              font.className
            )}
          >
            companion.ai
          </h1>
        </Link>
      </div>
      {/** Creating Buttons in Navbar */}
      <div className='flex items-center gap-x-3'>
        {!isPro && (
          //Upgrade Button with Sparkles icon
          <Button onClick={proModal.onOpen} variant='premium' size='sm'>
            Upgrade
            <Sparkles className='h-4 w-4 fill-white text-white ml-2' />
          </Button>
        )}
        {/** Creating Dark/Light mode toggler */}
        <ModeToggle />
        {/** Creating UserButton which creating account information */}
        <UserButton afterSignOutUrl='/' />
      </div>
    </div>
  );
};
