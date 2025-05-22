import { Test, TestingModule } from '@nestjs/testing';
import { AutoresController } from './autores.controller';
import { AutoresService } from '../service/autores.service';
import { CreateAutorDto } from '../dto/create-autor.dto';
import { UpdateAutorDto } from '../dto/update-autor.dto';

describe('AutoresController', () => {
  let controller: AutoresController;
  let service: AutoresService;

  const mockAutoresService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AutoresController],
      providers: [
        {
          provide: AutoresService,
          useValue: mockAutoresService,
        },
      ],
    }).compile();

    controller = module.get<AutoresController>(AutoresController);
    service = module.get<AutoresService>(AutoresService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería llamar a autoresService.create y devolver el resultado', async () => {
      const dto: CreateAutorDto = { nombre: 'Gabriel García Márquez' };
      const autorResult = { id: 1, nombre: 'Gabriel García Márquez' };
      mockAutoresService.create.mockResolvedValue(autorResult);

      const result = await controller.create(dto);

      expect(mockAutoresService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(autorResult);
    });
  });

  describe('findAll', () => {
    it('debería llamar a autoresService.findAll con valores numéricos por defecto', async () => {
      const autores = [{ id: 1, nombre: 'Autor 1' }, { id: 2, nombre: 'Autor 2' }];
      mockAutoresService.findAll.mockResolvedValue(autores);

      const result = await controller.findAll();

      expect(mockAutoresService.findAll).toHaveBeenCalledWith(1, 10);
      expect(result).toEqual(autores);
    });

    it('debería convertir parámetros page y limit a números y pasarlos al servicio', async () => {
      const autores = [{ id: 3, nombre: 'Autor 3' }];
      mockAutoresService.findAll.mockResolvedValue(autores);

      const result = await controller.findAll('2', '5');

      expect(mockAutoresService.findAll).toHaveBeenCalledWith(2, 5);
      expect(result).toEqual(autores);
    });
  });

  describe('findOne', () => {
    it('debería llamar a autoresService.findOne con id numérico y devolver el resultado', async () => {
      const autor = { id: 1, nombre: 'Autor Ejemplo' };
      mockAutoresService.findOne.mockResolvedValue(autor);

      const result = await controller.findOne('1');

      expect(mockAutoresService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(autor);
    });
  });

  describe('update', () => {
    it('debería llamar a autoresService.update con id numérico y DTO, y devolver el resultado', async () => {
      const dto: UpdateAutorDto = { nombre: 'Autor Actualizado' };
      const autorActualizado = { id: 1, nombre: 'Autor Actualizado' };
      mockAutoresService.update.mockResolvedValue(autorActualizado);

      const result = await controller.update('1', dto);

      expect(mockAutoresService.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(autorActualizado);
    });
  });

  describe('remove', () => {
    it('debería llamar a autoresService.remove con id numérico', async () => {
      mockAutoresService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockAutoresService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('restore', () => {
    it('debería llamar a autoresService.restore con id numérico y devolver el resultado', async () => {
      const restored = { id: 1, nombre: 'Autor Restaurado' };
      mockAutoresService.restore.mockResolvedValue(restored);

      // Note que el método restore recibe un número directamente, no string,
      // así que simulamos llamada directa con número.
      const result = await controller.restore(1);

      expect(mockAutoresService.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual(restored);
    });
  });
});
