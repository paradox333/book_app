import {
  Injectable,
  NotFoundException,
  Inject,
  BadRequestException,
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
import { Sequelize } from 'sequelize-typescript';
import { Op, Transaction } from 'sequelize';
import { CreateCompleteLibroDto } from '../dto/create-complete-libro.dto';
import { EditorialesController } from '../../editoriales/controller/editoriales.controller';
import { extname, join } from 'path';
import * as fs from 'fs/promises'; // Para escribir el archivo
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class LibrosService {
  constructor(
    @InjectModel(Libro)
    private readonly libroModel: typeof Libro,

    @InjectModel(Editorial)
    private readonly editorialModel: typeof Editorial,

    @InjectModel(Autor)
    private readonly autorModel: typeof Autor,

    @InjectModel(Genero)
    private readonly generoModel: typeof Genero,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    private readonly sequelize: Sequelize,
  ) {}

    async create(createLibroDto: CreateLibroDto): Promise<Libro> {
    return this.sequelize.transaction(async (transaction: Transaction) => {
      const libro = await this.libroModel.create(createLibroDto, { transaction });

      this.logger.info('Libro creado', {
        context: 'LibrosService',
        operation: 'create',
        model: 'Libro',
        data: { id: libro.id, titulo: libro.titulo },
      });

      return libro;
    });
  }

 async findAll(
    page = 1,
    limit = 10,
    filters: {
      id?: string;
      titulo?: string;
      autor?: string;
      editorial?: string;
      genero?: string;
      disponible?: boolean | undefined
    } = {},
    sortBy: string = 'titulo',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    
    this.logger.info('Listando libros con filtros', {
      context: 'LibrosService',
      operation: 'findAll',
      filters,
      pagination: { page, limit },
      sortBy,
      sortOrder,
    });

    const where: any = {};

     if (filters.disponible !== undefined) {
      where.disponible = filters.disponible;
    }
    if (filters.id) {
      where.id = Number(filters.id);
    }

    if (filters.titulo) {
      where.titulo = { [Op.iLike]: `%${filters.titulo}%` };
    }

    const include = [
      {
        model: Autor,
        attributes: ['id', 'nombre'],
        as: 'autor',
        where: filters.autor
          ? { nombre: { [Op.iLike]: `%${filters.autor}%` } }
          : undefined,
      },
      {
        model: Editorial,
        attributes: ['id', 'nombre'],
        as: 'editorial',
        where: filters.editorial
          ? { nombre: { [Op.iLike]: `%${filters.editorial}%` } }
          : undefined,
      },
      {
        model: Genero,
        attributes: ['id', 'nombre'],
        as: 'genero',
        where: filters.genero
          ? { nombre: { [Op.iLike]: `%${filters.genero}%` } }
          : undefined,
      },
    ];

     // --- Lógica para el ordenamiento dinámico ---
    let order: any[] = [];

    const validSortFields = {
      titulo: 'titulo',
      precio: 'precio',
      autor: [{ model: Autor, as: 'autor' }, 'nombre'],
      editorial: [{ model: Editorial, as: 'editorial' }, 'nombre'],
      genero: [{ model: Genero, as: 'genero' }, 'nombre'],
    };

    // Obtiene la configuración de ordenamiento basada en `sortBy`
    const sequelizeSortBy = validSortFields[sortBy as keyof typeof validSortFields];

    if (sequelizeSortBy) {
      if (Array.isArray(sequelizeSortBy)) {
        order.push([...sequelizeSortBy, sortOrder.toUpperCase()]);
      } else {
        order.push([sequelizeSortBy, sortOrder.toUpperCase()]);
      }
    } else {
      order.push(['titulo', 'ASC']);
    }
    // --- Fin de la lógica de ordenamiento ---

    const paginatedResult: PaginatedResult<Libro> = await paginate(
      this.libroModel,
      page,
      limit,
      {
        where,
        include,
        order
      },
    );

    const transformedData = paginatedResult.data.map(libro => ({
      id: String(libro.id),
      titulo: libro.titulo,
      autor: libro.autor ? libro.autor.nombre : null,
      editorial: libro.editorial ? libro.editorial.nombre : null,
      genero: libro.genero ? libro.genero.nombre : null,
      precio: Number(libro.precio),
      disponible: libro.disponible,
      imagenUrl: libro.imagenUrl,
      deletedAt: libro.deletedAt ? libro.deletedAt.toISOString() : null,
    }));

    return {
      data: transformedData,
      total: paginatedResult.meta.total,
      page: paginatedResult.meta.page,
      limit: paginatedResult.meta.limit,
    };
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
    return this.sequelize.transaction(async (transaction: Transaction) => {
      const libro = await this.libroModel.findByPk(id, { transaction });

      if (!libro) {
        this.logger.warn('Libro no encontrado para actualizar', {
          context: 'LibrosService',
          operation: 'update',
          id,
        });
        throw new NotFoundException(`Libro con ID ${id} no encontrado`);
      }

      await libro.update(updateLibroDto, { transaction });

      this.logger.info('Libro actualizado', {
        context: 'LibrosService',
        operation: 'update',
        id,
        data: updateLibroDto,
      });

      return libro;
    });
  }

  async remove(id: number): Promise<void> {
    return this.sequelize.transaction(async (transaction: Transaction) => {
      const libro = await this.libroModel.findByPk(id, { transaction });

      if (!libro) {
        this.logger.warn('Libro no encontrado para eliminar', {
          context: 'LibrosService',
          operation: 'remove',
          id,
        });
        throw new NotFoundException(`Libro con ID ${id} no encontrado`);
      }

      await libro.destroy({ transaction });

      this.logger.info('Libro eliminado', {
        context: 'LibrosService',
        operation: 'remove',
        id,
      });
    });
  }

  async restore(id: number): Promise<Libro> {
    const transaction = await this.sequelize.transaction();

    try {
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

      await this.libroModel.restore({ where: { id }, transaction });

      await transaction.commit();

      this.logger.info('Libro restaurado', {
        context: 'LibrosService',
        operation: 'restore',
        id,
      });

      return this.libroModel.findByPk(id);
    } catch (error) {
      await transaction.rollback();
      this.logger.error('Error al restaurar libro', {
        context: 'LibrosService',
        operation: 'restore',
        id,
        error: error.message,
      });
      throw error;
    }
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

  private async findOrCreateAutor(
    autorName: string,
    transaction: Transaction,
  ): Promise<number> {
    if (!autorName || autorName.trim() === '') {
      throw new BadRequestException('El nombre del autor no puede estar vacío.');
    }
    const [autor] = await this.autorModel.findOrCreate({
      where: { nombre: autorName.trim() },
      defaults: { nombre: autorName.trim() },
      transaction,
    });
    return autor.id;
  }

  private async findOrCreateEditorial(
    editorialName: string,
    transaction: Transaction,
  ): Promise<number> {
    if (!editorialName || editorialName.trim() === '') {
      throw new BadRequestException('El nombre de la editorial no puede estar vacío.');
    }
    const [editorial] = await this.editorialModel.findOrCreate({
      where: { nombre: editorialName.trim() },
      defaults: { nombre: editorialName.trim() },
      transaction,
    });
    return editorial.id;
  }

  private async findOrCreateGenero(
    generoName: string,
    transaction: Transaction,
  ): Promise<number> {
    if (!generoName || generoName.trim() === '') {
      throw new BadRequestException('El nombre del género no puede estar vacío.');
    }
    const [genero] = await this.generoModel.findOrCreate({
      where: { nombre: generoName.trim() },
      defaults: { nombre: generoName.trim() },
      transaction,
    });
    return genero.id;
  }

  // --- Nueva función auxiliar para guardar el archivo ---
  private async saveFile(
    fileBuffer: Buffer,
    originalFileName: string,
  ): Promise<string> {
    const projectRoot = join(__dirname, '..', '..', '..', '..');
    const frontendAssetsPath = join(projectRoot, 'frontend-cmpc', 'public');
    await fs.mkdir(frontendAssetsPath, { recursive: true });

    const uniqueFileName = `${uuidv4()}${extname(originalFileName)}`;
    const filePath = join(frontendAssetsPath, uniqueFileName);

    await fs.writeFile(filePath, fileBuffer);
    return `/public/${uniqueFileName}`;
  }

  // --- Nueva función auxiliar para eliminar el archivo (en caso de rollback) ---
  private async deleteFile(filePath: string): Promise<void> {
    const fullPath = join(process.cwd(), filePath); 
    try {
      await fs.unlink(fullPath); // Elimina el archivo
      this.logger.warn(`Archivo eliminado por rollback: ${fullPath}`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.logger.info(`Intento de eliminar archivo no existente: ${fullPath}`);
      } else {
        this.logger.error(`Error al eliminar archivo: ${fullPath}`, { error: error.message });
      }
    }
  }
  async createCompleteLibro(
    createLibroEntityDto: CreateCompleteLibroDto,
    fileInfo?: { buffer: Buffer; originalname: string }, // Recibe la información del archivo
  ): Promise<Libro> {
    // Variable para almacenar la URL de la imagen si se guarda con éxito
    let imageUrl: string | undefined;

    return this.sequelize.transaction(async (transaction: Transaction) => {

      try{

      
      // 1. Encontrar o crear Autor
      const autorId = await this.findOrCreateAutor(
        createLibroEntityDto.autor,
        transaction,
      );

      // 2. Encontrar o crear Editorial
      const editorialId = await this.findOrCreateEditorial(
        createLibroEntityDto.editorial,
        transaction,
      );

      // 3. Encontrar o crear Género
      const generoId = await this.findOrCreateGenero(
        createLibroEntityDto.genero,
        transaction,
      );

      // 4. *** Si todo lo anterior fue exitoso, guardar la imagen ***
        if (fileInfo) {
          imageUrl = await this.saveFile(
            fileInfo.buffer,
            fileInfo.originalname,
          );
        }

      interface CreateLibro {
        titulo: string,
        autorId: number,
        generoId: number,
        editorialId: number,
        precio: number,
        disponible: boolean,
        imagenUrl: string

      }
      // 4. Crear el Libro con los IDs obtenidos
      const createLibro: CreateLibro = {
        titulo: createLibroEntityDto.titulo,
        autorId: autorId,
        editorialId: editorialId,
        generoId: generoId,
        precio: Number(createLibroEntityDto.precio),
        disponible: Boolean(createLibroEntityDto.disponible),
        imagenUrl: imageUrl,
      };

      const libro = await this.libroModel.create(createLibro, { transaction });

      this.logger.info('Libro completo creado (incluyendo relaciones)', {
        context: 'LibrosService',
        operation: 'createCompleteEntity',
        model: 'Libro',
        data: {
          id: libro.id,
          titulo: libro.titulo,
          autorId: autorId,
          editorialId: editorialId,
          generoId: generoId,
        },
      });

      // Devolver el libro con sus relaciones cargadas para una respuesta completa
      return this.libroModel.findByPk(libro.id, {
        include: [
          { model: Autor, as: 'autor' },
          { model: Editorial, as: 'editorial' },
          { model: Genero, as: 'genero' },
        ],
        transaction,
      });
    }catch(err){
       if (imageUrl) {
          await this.deleteFile(imageUrl); // Limpia el archivo si se guardó
        }
        this.logger.error('Error en createCompleteEntity, rollback', {
          context: 'LibrosService',
          operation: 'createCompleteEntity',
          error: err.message,
        });
        throw err;
    }
    });
  }
}
