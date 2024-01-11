import prismadb from '@/lib/prismadb';
import { CompanionForm } from './components/companion-form';
import { auth, redirectToSignIn } from '@clerk/nextjs';

/* The `interface CompanionId` is defining the structure of an object that has a `params` property,
which is an object itself. Inside the `params` object, there is a property called `companionId` of
type `string`. This interface is used to define the expected shape of an object that has these
properties. */
interface CompanionIdProps {
  params: {
    companionId: string;
  };
}

const CompanionId = async ({ params }: CompanionIdProps) => {
  const { userId } = auth();
  if(!userId){
    return redirectToSignIn()
  }

  /* The line `const companion = await prismadb.companion.findUnique({` is using the `prismadb` library
  to find a unique companion record in the database. */
  const companion = await prismadb.companion.findUnique({
    /* The `where` property is used to specify the condition for finding a specific record in the
    database. In this case, it is looking for a record where the `id` property matches the value of
    `params.companionId`. This is used to retrieve a specific companion from the database based on
    the provided `companionId`. */
    where: {
      id: params.companionId,
      userId,
    },
  });

  const categories = await prismadb.category.findMany();
  return <CompanionForm initialData={companion} categories={categories} />;
};

export default CompanionId;
