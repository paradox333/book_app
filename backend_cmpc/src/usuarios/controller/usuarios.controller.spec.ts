import { Test, TestingModule } from '@nestjs/testing';
import { UsuariosService } from '../service/usuarios.service';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';
import { UsuariosController } from './usuarios.controller';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let service: Partial<Record<keyof UsuariosService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [{ provide: UsuariosService, useValue: service }],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  describe('create', () => {
    it('debería llamar a usuariosService.create con el DTO', async () => {
      const dto: CreateUsuarioDto = { email: 'test@mail.com', password: '1234', nombre: 'Test' };
      const result = { id: 1, ...dto };
      service.create.mockResolvedValue(result);

      expect(await controller.create(dto)).toEqual(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debería llamar a usuariosService.findAll con page y limit convertidos a número', async () => {
      const result = [{ id: 1, email: 'a@mail.com' }];
      service.findAll.mockResolvedValue(result);

      expect(await controller.findAll('2', '5')).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(2, 5);
    });

    it('debería usar valores por defecto si no se pasan query params', async () => {
      const result = [{ id: 1, email: 'a@mail.com' }];
      service.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toEqual(result);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('debería llamar a usuariosService.findOne con id numérico', async () => {
      const result = { id: 1, email: 'test@mail.com' };
      service.findOne.mockResolvedValue(result);

      expect(await controller.findOne('1')).toEqual(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('debería llamar a usuariosService.update con id y DTO', async () => {
      const dto: UpdateUsuarioDto = { nombre: 'Nuevo Nombre' };
      const result = { id: 1, email: 'test@mail.com', nombre: 'Nuevo Nombre' };
      service.update.mockResolvedValue(result);

      expect(await controller.update('1', dto)).toEqual(result);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('debería llamar a usuariosService.remove con id numérico', async () => {
      service.remove.mockResolvedValue(undefined);

      expect(await controller.remove('1')).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('restore', () => {
    it('debería llamar a usuariosService.restore con id numérico', async () => {
      const result = { id: 1, email: 'test@mail.com' };
      service.restore.mockResolvedValue(result);

      expect(await controller.restore('1')).toEqual(result);
      expect(service.restore).toHaveBeenCalledWith(1);
    });
  });
});
