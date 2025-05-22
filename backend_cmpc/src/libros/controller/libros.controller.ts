import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UseGuards } from '@nestjs/common';
import { LibrosService } from '../service/libros.service';
import { CreateLibroDto } from '../dto/create-libro.dto';
import { UpdateLibroDto } from '../dto/update-libro.dto';
import { Response } from 'express';
import * as fastCsv from 'fast-csv';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Post()
  create(@Body() createLibroDto: CreateLibroDto) {
    return this.librosService.create(createLibroDto);
  }

  @Get()
    findAll(
      @Query('page') page: string = '1',
      @Query('limit') limit: string = '10',
    ) {
      return this.librosService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.librosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLibroDto: UpdateLibroDto) {
    return this.librosService.update(+id, updateLibroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.librosService.remove(+id);
  }

  @Post(':id/restore')
  async restore(@Param('id') id: number) {
    return this.librosService.restore(id);
  }

  @Get('exportar/csv')
  async exportCsv(@Res() res: Response) {
    await this.librosService.export(res);
  }
}
