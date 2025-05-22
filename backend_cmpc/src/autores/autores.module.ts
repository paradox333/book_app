import { Module } from '@nestjs/common';
import { AutoresService } from './service/autores.service';
import { AutoresController } from './controller/autores.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Autor } from './model/autores.model';

@Module({
  imports: [
      SequelizeModule.forFeature([Autor]),
      
    ],
  controllers: [AutoresController],
  providers: [AutoresService],
  exports: [AutoresService]
})
export class AutoresModule {}
