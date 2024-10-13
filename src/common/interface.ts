import { JwtSignOptions } from "@nestjs/jwt"
import { ApiPropertyOptional } from "@nestjs/swagger"
import { Type } from "class-transformer"
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator"
import { JwtPayload } from "jsonwebtoken"
import { tokenType } from "libs/constants/enum"

export class UserFilters {
  @ApiPropertyOptional({
    description: "Whether the user is live or not",
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  isLive?: boolean | null
  @ApiPropertyOptional({
    description: "Whether the user is active or not",
    example: true,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean | null
}
export interface TokenPayload extends JwtPayload {
  sub?: string
  email?: string
  username?: string
  deviceId?: string
  userAgent?: string
  tokenType: tokenType
}
