import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';
import { Usuario } from '../model/usuario.model';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { paginate } from 'src/utils/paginate';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';

@Injectable()
export class UsuariosService {
  private readonly saltRounds = 10;

  constructor(
    @InjectModel(Usuario)
    private readonly usuarioModel: typeof Usuario,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,

    private readonly sequelize: Sequelize,
  ) {}

  async create(
    createUsuarioDto: CreateUsuarioDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Usuario> {
    const exists = await this.usuarioModel.findOne({
      where: { email: createUsuarioDto.email },
      paranoid: false,
      transaction: options.transaction,
    });

    if (exists) {
      this.logger.warn('Intento de registrar un email ya existente', {
        context: 'UsuariosService',
        operation: 'create',
        email: createUsuarioDto.email,
      });
      throw new BadRequestException('Email ya registrado');
    }

    const passwordHash = await bcrypt.hash(createUsuarioDto.password, this.saltRounds);

    const usuario = await this.usuarioModel.create(
      {
        email: createUsuarioDto.email,
        passwordHash,
        nombre: createUsuarioDto.nombre,
      },
      { transaction: options.transaction },
    );

    this.logger.info('Usuario creado', {
      context: 'UsuariosService',
      operation: 'create',
      id: usuario.id,
      email: usuario.email,
    });

    return usuario;
  }

  async findAll(page = 1, limit = 10) {
    this.logger.info('Listando usuarios', {
      context: 'UsuariosService',
      operation: 'findAll',
      pagination: { page, limit },
    });

    return paginate(this.usuarioModel, page, limit);
  }

  async findOne(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<Usuario> {
    const user = await this.usuarioModel.findByPk(id, {
      transaction: options.transaction,
    });

    if (!user) {
      this.logger.warn('Usuario no encontrado', {
        context: 'UsuariosService',
        operation: 'findOne',
        id,
      });
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }

    return user;
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
    options: { transaction?: Transaction } = {},
  ): Promise<Usuario> {
    const user = await this.findOne(id, { transaction: options.transaction });

    if (updateUsuarioDto.email && updateUsuarioDto.email !== user.email) {
      const emailExists = await this.usuarioModel.findOne({
        where: { email: updateUsuarioDto.email },
        transaction: options.transaction,
      });

      if (emailExists) {
        this.logger.warn('Intento de actualizar email a uno ya existente', {
          context: 'UsuariosService',
          operation: 'update',
          id,
          newEmail: updateUsuarioDto.email,
        });

        throw new BadRequestException('Otro usuario ya usa ese email');
      }
    }

    if (updateUsuarioDto.password) {
      updateUsuarioDto['passwordHash'] = await bcrypt.hash(
        updateUsuarioDto.password,
        this.saltRounds,
      );
      delete (updateUsuarioDto as any).password;
    }

    await user.update(
      {
        email: updateUsuarioDto.email ?? user.email,
        passwordHash: updateUsuarioDto['passwordHash'] ?? user.passwordHash,
        nombre: updateUsuarioDto.nombre ?? user.nombre,
      },
      { transaction: options.transaction },
    );

    this.logger.info('Usuario actualizado', {
      context: 'UsuariosService',
      operation: 'update',
      id,
    });

    return user;
  }

  async remove(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<void> {
    const user = await this.findOne(id, { transaction: options.transaction });
    await user.destroy({ transaction: options.transaction });

    this.logger.info('Usuario eliminado', {
      context: 'UsuariosService',
      operation: 'remove',
      id,
    });
  }

  async restore(
    id: number,
    options: { transaction?: Transaction } = {},
  ): Promise<Usuario> {
    const user = await this.usuarioModel.findOne({
      where: { id },
      paranoid: false,
      transaction: options.transaction,
    });

    if (!user) {
      this.logger.warn('Intento de restaurar usuario no existente', {
        context: 'UsuariosService',
        operation: 'restore',
        id,
      });
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    await this.usuarioModel.restore({
      where: { id },
      transaction: options.transaction,
    });

    this.logger.info('Usuario restaurado', {
      context: 'UsuariosService',
      operation: 'restore',
      id,
    });

    return this.usuarioModel.findByPk(id, { transaction: options.transaction });
  }

  async findByEmail(
    email: string,
    includeDeleted = false,
    options: { transaction?: Transaction } = {},
  ): Promise<Usuario | null> {
    this.logger.info('Buscando usuario por email', {
      context: 'UsuariosService',
      operation: 'findByEmail',
      email,
      includeDeleted,
      usingTransaction: !!options.transaction,
    });

    return this.usuarioModel.findOne({
      where: { email },
      paranoid: !includeDeleted,
      transaction: options.transaction,
    });
  }
}
