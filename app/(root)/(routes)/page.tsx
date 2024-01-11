import Categories from '@/components/Categories';
import Companions from '@/components/companions';
import SearchInput from '@/components/search-input';
import prismadb from '@/lib/prismadb';

interface RootPageProps {
  searchParams: {
    categoryId: string;
    name: string;
  };
}

const RootPage = async ({ searchParams }: RootPageProps) => {
  const data = await prismadb.companion.findMany({
    /* The `where` property in the `prismadb.companion.findMany()` method is used to specify the
  conditions that the query results must meet. In this case, it is filtering the results based on
  two conditions: */
    where: {
      categoryId: searchParams.categoryId,
      name: {
        search: searchParams.name,
      },
    },
    /* The `orderBy` property in the `prismadb.companion.findMany()` method is used to specify the order
   in which the query results should be sorted. In this case, it is sorting the results based on the
   `createdAt` field in descending order (`'desc'`). This means that the most recently created
   objects will appear first in the result set. */
    orderBy: {
      createdAt: 'desc',
    },
    /* The `include` property in the `prismadb.companion.findMany()` method is used to specify related
   models or fields that should be included in the query result. In this case, it includes the
   `_count` field, which allows you to retrieve the count of related `messages` for each `companion`
   object. */
    include: {
      _count: {
        select: {
          messages: true,
        },
      },
    },
  });

  /* The line `const categories = await prismadb.category.findMany()` is making an asynchronous call to
the `findMany()` method of the `category` object in the `prismadb` library. This method is likely
querying a database or an API to retrieve a list of categories. The `await` keyword is used to wait
for the promise returned by the `findMany()` method to resolve before assigning the result to the
`categories` variable. */
  const categories = await prismadb.category.findMany();

  return (
    <div className='h-full p-4 space-y-2'>
      <SearchInput />
      <Categories data={categories} />
      <Companions data={data} />
    </div>
  );
};

export default RootPage;
