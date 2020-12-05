import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

async function main() {
  // @ts-ignore
  prisma.$on('query', (event: any) => {
    console.log('prisma:query:params', event.params);
  });

  const aliceUser = await prisma.user.findUnique({
    where: { name: 'Alice' },
  });
  console.log('aliceUser', aliceUser);
  console.log('Alice should see `Hello all`, `Post without category`');

  const aliceFeed = await prisma.post.findMany({
    where: {
      category: {
        permissions: {
          some: {
            viewPosts: true,
            role: {
              users: {
                some: {
                  userId: aliceUser.userId,
                },
              },
            },
          },
        },
      },
    },
  });
  console.log('aliceFeed', aliceFeed);

  const bobUser = await prisma.user.findUnique({
    select: {
      userId: true,
      name: true,
      roles: true,
    },
    where: { name: 'Bob' },
  });

  console.log('bob user', bobUser);

  const bobFullPerm = Boolean(
    await prisma.permission.findFirst({
      select: {
        categoryId: true,
      },
      where: {
        viewPosts: true,
        categoryId: null,
        role: {
          users: {
            some: {
              userId: { equals: bobUser.userId },
            },
          },
        },
      },
    }),
  );

  console.log('bobFullPerm', bobFullPerm);

  const bobFeed = await prisma.post.findMany({
    where: {
      category: bobFullPerm
        ? {}
        : {
            permissions: {
              some: {
                OR: [
                  { viewPosts: true, categoryId: null }, // DOES NOT WORK
                  {
                    viewPosts: true,
                    role: {
                      users: {
                        some: {
                          userId: bobUser.userId,
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
    },
  });
  console.log('bobFeed', bobFeed);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
