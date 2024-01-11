import { PrismaClient } from '@prisma/client';

/* The `declare global` block is used to declare a global variable named `prisma` with the type
`PrismaClient | undefined`. This allows the `prisma` variable to be accessed from anywhere in the
codebase without having to import it explicitly. */
declare global {
  var prisma: PrismaClient | undefined;
}

/* The line `const prismadb = globalThis.prisma || new PrismaClient();` is initializing a variable
called `prismadb`. */
const prismadb = globalThis.prisma || new PrismaClient();
/* The line `if (process.env.NODE_ENV !== 'production') globalThis.prisma = prismadb;` is checking the
value of the `NODE_ENV` environment variable. */
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prismadb;

export default prismadb;
