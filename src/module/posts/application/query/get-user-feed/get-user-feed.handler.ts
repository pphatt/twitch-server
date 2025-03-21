import { QueryHandler } from "@nestjs/cqrs"
import {
  QueryError,
  QueryErrorCode,
  QueryErrorDetailCode,
} from "libs/exception/application/query"
import { DomainError } from "libs/exception/domain"
import { InfrastructureError } from "libs/exception/infrastructure"
import { IFollowersRepository } from "src/module/followers/domain/repository/followers.interface.repository"
import { IFriendRepository } from "src/module/friends/domain/repository/friend.interface.repository"
import { ImageService } from "src/module/image/application/image.service"
import { IPostsRepository } from "src/module/posts/domain/repository/posts.interface.repository"
import { IUserRepository } from "src/module/users/domain/repository/user/user.interface.repository"
import { GetUserFeedQuery } from "./get-user-feed.query"
import { GetUserFeedResult } from "./get-user-feed.result"

@QueryHandler(GetUserFeedQuery)
export class GetUserFeedHandler {
  constructor(
    private readonly postRepository: IPostsRepository,
    private readonly userRepository: IUserRepository,
    private readonly imageService: ImageService,
    private readonly followRepository: IFollowersRepository,
    private readonly friendRepository: IFriendRepository,
  ) {}
  async execute(query: GetUserFeedQuery): Promise<GetUserFeedResult> {
    const { userId, limit, offset, order, orderBy } = query
    try {
      if (!userId || userId.length === 0) {
        throw new QueryError({
          code: QueryErrorCode.BAD_REQUEST,
          message: "User id can not be empty",
          info: {
            errorCode: QueryErrorDetailCode.DATA_FROM_CLIENT_CAN_NOT_BE_EMPTY,
            field: "userId",
          },
        })
      }
      const user = await this.userRepository.findById(userId)
      if (!user) {
        throw new QueryError({
          code: QueryErrorCode.NOT_FOUND,
          message: "User not found",
          info: {
            errorCode: QueryErrorDetailCode.USER_NOT_FOUND,
          },
        })
      }
      const friendIds = (await this.friendRepository.getFriends(user)).map(
        (e) => e.friendId,
      )
      const follower = await this.followRepository.findFollowingByUser(user.id)
      const followerIds = follower.map((e) => e.destinationUserId)
      const uniqueUserIds = Array.from(new Set([...friendIds, ...followerIds]))
      const hiddenUserIds = await this.postRepository.getHiddenUserIds(user)
      const posts = await this.postRepository.getPostOfUsers(
        uniqueUserIds.filter((id) => !hiddenUserIds.includes(id)),
        {
          limit,
          offset,
          orderBy: "createdAt",
          order: "desc",
        },
      )
      const result = await Promise.all(
        posts.map(async (p) => {
          const [images, owner] = await Promise.all([
            this.imageService.getImageByApplicableId(p.id),
            this.userRepository.findById(p.userId),
          ])
          const ownerAvatar = await this.imageService.getImageByApplicableId(
            owner.id,
          )
          return {
            user: {
              id: owner.id,
              username: owner.name,
              avatar: ownerAvatar[0]?.url ?? "",
            },
            info: {
              createdAt: p.createdAt.toISOString().split("T")[0],
              visibility: p.visibility,
              content: p.content,
              images: images.map((i) => ({ url: i.url })),
            },
          }
        }),
      )
      return { posts: result.filter((p) => p !== null) }
    } catch (err) {
      if (
        err instanceof DomainError ||
        err instanceof QueryError ||
        err instanceof InfrastructureError
      ) {
        throw err
      }

      throw new QueryError({
        code: QueryErrorCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      })
    }
  }
}
