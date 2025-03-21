import { Module } from "@nestjs/common"
import { CqrsModule } from "@nestjs/cqrs"
import { FollowersDatabaseModule } from "src/module/followers/infrastructure/database/followers.database.module"
import { FriendsDatabaseModule } from "src/module/friends/infrastructure/database/friend.database.module"
import { ImageModule } from "src/module/image/application/image.module"
import { UserDatabaseModule } from "src/module/users/infrastructure/database/user.database.module"
import { PostsDatabaseModule } from "../infrastructure/database/posts.database.module"
import { PostsController } from "../presentation/posts.controller"
import { CreateUserPostHandler } from "./command/create-user-post/create-user-post.handler"
import { DeleteUserPostHandler } from "./command/delete-user-post/delete-user-post.handler"
import { EditUserPostHandler } from "./command/edit-user-post/edit-user-post.handler"
import { ReactToPostHandler } from "./command/react-to-post/react-to-post.handler"
import { SharePostHandler } from "./command/share-post/share-post.handler"
import { ToggleHidePostsFromUserHandler } from "./command/toggle-hide-posts-from-user/toggle-hide-posts-from-user.handler"
import { PostsService } from "./posts.service"
import { GetAllReactionsHandler } from "./query/get-all-reactions/get-all-reactions.handler"
import { GetReactionsByTypeHandler } from "./query/get-reactions-by-type/get-reactions-by-type.handler"
import { GetUserFeedHandler } from "./query/get-user-feed/get-user-feed.handler"
import { GetUserPostsHandler } from "./query/get-user-posts/get-user-posts.handler"
import { SearchPostHandler } from "./query/search-post/search-post.handler"

const commandHandlers = [
  ReactToPostHandler,
  ToggleHidePostsFromUserHandler,
  CreateUserPostHandler,
  DeleteUserPostHandler,
  EditUserPostHandler,
  SharePostHandler,
]
const queryHandlers = [
  GetAllReactionsHandler,
  GetReactionsByTypeHandler,
  GetUserPostsHandler,
  GetUserFeedHandler,
  SearchPostHandler,
]
@Module({
  controllers: [PostsController],
  providers: [PostsService, ...commandHandlers, ...queryHandlers],
  imports: [
    CqrsModule,
    PostsDatabaseModule,
    UserDatabaseModule,
    ImageModule,
    FriendsDatabaseModule,
    FollowersDatabaseModule,
  ],
})
export class PostsModule {}
