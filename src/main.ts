import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from "@nestjs/common"
import { NestFactory, Reflector } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import config from "libs/config"
import { RedisIoAdapter } from "libs/config/redis.adapter"
import { ErrorInterceptor } from "libs/interceptor/error.interceptor"
import { LoggerInterceptor } from "libs/interceptor/logger.interceptor"
import { TransformInterceptor } from "libs/interceptor/response.interceptor"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const swaggerConfig = new DocumentBuilder()
    .addBearerAuth()
    .setTitle("Twitch API")
    .setDescription("API of Twitch server")
    .setVersion("1.0")
    .build()

  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup("api", app, document)
  // setup cors
  app.enableCors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "X-Requested-With",
    ],
  })

  // setup validation
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        const customErrorMessages = validationErrors.map((error) => {
          return {
            field: error.property,
            errors: Object.values(error.constraints || {}),
          }
        })
        return new BadRequestException({
          statusCode: 400,
          message: "Validation failed",
          errors: customErrorMessages,
        })
      },
      validationError: {
        target: false,
      },
      transform: true,
    }),
  )
  // set up interceptor
  app.useGlobalInterceptors(new TransformInterceptor(new Reflector()))
  app.useGlobalInterceptors(new ErrorInterceptor())
  app.useGlobalInterceptors(new LoggerInterceptor())
  // redis adapter
  const redisIoAdapter = new RedisIoAdapter(app)
  await redisIoAdapter.connectToRedis()
  app.useWebSocketAdapter(redisIoAdapter)
  await app.listen(config.APP_PORT || 3000)
}

bootstrap()
