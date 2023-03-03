import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { ResponseFormatterInterceptor } from './common/api/response-formatter.interceptor';

@UseInterceptors(ResponseFormatterInterceptor)
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }
}
