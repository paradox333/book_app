import { InjectModel } from '@nestjs/sequelize';
import { Editorial } from '../model/editorial.model';
import { CreateEditorialDto } from '../dto/create-editorial.dto';
import { UpdateEditorialDto } from '../dto/update-editorial.dto';
import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { paginate } from 'src/utils/paginate';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';

@Injectable()
export class EditorialesService {
  constructor(
    @InjectModel(Editorial)
    private editorialModel: typeof Editorial,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    private readonly sequelize: Sequelize,
  ) {}

  async create(
    createEditorialDto: CreateEditorialDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Editorial> {
    const editorial = await this.editorialModel.create(createEditorialDto, {
      transaction: options.transaction,
    });

    this.logger.info('Editorial creada', {
      context: EditorialesService.name,
      operation: 'create',
      model: 'Editorial',
      data: { id: editorial.id, nombre: editorial.nombre },
    });

    return editorial;
  }

  async findAll(page = 1, limit = 10) {
    this.logger.info('Listando editoriales', {
      context: EditorialesService.name,
      operation: 'findAll',
      pagination: { page, limit },
    });

    return paginate(this.editorialModel, page, limit);
  }

  async findOne(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<Editorial> {
    const editorial = await this.editorialModel.findByPk(id, {
      transaction: options.transaction,
    });

    if (!editorial) {
      this.logger.warn('Editorial no encontrada', {
        context: EditorialesService.name,
        operation: 'findOne',
        id,
      });

      throw new NotFoundException(`Editorial con ID ${id} no encontrada`);
    }

    return editorial;
  }

  async update(
    id: number,
    dto: UpdateEditorialDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Editorial> {
    const editorial = await this.findOne(id, { transaction: options.transaction });

    await editorial.update(dto, { transaction: options.transaction });

    this.logger.info('Editorial actualizada', {
      context: EditorialesService.name,
      operation: 'update',
      id,
      data: dto,
    });

    return editorial;
  }

  async remove(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<void> {
    const editorial = await this.findOne(id, { transaction: options.transaction });
    await editorial.destroy({ transaction: options.transaction });

    this.logger.info('Editorial eliminada', {
      context: EditorialesService.name,
      operation: 'remove',
      id,
    });
  }

  async restore(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<Editorial> {
    const editorial = await this.editorialModel.findOne({
      where: { id },
      paranoid: false,
      transaction: options.transaction,
    });

    if (!editorial) {
      this.logger.warn('Intento de restaurar editorial inexistente', {
        context: EditorialesService.name,
        operation: 'restore',
        id,
      });

      throw new NotFoundException(`Editorial con ID ${id} no encontrada`);
    }

    await this.editorialModel.restore({
      where: { id },
      transaction: options.transaction,
    });

    this.logger.info('Editorial restaurada', {
      context: EditorialesService.name,
      operation: 'restore',
      id,
    });

    return this.editorialModel.findByPk(id, { transaction: options.transaction });
  }
}
