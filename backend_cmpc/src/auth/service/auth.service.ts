import {
  Injectable,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Usuario } from 'src/usuarios/model/usuario.model';
import { UsuariosService } from 'src/usuarios/service/usuarios.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Sequelize } from 'sequelize-typescript';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly sequelize: Sequelize,

    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async validateUser(email: string, password: string) {
    return await this.sequelize.transaction(async (t) => {
      const user = await this.usuariosService.findByEmail(email, true, { transaction: t });

      if (!user || !user.passwordHash) {
        this.logger.warn('Validación fallida: usuario no encontrado o sin hash de contraseña', {
          context: 'AuthService',
          operation: 'validateUser',
          email,
        });
        return null;
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        this.logger.warn('Validación fallida: contraseña incorrecta', {
          context: 'AuthService',
          operation: 'validateUser',
          email,
        });
        return null;
      }

      this.logger.info('Usuario validado correctamente', {
        context: 'AuthService',
        operation: 'validateUser',
        id: user.id,
        email: user.email,
      });

      const { passwordHash, ...rest } = user.get({ plain: true });
      return rest;
    });
  }

  async login(user: Omit<Usuario, 'passwordHash'>) {
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    this.logger.info('Usuario autenticado y token generado', {
      context: 'AuthService',
      operation: 'login',
      id: user.id,
      email: user.email,
    });

    return {
      access_token: token,
    };
  }
}
