import { User } from "@prisma/client"
import { UserAggregate } from "src/module/users/domain/aggregate"
import { FriendRequest } from "../entity/friend-request.entity"
import { Friend } from "../entity/friend.entity"

export abstract class IFriendRepository {
  // Friends management
  addFriend: (friend: Friend) => Promise<void>
  removeFriend: (friend: Friend) => Promise<void>
  getFriends: (user: UserAggregate) => Promise<Friend[]>
  getFriend: (
    user: UserAggregate,
    friend: UserAggregate,
  ) => Promise<Friend | null>
  isFriend: (user: UserAggregate, friend: UserAggregate) => Promise<boolean>

  // Friend recommendations
  getMutualFriends: (
    user: UserAggregate,
    friend: UserAggregate,
  ) => Promise<Friend[]>
  //   getFriendSuggestions(user: UserAggregate): Promise<UserAggregate[]>
  // Friend request management
  getFriendRequest: (
    sender: UserAggregate,
    receiver: UserAggregate,
  ) => Promise<FriendRequest>
  sendFriendRequest: (request: FriendRequest) => Promise<void>
  acceptFriendRequest: (request: FriendRequest) => Promise<void>
  rejectFriendRequest: (request: FriendRequest) => Promise<void>
  getListFriendRequest: (user: UserAggregate) => Promise<FriendRequest[]>
}
