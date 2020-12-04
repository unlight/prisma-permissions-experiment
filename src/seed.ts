import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query'],
});

// @ts-ignore
prisma.$on('query', (event: any) => {
  console.log('prisma:query:params', event.params);
});

// A `main` function so that we can use async/await
async function main() {
  // Create categories
  const category1 = await prisma.category.create({
    data: {
      name: 'ForUsers',
    },
  });
  const category2 = await prisma.category.create({
    data: {
      name: 'ForAdmins',
    },
  });

  // Create users with roles and posts
  await prisma.user.create({
    data: {
      name: 'Alice',
      roles: {
        create: [
          {
            // roleId: 1,
            name: 'User',
          },
        ],
      },
    },
  });
  await prisma.user.create({
    data: {
      name: 'Bob',
      roles: {
        connect: {
          roleId: 1, // User
        },
        create: [
          {
            // roleId: 2,
            name: 'Admin',
          },
        ],
      },
      posts: {
        create: [
          {
            title: 'Hello all',
            category: {
              connect: {
                categoryId: category1.categoryId,
              },
            },
          },
          {
            title: 'For admins',
            category: {
              connect: {
                categoryId: category2.categoryId,
              },
            },
          },
          {
            title: 'Post without category',
          },
        ],
      },
    },
  });

  // Define permissions
  // Users (roleId: 1) can view posts only in category1
  await prisma.permission.create({
    data: {
      viewPosts: true,
      role: {
        connect: {
          roleId: 1,
        },
      },
      category: {
        connect: {
          categoryId: category1.categoryId,
        },
      },
    },
  });
  // Admins (roleId: 2) can view posts in any categories (category = null)
  await prisma.permission.create({
    data: {
      viewPosts: true,
      role: {
        connect: {
          roleId: 2,
        },
      },
      // category: null
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
