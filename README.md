# prisma-permissions-experiment

```sh
npm run dbpush
npx ts-node src/feed
```

Goal is to have permissions stored in database and restrict access to entries.

For example, we have blog with posts, each post can be published in one category.
User can have multiple roles. Permission table will look:

| permissionId | roleId | categoryId | viewPosts | editAny |
| -----------: | -----: | ---------: | --------: | ------: |
|            1 |      1 |          1 |         1 |       0 |
|            2 |      2 |       NULL |         1 |       1 |

First row tells that user with roleId = 1 can view posts in categoryId = 1.  
Second row tells that user with roleId = 2 can view posts in any category.

Our query should look (does not work).

```ts
const feed = await prisma.post.findMany({
  where: {
    category: {
      permissions: {
        some: {
          OR: [
            { viewPosts: true, categoryId: null },
            {
              viewPosts: true,
              role: {
                users: {
                  some: {
                    userId: user.userId,
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
```

And it does not work because prisma generates contradictory join conditions something like
`t1.category is not null and t2.categoryId is null`

### Solution 1

Separate query for checking `categoryId = null`

```ts
const hasFullPermissions = Boolean(
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
            userId: { equals: user.userId },
          },
        },
      },
    },
  }),
);
```

```ts
const feed = await prisma.post.findMany({
  where: {
    category: hasFullPermissions
      ? {}
      : {
          permissions: {
            some: {
              viewPosts: true,
              role: {
                users: {
                  some: {
                    userId: user.userId,
                  },
                },
              },
            },
          },
        },
  },
});
```

#### Pros/cons

- (-) Additional query/code
- (+) Posts can be published without category

### Solution 2

Explicitly define permissions for specific role and category

| permissionId | roleId | categoryId | viewPosts | editAny |
| -----------: | -----: | ---------: | --------: | ------: |
|            1 |      1 |          1 |         1 |       0 |
|            2 |      2 |          1 |         1 |       1 |
|            3 |      2 |          2 |         1 |       1 |

We replaced recored for roleId = 2 with categoryId = null by 2 rows for each categories

#### Pros/Cons

- (+) No additional code
- (-) Post cannot be published without category
- (+/-) Additional rows in tables which grows by M\*N
  (with 20 categories and 5 roles we must insert 5\*20 = 100 records which is not big deal for database)

### Non categorized permissions

For example, extend solution 2

| permissionId | roleId | categoryId | viewPosts | editAny | searchPosts | favoritePosts |
| -----------: | -----: | ---------: | --------: | ------: | ----------- | ------------- |
|            1 |      1 |          1 |         1 |       0 | NULL        | NULL          |
|            2 |      2 |          1 |         1 |       1 | NULL        | NULL          |
|            3 |      2 |          2 |         1 |       1 | NULL        | NULL          |
|            4 |      1 |       NULL |      NULL |    NULL | 1           | 1             |
