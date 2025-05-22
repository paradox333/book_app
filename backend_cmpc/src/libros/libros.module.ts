import { Module } from '@nestjs/common';
import { LibrosController } from './controller/libros.controller';
import { LibrosService } from './service/libros.service';
import { Libro } from './models/libro.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
      SequelizeModule.forFeature([Libro]),
      
    ],
  controllers: [LibrosController],
  providers: [LibrosService],
  exports: [LibrosService]
})
export class LibrosModule {}
