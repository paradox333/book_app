import { Module } from '@nestjs/common';
import { EditorialesController } from './controller/editoriales.controller';
import { EditorialesService } from './service/editoriales.service';
import { Editorial } from './model/editorial.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
  imports: [
    SequelizeModule.forFeature([Editorial]),
    
  ],
  controllers: [EditorialesController],
  providers: [EditorialesService],
  exports: [EditorialesService]
})
export class EditorialesModule {}
