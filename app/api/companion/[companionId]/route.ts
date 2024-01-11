import prismadb from '@/lib/prismadb';
import { auth, currentUser } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

/**
 * The above function is an asynchronous function that handles a POST request.
 * @param {Request} req - The `req` parameter is of type `Request`. It represents the incoming HTTP
 * request received by the server.
 */
export async function PATCH(
  req: Request,
  { params }: { params: { companionId: string } }
) {
  try {
    /* The line `const body = await req.json();` is parsing the JSON data from the request body. It is
using the `json()` method of the `req` object to asynchronously read and parse the JSON data. The
parsed JSON data is then stored in the `body` variable for further processing. */
    const body = await req.json();
    /* The line `const user = await currentUser();` is calling the `currentUser` function from the
`@clerk/nextjs` library. This function is used to retrieve the currently authenticated user. */
    const user = await currentUser();
    /* The line `const { src, name, description, instructions, seed, categoryId } = body;` is using object
destructuring to extract specific properties from the `body` object. */
    const { src, name, description, instructions, seed, categoryId } = body;

    /* The code `if(!params.companionId){ return new NextResponse('Companion ID is required',
      {status: 400}) }` is checking if the `companionId` parameter is missing or falsy. If the
      `companionId` parameter is missing or falsy, it means that the request is missing the required
      `companionId` parameter. In this case, it returns a `NextResponse` object with a status code
      of 400 (Bad Request) and a message of "Companion ID is required". This is used to handle cases
      where the `companionId` parameter is not provided in the request. */
    if (!params.companionId) {
      return new NextResponse('Companion ID is required', { status: 400 });
    }

    //Checking if we are log in
    if (!user || !user.id || !user.firstName) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    /* The code `if(!src || !name || !description || !instructions || !seed || !categoryId)` is
    checking if any of the required fields (`src`, `name`, `description`, `instructions`, `seed`,
    `categoryId`) are missing or falsy. If any of these fields are missing or falsy, it throws a
    `NextResponse` with a status code of 400 (Bad Request) and a message of "Missing required
    fields". This is used to handle cases where the request body does not contain all the necessary
    data for creating a new companion object in the database. */
    if (
      !src ||
      !name ||
      !description ||
      !instructions ||
      !seed ||
      !categoryId
    ) {
      throw new NextResponse('Missing required fields', { status: 400 });
    }

    //Checking for subscription

    /* The code `const companion = await prismadb.companion.create({ ... })` is creating a new
    companion object in the database using the `prismadb` library. */
    const companion = await prismadb.companion.update({
      where: {
        id: params.companionId,
        userId: user.id,
      },
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        instructions,
        seed,
      },
    });

    return NextResponse.json(companion);
  } catch (error) {
    console.log('[COMPANION_PATCH]', error);
    return new NextResponse('Initial Error', { status: 500 });
  }
}

/* The `export async function DELETE()` function is a handler for a DELETE request. It takes two
parameters: `req` of type `Request`, which represents the incoming HTTP request received by the
server, and `{ params }` of type `{ params: { companionId: string } }`, which is an object
containing the `companionId` parameter extracted from the request URL. */
export async function DELETE(
  req: Request,
  { params }: { params: { companionId: string } }
) {
 /* The code block is handling a DELETE request for deleting a companion object from the database. */
  try {
    const {userId} = auth()


    //Here we are checking if user is log in. If not the error will show with status 401
    if(!userId){
      return new NextResponse('Unauthorized', {status: 401})
    }

  /* The code `const companion = await prismadb.companion.delete({ ... })` is deleting a companion
  object from the database. It uses the `prismadb` library to perform the deletion. */
    const companion = await prismadb.companion.delete({
      where: {
        userId,
        id:params.companionId
      }
    })
    return NextResponse.json(companion)
  }catch(error){
    console.log('[COMPANION_DELETE]', error)
    return new NextResponse('Internal error', {status: 500})
  }
}
