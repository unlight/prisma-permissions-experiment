import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// A `main` function so that we can use async/await
async function main() {
  // Create roles
  const role1 = await prisma.role.create({
    data: {
      name: 'Applicant',
    },
  });
  const role2 = await prisma.role.create({
    data: {
      name: 'Watcher',
    },
  });
  // Create categories
  const category1 = await prisma.category.create({
    data: {
      name: 'ForApplicants',
    },
  });
  const category2 = await prisma.category.create({
    data: {
      name: 'ForUsers',
    },
  });

  // Seed the database with users and posts
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@prisma.io',
      name: 'Alice',
      posts: {
        create: {
          title: 'Watch the talks from Prisma Day 2019',
          content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
          published: true,
          category: {
            connect: {
              categoryId: category1.categoryId,
            },
          },
        },
      },
      roles: {
        connect: {
          id: role1.id,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: 'bob@prisma.io',
      name: 'Bob',
      posts: {
        create: [
          {
            title: 'Subscribe to GraphQL Weekly for community news',
            content: 'https://graphqlweekly.com/',
            published: true,
            category: {
              connect: {
                categoryId: category2.categoryId,
              },
            },
          },
          {
            title: 'Follow Prisma on Twitter',
            content: 'https://twitter.com/prisma/',
            published: false,
            category: {
              connect: {
                categoryId: category2.categoryId,
              },
            },
          },
        ],
      },
      roles: {
        connect: {
          id: role2.id,
        },
      },
    },
    include: {
      posts: true,
    },
  });
  console.log(
    `Created users: ${user1.name} (${user1.posts.length} post) and ${user2.name} (${user2.posts.length} posts) `,
  );

  // Retrieve all published posts
  const allPosts = await prisma.post.findMany({
    where: { published: true },
  });
  console.log(`Retrieved all published posts: `, allPosts);

  // Create a new post (written by an already existing user with email alice@prisma.io)
  const newPost = await prisma.post.create({
    data: {
      title: 'Join the Prisma Slack community',
      content: 'http://slack.prisma.io',
      published: false,
      author: {
        connect: {
          email: 'alice@prisma.io',
        },
      },
      category: {
        connect: {
          categoryId: category2.categoryId,
        },
      },
    },
  });
  console.log(`Created a new post: `, newPost);

  // Publish the new post
  const updatedPost = await prisma.post.update({
    where: {
      id: newPost.id,
    },
    data: {
      published: true,
    },
  });
  console.log(`Published the newly created post: `, updatedPost);

  // Retrieve all posts by user with email alice@prisma.io
  const postsByUser = await prisma.user
    .findUnique({
      where: {
        email: 'alice@prisma.io',
      },
    })
    .posts();
  console.log(`Retrieved all posts from a specific user: `, postsByUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
