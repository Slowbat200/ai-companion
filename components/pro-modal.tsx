'use client';

import { useProModal } from '@/hooks/use-pro-modal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useEffect, useState } from 'react';
import axios from 'axios';

export const ProModal = () => {
  const { toast } = useToast();
  const proModal = useProModal();

  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false)

  useEffect(()=>{
    setIsMounted(true)
  },[])

  const onSubscribe = async () => {
    try {
      setIsLoading(true);

      const response = await axios.get('/api/stripe');

      window.location.href = response.data.url;
    } catch (error) {
      toast({
        variant: 'destructive',
        description: 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };


  if(!isMounted){
    return null
  }
  return (
    <Dialog open={proModal.isOpen} onOpenChange={proModal.onClose}>
      <DialogContent>
        <DialogHeader className='space-y-4'>
          <DialogTitle className='text-center'>Upgrade to Pro</DialogTitle>
          <DialogDescription className='text-center space-y-2'>
            Create{' '}
            <span className='text-sky-500 font-medium mx-1'>Custom AI</span>{' '}
            Character!
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className='flex justify-between'>
          <p className='text-2xl font-medium'>
            $4
            <span className='text-sm font-normal'>.99 / month</span>
          </p>
          <Button onClick={onSubscribe} disabled={isLoading} variant='premium'>Subscribe</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
