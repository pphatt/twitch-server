import { randomUUID } from "crypto"
import { Expose, Type } from "class-transformer"
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from "class-validator"
import { BaseAggregate } from "src/common/aggregate"
import { type Device } from "../entity/devices.entity"
import { ExternalLink } from "../entity/external-links.entity"
import { type LoginHistory } from "../entity/login-histories.entity"
import { type Token } from "../entity/tokens.entity"

interface UserAggregateProps {
  name: string
  displayName: string
  slug: string
  email: string
  password: string
  phoneNumber: string
  dob: Date
  emailVerifyToken?: string
  phoneVerifyToken?: string
  forgotPasswordToken?: string
  isLive?: boolean
  isActive?: boolean
  view?: number
  bio?: string
  avatar?: string
  lastUsernameChangeAt?: Date
  thumbnail?: string
  devices?: Device[]
  tokens?: Token[]
  loginHistories?: LoginHistory[]
  externalLinks?: ExternalLink[]
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
}
export class UserAggregate extends BaseAggregate {
  @IsString()
  @Expose()
  private _name: string
  @IsString()
  @Expose()
  private _displayName: string

  @IsString()
  @Expose()
  private _slug: string

  @IsEmail()
  @Expose()
  private _email: string
  @IsString()
  private _password: string

  @IsString()
  @Expose()
  private _phoneNumber: string

  @Type(() => Date)
  @IsDate()
  @Expose()
  private _dob: Date

  @IsString()
  @Expose()
  private _emailVerifyToken: string = ""

  @IsString()
  @Expose()
  private _phoneVerifyToken: string = ""
  @IsString()
  @Expose()
  private _forgotPasswordToken: string = ""

  @IsBoolean()
  @Expose()
  private _isLive: boolean = false
  @IsBoolean()
  @Expose()
  private _isActive: boolean = true

  @IsInt()
  @Min(0)
  @Expose()
  private _view: number = 0

  @IsString()
  @IsOptional()
  @Expose()
  private _bio?: string

  @IsString()
  @IsOptional()
  @Expose()
  private _avatar?: string

  @Type(() => Date)
  @IsOptional()
  @Expose()
  private _lastUsernameChangeAt: Date

  @IsString()
  @IsOptional()
  @Expose()
  private _thumbnail?: string
  @Expose()
  private _tokens: Token[]
  @Expose()
  private _devices: Device[]
  @Expose()
  private _loginHistories: LoginHistory[]
  @Expose()
  private _externalLinks: ExternalLink[]

  constructor(props: UserAggregateProps, id?: string) {
    super()
    this._id = id || randomUUID()
    this._name = props.name ?? ""
    this._displayName = props.displayName ?? ""
    this._slug = props.slug ?? ""
    this._email = props.email ?? ""
    this._password = props.password ?? ""
    this._phoneNumber = props.phoneNumber ?? ""
    this._dob = props.dob
    this._emailVerifyToken = props.emailVerifyToken ?? ""
    this._phoneVerifyToken = props.phoneVerifyToken ?? ""
    this._forgotPasswordToken = props.forgotPasswordToken ?? ""
    this._isLive = props.isLive ?? false
    this._isActive = props.isActive ?? true
    this._view = props.view ?? 0
    this._bio = props.bio
    this._avatar = props.avatar
    this._lastUsernameChangeAt = props.lastUsernameChangeAt
    this._thumbnail = props.thumbnail

    this._devices = props.devices || []
    this._tokens = props.tokens || []
    this._loginHistories = props.loginHistories || []
    this._externalLinks = props.externalLinks || []
    this._createdAt = props.createdAt || new Date()
    this._updatedAt = props.updatedAt || new Date()
    this._deletedAt = props.deletedAt
  }
  // Getters and Setters

  get name(): string {
    return this._name
  }

  set name(value: string) {
    this._name = value
  }
  get displayName(): string {
    return this._displayName
  }
  set displayName(value: string) {
    this._displayName = value
  }

  get slug(): string {
    return this._slug
  }

  set slug(value: string) {
    this._slug = value
  }

  get email(): string {
    return this._email
  }

  set email(value: string) {
    this._email = value
  }

  get password(): string {
    return this._password
  }

  set password(value: string) {
    this._password = value
  }

  get phoneNumber(): string {
    return this._phoneNumber
  }

  set phoneNumber(value: string) {
    this._phoneNumber = value
  }

  get dob(): Date {
    return this._dob
  }

  set dob(value: Date) {
    this._dob = value
  }

  get emailVerifyToken(): string {
    return this._emailVerifyToken
  }

  set emailVerifyToken(value: string) {
    this._emailVerifyToken = value
  }

  get phoneVerifyToken(): string {
    return this._phoneVerifyToken
  }

  set phoneVerifyToken(value: string) {
    this._phoneVerifyToken = value
  }
  get forgotPasswordToken(): string {
    return this._forgotPasswordToken
  }
  set forgotPasswordToken(value: string) {
    this._forgotPasswordToken = value
  }

  get isLive(): boolean {
    return this._isLive
  }

  set isLive(value: boolean) {
    this._isLive = value
  }
  get isActive(): boolean {
    return this._isActive
  }

  set isActive(value: boolean) {
    this._isActive = value
  }

  get view(): number {
    return this._view
  }

  set view(value: number) {
    this._view = value
  }

  get bio(): string | undefined {
    return this._bio
  }

  set bio(value: string | undefined) {
    this._bio = value
  }

  get avatar(): string | undefined {
    return this._avatar
  }

  set avatar(value: string | undefined) {
    this._avatar = value
  }
  get lastUsernameChangeAt(): Date {
    return this._lastUsernameChangeAt
  }
  set lastUsernameChangeAt(value: Date) {
    this._lastUsernameChangeAt = value
  }
  get thumbnail(): string | undefined {
    return this._thumbnail
  }

  set thumbnail(value: string | undefined) {
    this._thumbnail = value
  }
  get devices(): Device[] {
    return this._devices
  }
  set devices(value: Device | undefined) {
    this._devices.push(value)
  }
  get tokens(): Token[] {
    return this._tokens
  }
  set tokens(value: Token | undefined) {
    this._tokens.push(value)
  }
  // TODO: Update later
}
