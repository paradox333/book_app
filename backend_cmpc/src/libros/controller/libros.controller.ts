import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res, UseGuards, HttpCode, UseInterceptors, UploadedFile, HttpStatus } from '@nestjs/common';
import { LibrosService } from '../service/libros.service';
import { CreateLibroDto } from '../dto/create-libro.dto';
import { UpdateLibroDto } from '../dto/update-libro.dto';
import { Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCompleteLibroDto } from '../dto/create-complete-libro.dto';
import { Libro } from '../models/libro.model';


@UseGuards(JwtAuthGuard)
@Controller('libros')
export class LibrosController {
  constructor(private readonly librosService: LibrosService) {}

  @Post()
  create(@Body() createLibroDto: CreateLibroDto) {
    return this.librosService.create(createLibroDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen'))
  async createComplete(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: CreateCompleteLibroDto,
  ): Promise<Libro> {

    let fileInfo: { buffer: Buffer; originalname: string } | undefined;
    if (file) {
      fileInfo = {
        buffer: file.buffer,
        originalname: file.originalname,
      };
    }
    console.log('info: ', fileInfo)
    return this.librosService.createCompleteLibro(body, fileInfo);
  }

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('id') id?: string,
    @Query('titulo') titulo?: string,
    @Query('autor') autor?: string,
    @Query('editorial') editorial?: string,
    @Query('genero') genero?: string,
    @Query('disponible') disponible?: boolean,
    @Query('sortBy') sortBy: string = 'titulo', // Nuevo parámetro
    @Query('sortOrder') sortOrder: 'asc' | 'desc' = 'asc'
  ) {
    return this.librosService.findAll(Number(page), Number(limit), {
      id,
      titulo,
      autor,
      editorial,
      genero,
      disponible,
    }, sortBy, sortOrder);
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
