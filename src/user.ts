import 'reflect-metadata';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Post } from './post';

@ObjectType()
export class User {
  @Field(() => ID)
  userId: number;

  @Field(() => String, { nullable: true })
  name?: string | null;

  @Field(() => [Post], { nullable: true })
  posts?: [Post] | null;
}
