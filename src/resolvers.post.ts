import 'reflect-metadata';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Root,
  Context,
  Int,
  InputType,
  Field,
} from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { Post } from './post';
import { PrismaService } from './prisma.service';

@InputType()
class PostIDInput {
  @Field(() => Int)
  id: number;
}

@Resolver(Post)
export class PostResolver {
  constructor(@Inject(PrismaService) private prismaService: PrismaService) {}

  @Query(() => Post, { nullable: true })
  post(@Args('where') where: PostIDInput) {
    return this.prismaService.post.findUnique({
      where: { id: where.id },
    });
  }

  @Query(() => [Post])
  filterPosts(@Args('searchString') searchString: string) {
    return this.prismaService.post.findMany({
      where: {
        OR: [
          { title: { contains: searchString } },
          { content: { contains: searchString } },
        ],
      },
    });
  }

  @Query(() => [Post])
  feed(@Context() ctx) {
    return this.prismaService.post.findMany({
      where: {},
    });
  }

  @Mutation(() => Post, { nullable: true })
  deleteOnePost(
    @Args('where') where: PostIDInput,
    @Context() ctx,
  ): Promise<Post | null> {
    return this.prismaService.post.delete({
      where: {
        id: where.id,
      },
    });
  }
}
