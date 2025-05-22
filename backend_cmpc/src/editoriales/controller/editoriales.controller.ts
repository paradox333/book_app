import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { EditorialesService } from '../service/editoriales.service';
import { CreateEditorialDto } from '../dto/create-editorial.dto';
import { UpdateEditorialDto } from '../dto/update-editorial.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('editoriales')
export class EditorialesController {

  constructor(private readonly editorialesService: EditorialesService) {}

  @Post()
  create(@Body() createEditorialeDto: CreateEditorialDto) {
    return this.editorialesService.create(createEditorialeDto);
  }

  @Get()
    findAll(
      @Query('page') page: string = '1',
      @Query('limit') limit: string = '10',
    ) {
      return this.editorialesService.findAll(Number(page), Number(limit));
  }
    
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.editorialesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEditorialeDto: UpdateEditorialDto) {
    return this.editorialesService.update(+id, updateEditorialeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.editorialesService.remove(+id);
  }

  @Post(':id/restore')
  restore(@Param('id') id: number) {
    return this.editorialesService.restore(id);
  }
}
