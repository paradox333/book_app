import { Module } from '@nestjs/common';
import { GenerosController } from './controller/generos.controller';
import { GenerosService } from './service/generos.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Genero } from './model/genero.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Genero]),
  ],
  controllers: [GenerosController],
  providers: [GenerosService],
  exports: [GenerosService],
})
export class GenerosModule {}
