import { Test, TestingModule } from '@nestjs/testing';
import { EditorialesController } from './editoriales.controller';
import { EditorialesService } from '../service/editoriales.service';
import { CreateEditorialDto } from '../dto/create-editorial.dto';
import { UpdateEditorialDto } from '../dto/update-editorial.dto';

describe('EditorialesController', () => {
  let controller: EditorialesController;
  let service: EditorialesService;

  const mockEditorialesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EditorialesController],
      providers: [
        {
          provide: EditorialesService,
          useValue: mockEditorialesService,
        },
      ],
    }).compile();

    controller = module.get<EditorialesController>(EditorialesController);
    service = module.get<EditorialesService>(EditorialesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería llamar al servicio para crear una editorial', async () => {
      const dto: CreateEditorialDto = { nombre: 'Nueva Editorial' };
      const created = { id: 1, ...dto };
      mockEditorialesService.create.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(result).toEqual(created);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debería devolver una lista paginada', async () => {
      const result = { rows: [], count: 0 };
      mockEditorialesService.findAll.mockResolvedValue(result);

      const response = await controller.findAll('2', '5');

      expect(response).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(2, 5);
    });

    it('debería usar valores por defecto', async () => {
      const result = { rows: [], count: 0 };
      mockEditorialesService.findAll.mockResolvedValue(result);

      const response = await controller.findAll(undefined, undefined);

      expect(response).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('debería retornar una editorial por ID', async () => {
      const editorial = { id: 1, nombre: 'Editorial X' };
      mockEditorialesService.findOne.mockResolvedValue(editorial);

      const result = await controller.findOne('1');

      expect(result).toEqual(editorial);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('debería actualizar una editorial', async () => {
      const dto: UpdateEditorialDto = { nombre: 'Actualizado' };
      const updated = { id: 1, ...dto };
      mockEditorialesService.update.mockResolvedValue(updated);

      const result = await controller.update('1', dto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('debería eliminar una editorial', async () => {
      mockEditorialesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('restore', () => {
    it('debería restaurar una editorial', async () => {
      const restored = { id: 1, nombre: 'Restaurada' };
      mockEditorialesService.restore.mockResolvedValue(restored);

      const result = await controller.restore(1);

      expect(result).toEqual(restored);
      expect(service.restore).toHaveBeenCalledWith(1);
    });
  });
});
