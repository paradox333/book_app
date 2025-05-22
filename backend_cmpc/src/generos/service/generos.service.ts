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

@Injectable()
export class GenerosService {
  constructor(
    @InjectModel(Genero)
    private generoModel: typeof Genero,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(createGeneroDto: CreateGeneroDto) {
    const { nombre } = createGeneroDto;
    const nombreNormalizado = nombre.toLowerCase();

    const existingGenero = await this.generoModel.findOne({
      where: { nombre: nombreNormalizado },
    });

    if (existingGenero) {
      this.logger.warn(`Intento de crear género duplicado: ${nombre}`, {
        context: GenerosService.name,
        operation: 'create',
        model: 'Genero',
      });
      throw new ConflictException(`El género con nombre "${nombre}" ya existe.`);
    }

    const newGenero = await this.generoModel.create({ nombre });

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

  async findOne(id: number) {
    const genero = await this.generoModel.findByPk(id);

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

  async update(id: number, updateGeneroDto: UpdateGeneroDto) {
    const genero = await this.generoModel.findByPk(id);

    if (!genero) {
      this.logger.warn(`Género con ID ${id} no encontrado para actualizar`, {
        context: GenerosService.name,
        operation: 'update',
        model: 'Genero',
      });
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    await genero.update(updateGeneroDto);

    this.logger.info(`Género actualizado: ${genero.id}`, {
      context: GenerosService.name,
      operation: 'update',
      model: 'Genero',
      data: { nombre: genero.nombre },
    });

    return genero;
  }

  async remove(id: number): Promise<void> {
    const genero = await this.generoModel.findByPk(id);

    if (!genero) {
      this.logger.warn(`Género con ID ${id} no encontrado para eliminación`, {
        context: GenerosService.name,
        operation: 'remove',
        model: 'Genero',
      });
      throw new NotFoundException(`Género con ID ${id} no encontrado`);
    }

    await genero.destroy();

    this.logger.info(`Género eliminado: ${id}`, {
      context: GenerosService.name,
      operation: 'remove',
      model: 'Genero',
    });
  }
}
