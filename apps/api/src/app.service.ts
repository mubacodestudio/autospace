import { add } from '@autospace/sample-lib'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!' + add(3, 5)
  }
}
