import prismadb from '@/lib/prismadb';
import { currentUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { NextResponse } from 'next/server';

/**
 * The above function is an asynchronous function that handles a POST request.
 * @param {Request} req - The `req` parameter is of type `Request`. It represents the incoming HTTP
 * request received by the server.
 */
export async function POST(req: Request) {
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

    //Checking if we are log in
    if(!user || !user.id || !user.firstName){
        return new NextResponse('Unauthorized', {status: 401})
    }
    
    /* The code `if(!src || !name || !description || !instructions || !seed || !categoryId)` is
    checking if any of the required fields (`src`, `name`, `description`, `instructions`, `seed`,
    `categoryId`) are missing or falsy. If any of these fields are missing or falsy, it throws a
    `NextResponse` with a status code of 400 (Bad Request) and a message of "Missing required
    fields". This is used to handle cases where the request body does not contain all the necessary
    data for creating a new companion object in the database. */
    if(!src || !name || !description || !instructions || !seed || !categoryId){
        throw new NextResponse("Missing required fields", {status: 400})
    }
    
    //Checking for subscription


    /* The code `const companion = await prismadb.companion.create({ ... })` is creating a new
    companion object in the database using the `prismadb` library. */
    const companion = await prismadb.companion.create({
        data:{
            categoryId,
            userId: user.id,
            userName: user.firstName,
            src,
            name,
            description,
            instructions,
            seed
        }
    })

    return NextResponse.json(companion)
  } catch (error) {
    console.log('[COMPANION_POST]', error);
    return new NextResponse('Initial Error', { status: 500 });
  }
}
