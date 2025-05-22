import {
  Injectable,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Autor } from '../model/autores.model';
import { CreateAutorDto } from '../dto/create-autor.dto';
import { UpdateAutorDto } from '../dto/update-autor.dto';
import { paginate } from 'src/utils/paginate';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class AutoresService {
  constructor(
    @InjectModel(Autor)
    private readonly autorModel: typeof Autor,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(createAutorDto: CreateAutorDto): Promise<Autor> {
    const autor = await this.autorModel.create(createAutorDto);

    this.logger.info('Autor creado', {
      context: AutoresService.name,
      operation: 'create',
      model: 'Autor',
      data: { id: autor.id, nombre: autor.nombre },
    });

    return autor;
  }

  async findAll(page = 1, limit = 10) {
    this.logger.info('Listando autores', {
      context: AutoresService.name,
      operation: 'findAll',
      pagination: { page, limit },
    });

    return paginate(this.autorModel, page, limit);
  }

  async findOne(id: number): Promise<Autor> {
    const autor = await this.autorModel.findByPk(id);
    if (!autor) {
      this.logger.warn('Autor no encontrado', {
        context: AutoresService.name,
        operation: 'findOne',
        model: 'Autor',
        id,
      });

      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }

    return autor;
  }

  async update(id: number, updateAutorDto: UpdateAutorDto): Promise<Autor> {
    const autor = await this.findOne(id);
    await autor.update(updateAutorDto);

    this.logger.info('Autor actualizado', {
      context: AutoresService.name,
      operation: 'update',
      model: 'Autor',
      id: autor.id,
      data: updateAutorDto,
    });

    return autor;
  }

  async remove(id: number): Promise<void> {
    const autor = await this.findOne(id);
    await autor.destroy();

    this.logger.info('Autor eliminado', {
      context: AutoresService.name,
      operation: 'remove',
      model: 'Autor',
      id: autor.id,
    });
  }

  async restore(id: number): Promise<Autor> {
    const autor = await this.autorModel.findOne({
      where: { id },
      paranoid: false,
    });

    if (!autor) {
      this.logger.warn('Intento de restaurar autor inexistente', {
        context: AutoresService.name,
        operation: 'restore',
        id,
      });

      throw new NotFoundException(`Autor con ID ${id} no encontrado`);
    }

    await this.autorModel.restore({ where: { id } });

    this.logger.info('Autor restaurado', {
      context: AutoresService.name,
      operation: 'restore',
      id,
    });

    return this.findOne(id);
  }
}
