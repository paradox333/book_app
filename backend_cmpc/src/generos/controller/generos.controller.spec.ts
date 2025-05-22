import { Test, TestingModule } from '@nestjs/testing';
import { GenerosController } from './generos.controller';
import { GenerosService } from '../service/generos.service';
import { CreateGeneroDto } from '../dto/create-genero.dto';
import { UpdateGeneroDto } from '../dto/update-genero.dto';

describe('GenerosController', () => {
  let controller: GenerosController;
  let service: GenerosService;

  const mockGenerosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenerosController],
      providers: [
        {
          provide: GenerosService,
          useValue: mockGenerosService,
        },
      ],
    }).compile();

    controller = module.get<GenerosController>(GenerosController);
    service = module.get<GenerosService>(GenerosService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería llamar a generosService.create y devolver el resultado', async () => {
      const dto: CreateGeneroDto = { nombre: 'Comedia' };
      const generoResult = { id: 1, nombre: 'Comedia' };
      mockGenerosService.create.mockResolvedValue(generoResult);

      const result = await controller.create(dto);

      expect(mockGenerosService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(generoResult);
    });
  });

  describe('findAll', () => {
    it('debería llamar a generosService.findAll y devolver el resultado', async () => {
      const generos = [{ id: 1, nombre: 'Acción' }, { id: 2, nombre: 'Drama' }];
      mockGenerosService.findAll.mockResolvedValue(generos);

      const result = await controller.findAll();

      expect(mockGenerosService.findAll).toHaveBeenCalled();
      expect(result).toEqual(generos);
    });
  });

  describe('findOne', () => {
    it('debería llamar a generosService.findOne con el id numérico y devolver el resultado', async () => {
      const genero = { id: 1, nombre: 'Acción' };
      mockGenerosService.findOne.mockResolvedValue(genero);

      const result = await controller.findOne('1');

      expect(mockGenerosService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(genero);
    });
  });

  describe('update', () => {
    it('debería llamar a generosService.update con id numérico y DTO, y devolver el resultado', async () => {
      const dto: UpdateGeneroDto = { nombre: 'Suspense' };
      const generoActualizado = { id: 1, nombre: 'Suspense' };
      mockGenerosService.update.mockResolvedValue(generoActualizado);

      const result = await controller.update('1', dto);

      expect(mockGenerosService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(generoActualizado);
    });
  });

  describe('remove', () => {
    it('debería llamar a generosService.remove con id numérico', async () => {
      mockGenerosService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockGenerosService.remove).toHaveBeenCalledWith(1);
    });
  });
});
