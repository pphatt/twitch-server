import { IoAdapter } from "@nestjs/platform-socket.io"
import { createAdapter } from "@socket.io/redis-adapter"
import { createClient } from "redis"
import { ServerOptions } from "socket.io"

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://127.0.0.1:6379` })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])

    this.adapterConstructor = createAdapter(pubClient, subClient)
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options)
    server.adapter(this.adapterConstructor)
    return server
  }
}
