import { Module } from '@nestjs/common';
import { LibrosController } from './controller/libros.controller';
import { LibrosService } from './service/libros.service';
import { Libro } from './models/libro.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { Autor } from 'src/autores/model/autores.model';
import { Editorial } from 'src/editoriales/model/editorial.model';
import { Genero } from 'src/generos/model/genero.model';

@Module({
  imports: [
      SequelizeModule.forFeature([Libro, Autor, Editorial, Genero]),
      
    ],
  controllers: [LibrosController],
  providers: [LibrosService],
  exports: [LibrosService]
})
export class LibrosModule {}
