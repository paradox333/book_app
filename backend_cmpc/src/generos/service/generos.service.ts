import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGeneroDto } from '../dto/create-genero.dto';
import { UpdateGeneroDto } from '../dto/update-genero.dto';
import { Genero } from '../model/genero.model';
import { InjectModel } from '@nestjs/sequelize';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';

@Injectable()
export class GenerosService {
  constructor(
    @InjectModel(Genero)
    private generoModel: typeof Genero,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    private readonly sequelize: Sequelize,
  ) {}

  async create(
    createGeneroDto: CreateGeneroDto,
    options: { transaction?: Transaction } = {},
  ) {
    const { nombre } = createGeneroDto;
    const nombreNormalizado = nombre.toLowerCase();

    const existingGenero = await this.generoModel.findOne({
      where: { nombre: nombreNormalizado },
      transaction: options.transaction,
    });

    if (existingGenero) {
      this.logger.warn(`Intento de crear género duplicado: ${nombre}`, {
        context: GenerosService.name,
        operation: 'create',
        model: 'Genero',
      });
      throw new ConflictException(`El género con nombre "${nombre}" ya existe.`);
    }

    const newGenero = await this.generoModel.create(
      { nombre },
      { transaction: options.transaction },
    );

    this.logger.info(`Género creado: ${nombre}`, {
      context: GenerosService.name,
      operation: 'create',
      model: 'Genero',
      data: { nombre },
    });

    return newGenero;
  }

  async findAll() {
    const generos = await this.generoModel.findAll();

    this.logger.info(`Listando géneros`, {
      context: GenerosService.name,
      operation: 'findAll',
      model: 'Genero',
      cantidad: generos.length,
    });

    return generos;
  }

  async findOne(
    id: number,
    options: { transaction?: Transaction } = {},
  ) {
    const genero = await this.generoModel.findByPk(id, {
      transaction: options.transaction,
    });

    if (!genero) {
      this.logger.warn(`Género con ID ${id} no encontrado`, {
        context: GenerosService.name,
        operation: 'findOne',
        model: 'Genero',
      });
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    this.logger.info(`Género consultado: ${genero.id}`, {
      context: GenerosService.name,
      operation: 'findOne',
      model: 'Genero',
    });

    return genero;
  }

  async update(
    id: number,
    updateGeneroDto: UpdateGeneroDto,
    options: { transaction?: Transaction } = {},
  ) {
    const genero = await this.findOne(id, { transaction: options.transaction });

    await genero.update(updateGeneroDto, {
      transaction: options.transaction,
    });

    this.logger.info(`Género actualizado: ${genero.id}`, {
      context: GenerosService.name,
      operation: 'update',
      model: 'Genero',
      data: { nombre: genero.nombre },
    });

    return genero;
  }

  async remove(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<void> {
    const genero = await this.findOne(id, { transaction: options.transaction });

    await genero.destroy({ transaction: options.transaction });

    this.logger.info(`Género eliminado: ${id}`, {
      context: GenerosService.name,
      operation: 'remove',
      model: 'Genero',
    });
  }
}
