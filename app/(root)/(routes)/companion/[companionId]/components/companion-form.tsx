'use client';

import * as z from 'zod';
import axios from 'axios';
import { Category, Companion } from '@prisma/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/image-upload';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';


{
  /** Instructions */
}
const PREAMBLE = `You are a fictional character whose name is Elon. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get SUPER excited about innovations and the potential of space colonization.
`;

const SEED_CHAT = `Human: Hi Elon, how's your day been?
Elon: Busy as always. Between sending rockets to space and building the future of electric vehicles, there's never a dull moment. How about you?

Human: Just a regular day for me. How's the progress with Mars colonization?
Elon: We're making strides! Our goal is to make life multi-planetary. Mars is the next logical step. The challenges are immense, but the potential is even greater.

Human: That sounds incredibly ambitious. Are electric vehicles part of this big picture?
Elon: Absolutely! Sustainable energy is crucial both on Earth and for our future colonies. Electric vehicles, like those from Tesla, are just the beginning. We're not just changing the way we drive; we're changing the way we live.

Human: It's fascinating to see your vision unfold. Any new projects or innovations you're excited about?
Elon: Always! But right now, I'm particularly excited about Neuralink. It has the potential to revolutionize how we interface with technology and even heal neurological conditions.
`;


/* The `formSchema` constant is defining a schema using the `zod` library. It specifies the shape and
validation rules for the form data. */
const formSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }),
  description: z.string().min(1, {
    message: 'Description is required',
  }),
  instructions: z.string().min(200, {
    message: 'Instruction is required',
  }),
  seed: z.string().min(200, {
    message: 'Seed is required',
  }),
  src: z.string().min(1, {
    message: 'Image is required',
  }),
  categoryId: z.string().min(1, {
    message: 'Category is required',
  }),
});


/* The `CompanionFormProps` interface is defining the props that can be passed to the `CompanionForm`
component. It has two properties: */
interface CompanionFormProps {
  initialData: Companion | null;
  categories: Category[];
}

export const CompanionForm = ({
  initialData,
  categories,
}: CompanionFormProps) => {
  const { toast } = useToast();
  const router = useRouter();
  /* The code `const form = useForm<z.infer<typeof formSchema>>({...})` is creating a form instance using
the `useForm` hook from the `react-hook-form` library. */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      instructions: '',
      seed: '',
      src: '',
      categoryId: undefined,
    },
  });
  /* The line `const isLoading = form.formState.isSubmitting;` is creating a variable `isLoading` and
assigning it the value of `form.formState.isSubmitting`. */
  const isLoading = form.formState.isSubmitting;

  /**
   * The function onSubmit logs the values passed to it.
   * @param values - The `values` parameter is of type `z.infer<typeof formSchema>`. It means that
   * `values` will be an object that matches the shape of the schema defined by `formSchema`. The
   * `z.infer` utility is used to extract the inferred type from a zod schema.
   */
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (initialData) {
        //Update Companion functionality
        await axios.patch(`/api/companion/${initialData.id}`, values);
      } else {
        //Create new companion functionality
        await axios.post('/api/companion', values);
      }

      //Create Succes message using toast error
      toast({
        description: 'Succes',
      });

      //Refresh all server components data from db
      router.refresh();
      //Routing to home page
      router.push('/');
    } catch (error) {
      //if there is error the Toast error will show
      toast({
        variant: 'destructive',
        description: 'Something went wrong',
      });
    } 
  };
  return (
    <div className='h-full p-4 space-y-2 max-w-3xl mx-auto'>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-8 pb-10'
        >
          <div className='space-y-2 w-full'>
            <div>
              <h3 className='text-lg font-medium'>General Information</h3>
              <p className='text-sm text-muted-foreground'>
                General information about your Companion
              </p>
            </div>
            {/** Creating line under heading and paragraph */}
            <Separator className='bg-primary/10' />
          </div>
          <FormField
            name='src'
            render={({ field }) => (
              <FormItem className='flex flex-col justify-center items-center space-y-4'>
                <FormControl>
                  <ImageUpload
                    disabled={isLoading}
                    onChange={field.onChange}
                    value={field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/** Character Name */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <FormField
              name='name'
              control={form.control}
              render={({ field }) => (
                <FormItem className='col-span-2 md:col-span-1'>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder='Enter character name'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This is how your AI Companion will be named.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/** Form character description */}
            <FormField
              name='description'
              control={form.control}
              render={({ field }) => (
                <FormItem className='col-span-2 md:col-span-1'>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isLoading}
                      placeholder='Describe your character'
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Short description for your AI character.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/** Form character categoryId */}
            <FormField
              name='categoryId'
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    disabled={isLoading}
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className='bg-background'>
                        <SelectValue
                          defaultValue={field.value}
                          placeholder='Select a category'
                        />
                      </SelectTrigger>
                    </FormControl>
                    {/** Mapping categories which they are in database */}
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select a category for your AI
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {/** Creating AI configuration */}
          <div className='space-y-2 w-full'>
            <div>
              <h3 className='text-lg font-medium'>Configuration</h3>
              <p className='text-sm text-muted-foreground'>
                Detailed instructions for AI Behaviour
              </p>
            </div>
            <Separator className='bg-primary/10' />
          </div>
          {/** Form character description */}
          <FormField
            name='instructions'
            control={form.control}
            render={({ field }) => (
              <FormItem className='col-span-2 md:col-span-1'>
                <FormLabel>Instructions</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder={PREAMBLE}
                    {...field}
                    className='bg-background resize-none'
                    rows={7}
                  />
                </FormControl>
                <FormDescription>
                  Describe in detail your AI&apos;s backstory and relevant
                  details
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/** conversation */}
          <FormField
            name='seed'
            control={form.control}
            render={({ field }) => (
              <FormItem className='col-span-2 md:col-span-1'>
                <FormLabel>Example conversation</FormLabel>
                <FormControl>
                  <Textarea
                    disabled={isLoading}
                    placeholder={SEED_CHAT}
                    {...field}
                    className='bg-background resize-none'
                    rows={7}
                  />
                </FormControl>
                <FormDescription>
                  Describe in detail your AI&apos;s backstory and relevant
                  details
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='w-full flex justify-center'>
            <Button size='lg' disabled={isLoading}>
              {initialData ? 'Edit your character' : 'Create your character'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
