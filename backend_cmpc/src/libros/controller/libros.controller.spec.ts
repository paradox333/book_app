import { Test, TestingModule } from '@nestjs/testing';
import { LibrosController } from './libros.controller';
import { LibrosService } from '../service/libros.service';
import { Response } from 'express';
import { Libro } from '../models/libro.model';

describe('LibrosController', () => {
  let controller: LibrosController;
  let service: LibrosService;

  const mockLibrosService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    restore: jest.fn(),
    export: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LibrosController],
      providers: [
        { provide: LibrosService, useValue: mockLibrosService },
      ],
    }).compile();

    controller = module.get<LibrosController>(LibrosController);
    service = module.get<LibrosService>(LibrosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería llamar a librosService.create con el dto', async () => {
      const dto = { titulo: 'Libro 1' };
      const resultado = { id: 1, titulo: 'Libro 1' };
      mockLibrosService.create.mockResolvedValue(resultado);

      const res = await controller.create(dto as Libro);

      expect(mockLibrosService.create).toHaveBeenCalledWith(dto);
      expect(res).toEqual(resultado);
    });
  });

  describe('findAll', () => {
    it('debería llamar a librosService.findAll con page y limit convertidos a números', async () => {
      const resultado = { rows: [], count: 0 };
      mockLibrosService.findAll.mockResolvedValue(resultado);

      const res = await controller.findAll('2', '20');

      expect(mockLibrosService.findAll).toHaveBeenCalledWith(2, 20);
      expect(res).toEqual(resultado);
    });

    it('debería usar valores por defecto para page y limit si no se pasan', async () => {
      const resultado = { rows: [], count: 0 };
      mockLibrosService.findAll.mockResolvedValue(resultado);

      const res = await controller.findAll();

      expect(mockLibrosService.findAll).toHaveBeenCalledWith(1, 10);
      expect(res).toEqual(resultado);
    });
  });

  describe('findOne', () => {
    it('debería llamar a librosService.findOne con id numérico', async () => {
      const resultado = { id: 1, titulo: 'Libro 1' };
      mockLibrosService.findOne.mockResolvedValue(resultado);

      const res = await controller.findOne('1');

      expect(mockLibrosService.findOne).toHaveBeenCalledWith(1);
      expect(res).toEqual(resultado);
    });
  });

  describe('update', () => {
    it('debería llamar a librosService.update con id y dto', async () => {
      const dto = { titulo: 'Libro actualizado' };
      const resultado = { id: 1, titulo: 'Libro actualizado' };
      mockLibrosService.update.mockResolvedValue(resultado);

      const res = await controller.update('1', dto);

      expect(mockLibrosService.update).toHaveBeenCalledWith(1, dto);
      expect(res).toEqual(resultado);
    });
  });

  describe('remove', () => {
    it('debería llamar a librosService.remove con id numérico', async () => {
      mockLibrosService.remove.mockResolvedValue(undefined);

      await controller.remove('1');

      expect(mockLibrosService.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('restore', () => {
    it('debería llamar a librosService.restore con id numérico', async () => {
      const resultado = { id: 1, titulo: 'Libro restaurado' };
      mockLibrosService.restore.mockResolvedValue(resultado);

      const res = await controller.restore(1);

      expect(mockLibrosService.restore).toHaveBeenCalledWith(1);
      expect(res).toEqual(resultado);
    });
  });

  describe('exportCsv', () => {
    it('debería llamar a librosService.export con el response', async () => {
      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        end: jest.fn(),
      } as unknown as Response;

      mockLibrosService.export.mockResolvedValue(undefined);

      await controller.exportCsv(mockRes);

      expect(mockLibrosService.export).toHaveBeenCalledWith(mockRes);
    });
  });
});
