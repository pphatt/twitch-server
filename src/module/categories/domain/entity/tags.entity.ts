import { randomUUID } from "crypto"
import { BaseEntity } from "src/common/entity"
import { ETag } from "../enum/tags.enum"
import { Category } from "./categories.entity"

export class Tag extends BaseEntity {
  private props: {
    name: string
    slug: string
    applicableTo: ETag
    createdAt?: Date
    updatedAt?: Date
    deletedAt?: Date
  }
  constructor(
    props: {
      name: string
      slug: string
      applicableTo: ETag
      createdAt?: Date
      updatedAt?: Date
      deletedAt?: Date
    },
    id?: string,
  ) {
    super()
    this._id = id || randomUUID()

    this.props = {
      name: props.name ?? "",
      slug: props.slug ?? "",
      applicableTo: props.applicableTo ?? ETag.CATEGORY,
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
      deletedAt: props.deletedAt,
    }
  }
  get slug(): string {
    return this.props.slug
  }
  set slug(value: string) {
    this.props.slug = value
  }
  get name(): string {
    return this.props.name
  }
  set name(value: string) {
    this.props.name = value
  }
  set applicableTo(value: ETag) {
    this.props.applicableTo = value
  }
  get applicableTo(): ETag {
    return this.props.applicableTo
  }
}
