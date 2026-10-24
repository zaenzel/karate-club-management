import { Controller, Get } from '@nestjs/common';

import { BeltsService, type BeltResponse } from './belts.service.js';

@Controller('belts')
export class BeltsController {
  constructor(private readonly beltsService: BeltsService) {}

  @Get()
  list(): Promise<BeltResponse[]> {
    return this.beltsService.list();
  }
}
