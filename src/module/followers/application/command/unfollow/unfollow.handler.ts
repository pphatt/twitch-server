import { CommandHandler } from "@nestjs/cqrs"
import {
  CommandError,
  CommandErrorCode,
  CommandErrorDetailCode,
} from "libs/exception/application/command"
import { DomainError } from "libs/exception/domain"
import { InfrastructureError } from "libs/exception/infrastructure"
import { FollowerFactory } from "src/module/followers/domain/factory/followers.factory"
import { IFollowersRepository } from "src/module/followers/domain/repository/followers.interface.repository"
import { IUserRepository } from "src/module/users/domain/repository/user/user.interface.repository"
import { UnfollowCommand } from "./unfollow.command"

@CommandHandler(UnfollowCommand)
export class UnfollowCommandHandler {
  constructor(
    private readonly followRepository: IFollowersRepository,
    private readonly followFactory: FollowerFactory,
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(command: UnfollowCommand) {
    const { sourceUserId, destinationUserId } = command
    try {
      if (!sourceUserId) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: "User id can not be empty",
          info: {
            errorCode: CommandErrorDetailCode.ID_CAN_NOT_BE_EMPTY,
          },
        })
      }
      const sourceUser = await this.userRepository.findById(sourceUserId)
      if (!sourceUser) {
        throw new CommandError({
          code: CommandErrorCode.NOT_FOUND,
          message: "Follower not found",
          info: {
            errorCode: CommandErrorDetailCode.USER_NOT_FOUND,
          },
        })
      }
      if (!destinationUserId) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: "User id can not be empty",
          info: {
            errorCode: CommandErrorDetailCode.ID_CAN_NOT_BE_EMPTY,
          },
        })
      }
      if (sourceUserId === destinationUserId) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: "You can not unfollow your self",
          info: {
            errorCode: CommandErrorDetailCode.SOMETHING_WRONG_HAPPEN,
          },
        })
      }
      const destinationUser =
        await this.userRepository.findById(destinationUserId)
      if (!destinationUser) {
        throw new CommandError({
          code: CommandErrorCode.NOT_FOUND,
          message: "User to follow not found",
          info: {
            errorCode: CommandErrorDetailCode.USER_NOT_FOUND,
          },
        })
      }
      const follow = this.followFactory.create({
        sourceUserId,
        destinationUserId,
      })
      await this.followRepository.removeFollower(follow)
    } catch (err) {
      if (
        err instanceof DomainError ||
        err instanceof CommandError ||
        err instanceof InfrastructureError
      ) {
        throw err
      }

      throw new CommandError({
        code: CommandErrorCode.INTERNAL_SERVER_ERROR,
        message: err.message,
      })
    }
  }
}
