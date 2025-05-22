import { Test, TestingModule } from '@nestjs/testing';
import { LibrosService } from './libros.service';
import { NotFoundException } from '@nestjs/common';
import { Logger } from 'winston';
import { Libro } from '../models/libro.model';
import * as fastCsv from 'fast-csv';

jest.mock('src/utils/paginate', () => ({
  paginate: jest.fn().mockResolvedValue({ rows: [], count: 0 }),
}));

describe('LibrosService', () => {
  let service: LibrosService;
  let logger: Logger;

  const mockLibroModel = {
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    restore: jest.fn(),
    findAll: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LibrosService,
        { provide: 'LibroRepository', useValue: mockLibroModel },
        { provide: 'winston', useValue: mockLogger },
        { provide: 'WINSTON_MODULE_PROVIDER', useValue: mockLogger },
        { provide: Libro, useValue: mockLibroModel },
      ],
    })
      .overrideProvider(LibrosService)
      .useFactory({
        factory: () => new LibrosService(mockLibroModel as any, mockLogger as any),
      })
      .compile();

    service = module.get<LibrosService>(LibrosService);
    logger = mockLogger as unknown as Logger;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debería crear un libro y loguear', async () => {
      const dto = { titulo: 'Libro A' };
      const libroCreado = { id: 1, titulo: 'Libro A' };
      mockLibroModel.create.mockResolvedValue(libroCreado);

      const res = await service.create(dto as Libro);

      expect(mockLibroModel.create).toHaveBeenCalledWith(dto);
      expect(logger.info).toHaveBeenCalledWith('Libro creado', expect.any(Object));
      expect(res).toEqual(libroCreado);
    });
  });

  describe('findAll', () => {
    it('debería llamar a paginate y loguear', async () => {
      const paginate = require('src/utils/paginate').paginate;
      paginate.mockResolvedValue({ rows: [], count: 0 });

      const res = await service.findAll(2, 15);

      expect(logger.info).toHaveBeenCalledWith('Listando libros', expect.any(Object));
      expect(paginate).toHaveBeenCalledWith(mockLibroModel, 2, 15);
      expect(res).toEqual({ rows: [], count: 0 });
    });
  });

  describe('findOne', () => {
    it('debería retornar libro si existe', async () => {
      const libro = { id: 1, titulo: 'Libro A' };
      mockLibroModel.findByPk.mockResolvedValue(libro);

      const res = await service.findOne(1);

      expect(mockLibroModel.findByPk).toHaveBeenCalledWith(1);
      expect(res).toEqual(libro);
    });

    it('debería lanzar NotFoundException si no existe', async () => {
      mockLibroModel.findByPk.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith('Libro no encontrado', expect.any(Object));
    });
  });

  describe('update', () => {
    it('debería actualizar libro y loguear', async () => {
      const libro = {
        id: 1,
        titulo: 'Libro A',
        update: jest.fn().mockResolvedValue(true),
      };
      mockLibroModel.findByPk.mockResolvedValue(libro);

      const dto = { titulo: 'Libro Actualizado' };
      const res = await service.update(1, dto);

      expect(libro.update).toHaveBeenCalledWith(dto);
      expect(logger.info).toHaveBeenCalledWith('Libro actualizado', expect.any(Object));
      expect(res).toEqual(libro);
    });
  });

  describe('remove', () => {
    it('debería eliminar libro y loguear', async () => {
      const libro = {
        id: 1,
        titulo: 'Libro A',
        destroy: jest.fn().mockResolvedValue(true),
      };
      mockLibroModel.findByPk.mockResolvedValue(libro);

      await service.remove(1);

      expect(libro.destroy).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Libro eliminado', expect.any(Object));
    });
  });

  describe('restore', () => {
    it('debería restaurar libro y loguear', async () => {
      const libro = { id: 1, titulo: 'Libro A' };
      mockLibroModel.findOne.mockResolvedValue(libro);
      mockLibroModel.restore.mockResolvedValue(true);
      mockLibroModel.findByPk.mockResolvedValue(libro);

      const res = await service.restore(1);

      expect(mockLibroModel.findOne).toHaveBeenCalledWith({ where: { id: 1 }, paranoid: false });
      expect(mockLibroModel.restore).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(logger.info).toHaveBeenCalledWith('Libro restaurado', expect.any(Object));
      expect(res).toEqual(libro);
    });

    it('debería lanzar excepción si libro no existe', async () => {
      mockLibroModel.findOne.mockResolvedValue(null);

      await expect(service.restore(999)).rejects.toThrow(NotFoundException);
      expect(logger.warn).toHaveBeenCalledWith('Intento de restaurar libro inexistente', expect.any(Object));
    });
  });

  describe('export', () => {
    it('debería exportar libros en csv y loguear', async () => {
      const libros = [
        {
          id: 1,
          titulo: 'Libro A',
          autor: { nombre: 'Autor 1' },
          editorial: { nombre: 'Editorial 1' },
          genero: { nombre: 'Genero 1' },
          precio: 10,
          disponible: true,
          imagenUrl: 'url.jpg',
        },
      ];

      mockLibroModel.findAll.mockResolvedValue(libros);

      const mockRes = {
        setHeader: jest.fn(),
        status: jest.fn().mockReturnThis(),
        end: jest.fn(),
      };

      const csvWriteMock = {
        pipe: jest.fn().mockReturnThis(),
        write: jest.fn(),
        end: jest.fn(),
      };
      jest.spyOn(fastCsv, 'format').mockReturnValue(csvWriteMock as any);

      await service.export(mockRes as any);

      expect(mockLibroModel.findAll).toHaveBeenCalledWith({
        raw: true,
        nest: true,
        include: [
          { model: expect.anything(), attributes: ['nombre'] },
          { model: expect.anything(), attributes: ['nombre'] },
          { model: expect.anything(), attributes: ['nombre'] },
        ],
      });
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Disposition', 'attachment; filename="libros.csv"');
      expect(csvWriteMock.pipe).toHaveBeenCalledWith(mockRes);
      expect(csvWriteMock.write).toHaveBeenCalled();
      expect(csvWriteMock.end).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('Exportación CSV completada', expect.any(Object));
    });
  });
});
