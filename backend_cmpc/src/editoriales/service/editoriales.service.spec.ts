import { Test, TestingModule } from '@nestjs/testing';
import { EditorialesService } from './editoriales.service';
import { getModelToken } from '@nestjs/sequelize';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Editorial } from '../model/editorial.model';
import { NotFoundException } from '@nestjs/common';

describe('EditorialesService', () => {
  let service: EditorialesService;
  let editorialModel: any;

  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    editorialModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      restore: jest.fn(),
      findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),

    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EditorialesService,
        { provide: getModelToken(Editorial), useValue: editorialModel },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<EditorialesService>(EditorialesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear una editorial y loguear', async () => {
      const dto = { nombre: 'Nueva Editorial' };
      const created = { id: 1, nombre: 'Nueva Editorial' };
      editorialModel.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockLogger.info).toHaveBeenCalledWith('Editorial creada', expect.objectContaining({
        context: 'EditorialesService',
        operation: 'create',
        model: 'Editorial',
        data: { id: 1, nombre: 'Nueva Editorial' },
      }));
    });
  });

  describe('findAll', () => {
    it('debería loguear y devolver paginación', async () => {
      const mockPaginated = { rows: [], count: 0 };
      const paginate = jest.fn().mockResolvedValue(mockPaginated);

      jest.mock('src/utils/paginate', () => ({ paginate }));

      const result = await service.findAll(1, 10);

      expect(mockLogger.info).toHaveBeenCalledWith('Listando editoriales', {
        context: 'EditorialesService',
        operation: 'findAll',
        pagination: { page: 1, limit: 10 },
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar una editorial si existe', async () => {
      const mockEditorial = { id: 1, nombre: 'Planeta' };
      editorialModel.findByPk.mockResolvedValue(mockEditorial);

      const result = await service.findOne(1);

      expect(result).toEqual(mockEditorial);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      editorialModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalledWith('Editorial no encontrada', expect.objectContaining({
        context: 'EditorialesService',
        operation: 'findOne',
        id: 1,
      }));
    });
  });

  describe('update', () => {
    it('debería actualizar una editorial y loguear', async () => {
      const mockEditorial = {
        id: 1,
        nombre: 'Anterior',
        update: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEditorial as any);
      const dto = { nombre: 'Actualizado' };

      const result = await service.update(1, dto);

      expect(mockEditorial.update).toHaveBeenCalledWith(dto);
      expect(mockLogger.info).toHaveBeenCalledWith('Editorial actualizada', expect.objectContaining({
        context: 'EditorialesService',
        operation: 'update',
        id: 1,
        data: dto,
      }));
      expect(result).toEqual(mockEditorial);
    });
  });

  describe('remove', () => {
    it('debería eliminar una editorial y loguear', async () => {
      const mockEditorial = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockEditorial as any);

      await service.remove(1);

      expect(mockEditorial.destroy).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Editorial eliminada', expect.objectContaining({
        context: 'EditorialesService',
        operation: 'remove',
        id: 1,
      }));
    });
  });

  describe('restore', () => {
    it('debería restaurar una editorial y loguear', async () => {
      const mockEditorial = { id: 1 };
      editorialModel.findOne.mockResolvedValue(mockEditorial);
      editorialModel.restore.mockResolvedValue(undefined);
      editorialModel.findByPk.mockResolvedValue(mockEditorial);

      const result = await service.restore(1);

      expect(editorialModel.restore).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockLogger.info).toHaveBeenCalledWith('Editorial restaurada', expect.objectContaining({
        context: 'EditorialesService',
        operation: 'restore',
        id: 1,
      }));
      expect(result).toEqual(mockEditorial);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      editorialModel.findOne.mockResolvedValue(null);

      await expect(service.restore(99)).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalledWith('Intento de restaurar editorial inexistente', expect.objectContaining({
        context: 'EditorialesService',
        operation: 'restore',
        id: 99,
      }));
    });
  });
});
