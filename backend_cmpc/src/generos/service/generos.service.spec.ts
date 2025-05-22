import { Test, TestingModule } from '@nestjs/testing';
import { GenerosService } from './generos.service';
import { getModelToken } from '@nestjs/sequelize';
import { Genero } from '../model/genero.model';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

describe('GenerosService', () => {
  let service: GenerosService;
  let loggerMock: any;
  let generoModelMock: any;

  beforeEach(async () => {
    generoModelMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
    };

    loggerMock = {
      info: jest.fn(),
      warn: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerosService,
        {
          provide: getModelToken(Genero),
          useValue: generoModelMock,
        },
        {
          provide: WINSTON_MODULE_PROVIDER,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<GenerosService>(GenerosService);
  });

  describe('create', () => {
    it('debería crear un nuevo género y loguear la acción', async () => {
      generoModelMock.findOne.mockResolvedValue(null);
      generoModelMock.create.mockResolvedValue({ id: 1, nombre: 'Ficción' });

      const result = await service.create({ nombre: 'Ficción' });

      expect(generoModelMock.findOne).toHaveBeenCalledWith({
        where: { nombre: 'ficción' },
      });
      expect(generoModelMock.create).toHaveBeenCalledWith({ nombre: 'Ficción' });
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Género creado: Ficción',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'create',
          model: 'Genero',
          data: { nombre: 'Ficción' },
        }),
      );
      expect(result).toEqual({ id: 1, nombre: 'Ficción' });
    });

    it('debería lanzar ConflictException y loguear advertencia si el género ya existe', async () => {
      generoModelMock.findOne.mockResolvedValue({ id: 1, nombre: 'ficción' });

      await expect(service.create({ nombre: 'Ficción' })).rejects.toThrow(
        ConflictException,
      );

      expect(loggerMock.warn).toHaveBeenCalledWith(
        'Intento de crear género duplicado: Ficción',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'create',
          model: 'Genero',
        }),
      );
      expect(generoModelMock.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('debería devolver todos los géneros y loguear la acción', async () => {
      const generosMock = [
        { id: 1, nombre: 'Acción' },
        { id: 2, nombre: 'Drama' },
      ];
      generoModelMock.findAll.mockResolvedValue(generosMock);

      const result = await service.findAll();

      expect(generoModelMock.findAll).toHaveBeenCalled();
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Listando géneros',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'findAll',
          model: 'Genero',
          cantidad: generosMock.length,
        }),
      );
      expect(result).toEqual(generosMock);
    });
  });

  describe('findOne', () => {
    it('debería devolver un género existente y loguear la consulta', async () => {
      const generoMock = { id: 1, nombre: 'Acción' };
      generoModelMock.findByPk.mockResolvedValue(generoMock);

      const result = await service.findOne(1);

      expect(generoModelMock.findByPk).toHaveBeenCalledWith(1);
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Género consultado: 1',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'findOne',
          model: 'Genero',
        }),
      );
      expect(result).toEqual(generoMock);
    });

    it('debería lanzar NotFoundException y loguear advertencia si no existe', async () => {
      generoModelMock.findByPk.mockResolvedValue(null);

      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);

      expect(loggerMock.warn).toHaveBeenCalledWith(
        'Género con ID 99 no encontrado',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'findOne',
          model: 'Genero',
        }),
      );
    });
  });

  describe('update', () => {
    it('debería actualizar un género existente y loguear la actualización', async () => {
      const generoMock = {
        id: 1,
        nombre: 'Drama',
        update: jest.fn().mockResolvedValue({ nombre: 'Drama' }),
      };
      generoModelMock.findByPk.mockResolvedValue(generoMock);

      const result = await service.update(1, { nombre: 'Drama' });

      expect(generoModelMock.findByPk).toHaveBeenCalledWith(1);
      expect(generoMock.update).toHaveBeenCalledWith({ nombre: 'Drama' });
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Género actualizado: 1',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'update',
          model: 'Genero',
          data: { nombre: 'Drama' },
        }),
      );
      expect(result).toEqual(generoMock);
    });

    it('debería lanzar NotFoundException y loguear advertencia si el género no existe', async () => {
      generoModelMock.findByPk.mockResolvedValue(null);

      await expect(service.update(99, { nombre: 'Comedia' })).rejects.toThrow(
        NotFoundException,
      );

      expect(loggerMock.warn).toHaveBeenCalledWith(
        'Género con ID 99 no encontrado para actualizar',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'update',
          model: 'Genero',
        }),
      );
    });
  });

  describe('remove', () => {
    it('debería eliminar un género existente y loguear la eliminación', async () => {
      const generoMock = {
        id: 1,
        destroy: jest.fn().mockResolvedValue(undefined),
      };
      generoModelMock.findByPk.mockResolvedValue(generoMock);

      await service.remove(1);

      expect(generoModelMock.findByPk).toHaveBeenCalledWith(1);
      expect(generoMock.destroy).toHaveBeenCalled();
      expect(loggerMock.info).toHaveBeenCalledWith(
        'Género eliminado: 1',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'remove',
          model: 'Genero',
        }),
      );
    });

    it('debería lanzar NotFoundException y loguear advertencia si no existe para eliminar', async () => {
      generoModelMock.findByPk.mockResolvedValue(null);

      await expect(service.remove(99)).rejects.toThrow(NotFoundException);

      expect(loggerMock.warn).toHaveBeenCalledWith(
        'Género con ID 99 no encontrado para eliminación',
        expect.objectContaining({
          context: 'GenerosService',
          operation: 'remove',
          model: 'Genero',
        }),
      );
    });
  });
});
