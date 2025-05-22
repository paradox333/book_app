import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Libro } from '../models/libro.model';
import { CreateLibroDto } from '../dto/create-libro.dto';
import { UpdateLibroDto } from '../dto/update-libro.dto';
import { paginate } from 'src/utils/paginate';
import { Response } from 'express';
import * as fastCsv from 'fast-csv';
import { Editorial } from 'src/editoriales/model/editorial.model';
import { Autor } from 'src/autores/model/autores.model';
import { Genero } from 'src/generos/model/genero.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class LibrosService {
  constructor(
    @InjectModel(Libro)
    private readonly libroModel: typeof Libro,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(createLibroDto: CreateLibroDto): Promise<Libro> {
    const libro = await this.libroModel.create(createLibroDto);

    this.logger.info('Libro creado', {
      context: 'LibrosService',
      operation: 'create',
      model: 'Libro',
      data: { id: libro.id, titulo: libro.titulo },
    });

    return libro;
  }

  async findAll(page = 1, limit = 10) {
    this.logger.info('Listando libros', {
      context: 'LibrosService',
      operation: 'findAll',
      pagination: { page, limit },
    });

    return paginate(this.libroModel, page, limit);
  }

  async findOne(id: number): Promise<Libro> {
    const libro = await this.libroModel.findByPk(id);
    if (!libro) {
      this.logger.warn('Libro no encontrado', {
        context: 'LibrosService',
        operation: 'findOne',
        id,
      });
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    return libro;
  }

  async update(id: number, updateLibroDto: UpdateLibroDto): Promise<Libro> {
    const libro = await this.findOne(id);
    await libro.update(updateLibroDto);

    this.logger.info('Libro actualizado', {
      context: 'LibrosService',
      operation: 'update',
      id,
      data: updateLibroDto,
    });

    return libro;
  }

  async remove(id: number): Promise<void> {
    const libro = await this.findOne(id);
    await libro.destroy();

    this.logger.info('Libro eliminado', {
      context: 'LibrosService',
      operation: 'remove',
      id,
    });
  }

  async restore(id: number): Promise<Libro> {
    const libro = await this.libroModel.findOne({
      where: { id },
      paranoid: false,
    });

    if (!libro) {
      this.logger.warn('Intento de restaurar libro inexistente', {
        context: 'LibrosService',
        operation: 'restore',
        id,
      });
      throw new NotFoundException(`Libro con ID ${id} no encontrado`);
    }

    await this.libroModel.restore({ where: { id } });

    this.logger.info('Libro restaurado', {
      context: 'LibrosService',
      operation: 'restore',
      id,
    });

    return this.libroModel.findByPk(id);
  }

  async export(res: Response) {
    const libros = await this.libroModel.findAll({
      raw: true,
      nest: true,
      include: [
        { model: Autor, attributes: ['nombre'] },
        { model: Editorial, attributes: ['nombre'] },
        { model: Genero, attributes: ['nombre'] },
      ],
    });

    const librosFormateados = libros.map(libro => ({
      id: libro.id,
      titulo: libro.titulo,
      autor: libro.autor?.nombre ?? '',
      editorial: libro.editorial?.nombre ?? '',
      genero: libro.genero?.nombre ?? '',
      precio: libro.precio,
      disponible: libro.disponible,
      imagen_url: libro.imagenUrl || '',
    }));

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="libros.csv"');

    const csvStream = fastCsv.format({ headers: true });
    csvStream.pipe(res);
    librosFormateados.forEach(libro => csvStream.write(libro));
    csvStream.end();

    this.logger.info('Exportación CSV completada', {
      context: 'LibrosService',
      operation: 'export',
      total: libros.length,
    });
  }
}
