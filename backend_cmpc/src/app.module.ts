import { Module } from '@nestjs/common';
import { UsuariosModule } from './usuarios/usuarios.module';
import { LibrosModule } from './libros/libros.module';
import { AutoresModule } from './autores/autores.module';
import { EditorialesModule } from './editoriales/editoriales.module';
import { GenerosModule } from './generos/generos.module';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    UsuariosModule, 
    LibrosModule, 
    AutoresModule, 
    EditorialesModule, 
    GenerosModule, 
    LoggerModule, 
    DatabaseModule, 
    AuthModule, 
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
