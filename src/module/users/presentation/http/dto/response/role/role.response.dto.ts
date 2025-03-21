import { Expose } from "class-transformer"

export class RoleResponseDto {
  @Expose()
  id: string
  @Expose()
  name: string
  @Expose()
  createdAt: Date
  @Expose()
  updatedAt: Date
  @Expose()
  deletedAt: Date
}
