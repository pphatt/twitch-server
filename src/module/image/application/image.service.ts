import { InjectFlowProducer, InjectQueue } from "@nestjs/bullmq"
import { Injectable, Logger } from "@nestjs/common"
import {
  FlowProducer,
  FlowProducerListener,
  JobNode,
  Queue,
  QueueEvents,
} from "bullmq"
import { Bull } from "libs/constants/bull"
import {
  CommandError,
  CommandErrorCode,
} from "libs/exception/application/command"
import { DomainError } from "libs/exception/domain"
import { InfrastructureError } from "libs/exception/infrastructure"
import { Image } from "../domain/entity/image.entity"
import { EImage } from "../domain/enum/image.enum"
import { IImageRepository } from "../domain/repository/image.interface.repository"

@Injectable()
export class ImageService {
  private logger = new Logger(ImageService.name)

  constructor(
    @InjectFlowProducer(Bull.flow.image)
    private readonly imageUpdateFlow: FlowProducer,
    @InjectQueue(Bull.queue.image.upload)
    private readonly imageUploadQueue: Queue,
    @InjectQueue(Bull.queue.image.remove)
    private readonly imageRemoveQueue: Queue,
    private readonly imageRepository: IImageRepository,
  ) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string,
    applicableId: string,
    applicableType: EImage,
    userId?: string,
  ) {
    try {
      const [rootJob, failedUploadJobs] = await Promise.all([
        this.imageUpdateFlow.add({
          name: Bull.job.image.upload,
          queueName: Bull.queue.image.upload,
          data: {
            file,
            folder,
            applicableId,
            applicableType,
          },
          children: [
            {
              name: Bull.job.image.optimize,
              queueName: Bull.queue.image.optimize,
              data: { file, folder },
            },
          ],
        }),
        this.imageUploadQueue.getFailed(),
      ])
      if ((await rootJob.job.getState()) === "failed") {
        console.log(this.imageUploadQueue)
        if (failedUploadJobs || failedUploadJobs.length !== 0) {
          failedUploadJobs.map((failedJob) => {
            throw new CommandError({
              code: CommandErrorCode.INTERNAL_SERVER_ERROR,
              message: failedJob.failedReason,
            })
          })
        }
      }

      this.imageUpdateFlow.on("error", (error) => {
        this.logger.error("Error in image flow", error)
      })
    } catch (err) {
      console.log("err", err)
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
  async getImageByApplicableId(applicableId: string): Promise<Image[] | null> {
    try {
      const images = await this.imageRepository.getImageByType(applicableId)
      return images ?? null
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
  async removeImage(image: Image) {
    try {
      const [job, failedUploadJobs] = await Promise.all([
        this.imageRemoveQueue.add(Bull.job.image.remove, {
          image,
        }),
        this.imageRemoveQueue.getFailed(),
      ])
      if ((await job.getState()) === "failed") {
        if (failedUploadJobs || failedUploadJobs.length !== 0) {
          failedUploadJobs.map((failedJob) => {
            throw new CommandError({
              code: CommandErrorCode.INTERNAL_SERVER_ERROR,
              message: failedJob.failedReason,
            })
          })
        }
      }
    } catch (err) {
      console.log("err", err)
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
