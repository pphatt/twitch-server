import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString } from "class-validator"

export class SignupWithEmailRequestDto {
  @ApiProperty({
    description: "The email of the user",
    example: "john@example.com",
  })
  @IsString()
  @IsNotEmpty()
  readonly email: string

  @ApiProperty({
    description: "The password of the user",
    example: "strong_password",
  })
  @IsString()
  @IsNotEmpty()
  readonly password: string

  @ApiProperty({
    description: "Date of birth in ISO 8601 format",
    example: "2000-01-01",
  })
  @IsString()
  @IsNotEmpty()
  readonly dob: Date

  @ApiProperty({
    description: "Full name of the user",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string
}
