import { CommandHandler } from "@nestjs/cqrs"
import {
  CommandError,
  CommandErrorCode,
  CommandErrorDetailCode,
} from "libs/exception/application/command"
import { DomainError } from "libs/exception/domain"
import { InfrastructureError } from "libs/exception/infrastructure"
import { EFriendRequestStatus } from "src/module/friends/domain/enum/friend-request-status.enum"
import { IFriendRepository } from "src/module/friends/domain/repository/friend.interface.repository"
import { IUserRepository } from "src/module/users/domain/repository/user/user.interface.repository"
import { AcceptFriendRequestCommand } from "./accept-friend-request.command"

@CommandHandler(AcceptFriendRequestCommand)
export class AcceptFriendRequestHandler {
  constructor(
    private readonly friendRepository: IFriendRepository,
    private readonly userRepository: IUserRepository,
  ) {}
  async execute(command: AcceptFriendRequestCommand) {
    const { senderId, receiverId } = command
    try {
      if (!senderId || senderId.length === 0) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: "Sender id can not be empty",
          info: {
            errorCode: CommandErrorDetailCode.DATA_FROM_CLIENT_CAN_NOT_BE_EMPTY,
            field: "senderId",
          },
        })
      }
      if (!receiverId || receiverId.length === 0) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: "Receiver can not be empty",
          info: {
            errorCode: CommandErrorDetailCode.DATA_FROM_CLIENT_CAN_NOT_BE_EMPTY,
            field: "receiverId",
          },
        })
      }
      const [sender, receiver] = await Promise.all([
        this.userRepository.findById(senderId),
        this.userRepository.findById(receiverId),
      ])
      if (!sender) {
        throw new CommandError({
          code: CommandErrorCode.NOT_FOUND,
          message: "Sender not found",
          info: {
            errorCode: CommandErrorDetailCode.USER_NOT_FOUND,
          },
        })
      }
      if (!receiver) {
        throw new CommandError({
          code: CommandErrorCode.NOT_FOUND,
          message: "Receiver not found",
          info: {
            errorCode: CommandErrorDetailCode.USER_NOT_FOUND,
          },
        })
      }
      const friendRequest = await this.friendRepository.getFriendRequest(
        sender,
        receiver,
      )
      if (!friendRequest) {
        throw new CommandError({
          code: CommandErrorCode.NOT_FOUND,
          message: "Friend request not found",
          info: {
            errorCode: CommandErrorDetailCode.NOT_FOUND,
          },
        })
      }
      // check already friend
      const isFriend = await this.friendRepository.isFriend(sender, receiver)
      if (isFriend) {
        throw new CommandError({
          code: CommandErrorCode.BAD_REQUEST,
          message: "Already friend",
          info: {
            errorCode: CommandErrorDetailCode.ALREADY_EXIST,
          },
        })
      }
      await this.friendRepository.acceptFriendRequest(friendRequest)
      //TODO(notify): Send notification
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
