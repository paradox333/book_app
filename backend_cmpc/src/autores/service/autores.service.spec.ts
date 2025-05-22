import { Test, TestingModule } from '@nestjs/testing';
import { AutoresService } from './autores.service';
import { Autor } from '../model/autores.model';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';


jest.mock('../../utils/paginate', () => ({
  paginate: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
}));

import { paginate } from '../../utils/paginate';

describe('AutoresService', () => {
  let service: AutoresService;
  let autorModel: any;
  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    autorModel = {
      create: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AutoresService,
        { provide: getModelToken(Autor), useValue: autorModel },
        { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
      ],
    }).compile();

    service = module.get<AutoresService>(AutoresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un autor y loguear', async () => {
      const dto = { nombre: 'Autor Nuevo' };
      const created = { id: 1, nombre: 'Autor Nuevo' };
      autorModel.create.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockLogger.info).toHaveBeenCalledWith('Autor creado', expect.objectContaining({
        context: 'AutoresService',
        operation: 'create',
        model: 'Autor',
        data: { id: 1, nombre: 'Autor Nuevo' },
      }));
    });
  });

  describe('findAll', () => {
    it('debería loguear y devolver paginación', async () => {
      const result = await service.findAll(1, 10);

      expect(result).toEqual({ rows: [], count: 0 });
      expect(mockLogger.info).toHaveBeenCalledWith('Listando autores', {
        context: 'AutoresService',
        operation: 'findAll',
        pagination: { page: 1, limit: 10 },
      });
    });
  });

  describe('findOne', () => {
    it('debería retornar un autor si existe', async () => {
      const mockAutor = { id: 1, nombre: 'Existente' };
      autorModel.findByPk.mockResolvedValue(mockAutor);

      const result = await service.findOne(1);

      expect(result).toEqual(mockAutor);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      autorModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalledWith('Autor no encontrado', expect.objectContaining({
        context: 'AutoresService',
        operation: 'findOne',
        model: 'Autor',
        id: 1,
      }));
    });
  });

  describe('update', () => {
    it('debería actualizar un autor y loguear', async () => {
      const mockAutor = {
        id: 1,
        nombre: 'Viejo',
        update: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAutor as any);
      const dto = { nombre: 'Nuevo' };

      const result = await service.update(1, dto);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockAutor.update).toHaveBeenCalledWith(dto);
      expect(mockLogger.info).toHaveBeenCalledWith('Autor actualizado', expect.objectContaining({
        context: 'AutoresService',
        operation: 'update',
        model: 'Autor',
        id: 1,
        data: dto,
      }));
      expect(result).toEqual(mockAutor);
    });

    it('debería lanzar NotFoundException si autor no existe', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());

      await expect(service.update(99, { nombre: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debería eliminar un autor y loguear', async () => {
      const mockAutor = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAutor as any);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(mockAutor.destroy).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Autor eliminado', expect.objectContaining({
        context: 'AutoresService',
        operation: 'remove',
        model: 'Autor',
        id: 1,
      }));
    });
  });

  describe('restore', () => {
    it('debería restaurar un autor y loguear', async () => {
      const mockAutor = { id: 1 };
      autorModel.findOne.mockResolvedValue(mockAutor);
      autorModel.restore.mockResolvedValue(undefined);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockAutor as any);

      const result = await service.restore(1);

      expect(autorModel.restore).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockLogger.info).toHaveBeenCalledWith('Autor restaurado', expect.objectContaining({
        context: 'AutoresService',
        operation: 'restore',
        id: 1,
      }));
      expect(result).toEqual(mockAutor);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      autorModel.findOne.mockResolvedValue(null);
      autorModel.restore = jest.fn();

      await expect(service.restore(99)).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalledWith('Intento de restaurar autor inexistente', expect.objectContaining({
        context: 'AutoresService',
        operation: 'restore',
        id: 99,
      }));
      expect(autorModel.restore).not.toHaveBeenCalled();
    });
  });
});
