import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import { Response } from "libs/constants/interface"
import { Observable } from "rxjs"
import { map } from "rxjs/operators"

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  constructor(private reflector: Reflector) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message:
            this.reflector.get<string>(
              "response_message",
              context.getHandler(),
            ) || "",
          data,
        }
      }),
    )
  }
}
