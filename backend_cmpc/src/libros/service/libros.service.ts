import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Libro } from '../models/libro.model';
import { CreateLibroDto } from '../dto/create-libro.dto';
import { UpdateLibroDto } from '../dto/update-libro.dto';
import { paginate, PaginatedResult } from 'src/utils/paginate';
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

    // === MODIFICACIÓN CLAVE AQUÍ ===
    // Necesitas pasar las opciones 'include' a la consulta de Sequelize.
    // Si 'paginate' acepta un tercer argumento para opciones de consulta, úsalo.
    // De lo contrario, deberías hacer el findAll directamente aquí.

    // Opción 1: Si `paginate` acepta opciones de consulta
    const paginationOptions = {
      include: [
        { model: Autor, attributes: ['id', 'nombre'], as: 'autor' }, // Incluye el autor, solo el id y nombre
        { model: Editorial, attributes: ['id', 'nombre'], as: 'editorial' }, // Incluye la editorial, solo el id y nombre
        { model: Genero, attributes: ['id', 'nombre'], as: 'genero' },     // Incluye el género, solo el id y nombre
      ],
      // Aquí puedes añadir más opciones de filtrado, ordenamiento si las manejas en findAll
      // order: [['titulo', 'ASC']], // Ejemplo de ordenamiento por defecto
    };

    // Asegúrate de que tu función `paginate` pueda manejar estas opciones
    const paginatedResult: PaginatedResult<Libro> = await paginate(this.libroModel, page, limit, paginationOptions);


    const transformedData = paginatedResult.data.map(libro => ({
      id: String(libro.id), // Asegúrate de que sea string si el frontend lo espera
      titulo: libro.titulo,
      autor: libro.autor ? libro.autor.nombre : null, // Extrae el nombre del autor
      editorial: libro.editorial ? libro.editorial.nombre : null, // Extrae el nombre de la editorial
      genero: libro.genero ? libro.genero.nombre : null, // Extrae el nombre del género
      precio: Number(libro.precio), // Asegúrate de que sea un número (precio es Decimal en DB)
      disponible: libro.disponible,
      imagenUrl: libro.imagenUrl,
      deletedAt: libro.deletedAt ? libro.deletedAt.toISOString() : null,
      // Añade aquí otros campos como 'descripcion' o 'añoPublicacion' si existen en tu modelo Libro
      // y quieres devolverlos.
    }));

    return {
      data: transformedData,
      total: paginatedResult.meta.total,
      page: paginatedResult.meta.page,
      limit: paginatedResult.meta.limit,
    };
    // === FIN DE LA MODIFICACIÓN ===

    // Opción 2: Si `paginate` no es flexible, haz la consulta directamente
    /*
    const { rows: libros, count: total } = await this.libroModel.findAndCountAll({
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      include: [
        { model: Autor, attributes: ['id', 'nombre'], as: 'autor' },
        { model: Editorial, attributes: ['id', 'nombre'], as: 'editorial' },
        { model: Genero, attributes: ['id', 'nombre'], as: 'genero' },
      ],
      // Aquí podrías añadir order, where, etc.
    });

    const transformedLibros = libros.map(libro => ({
      id: String(libro.id),
      titulo: libro.titulo,
      autor: libro.autor ? libro.autor.nombre : null,
      editorial: libro.editorial ? libro.editorial.nombre : null,
      genero: libro.genero ? libro.genero.nombre : null,
      precio: Number(libro.precio),
      disponible: libro.disponible,
      imagenUrl: libro.imagenUrl,
      deletedAt: libro.deletedAt ? libro.deletedAt.toISOString() : null,
      // ... otros campos
    }));

    return {
      data: transformedLibros,
      total: total,
      page: Number(page),
      limit: Number(limit),
      lastPage: Math.ceil(total / Number(limit)),
    };
    */
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
