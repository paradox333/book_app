import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import * as bcryptjs from 'bcryptjs';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { UsuariosService } from './usuarios.service';
import { Usuario } from '../model/usuario.model';
import { CreateUsuarioDto } from '../dto/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/update-usuario.dto';


jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hashed) => Promise.resolve(password === 'correct_password_mock')),
}));

jest.mock('src/utils/paginate', () => ({
  paginate: jest.fn((model, page, limit) => Promise.resolve({
    items: [
      { id: 1, email: `user${(page - 1) * limit + 1}@test.com` },
      { id: 2, email: `user${(page - 1) * limit + 2}@test.com` },
    ].slice(0, limit),
    meta: {
      totalItems: 20,
      itemCount: limit,
      itemsPerPage: limit,
      totalPages: Math.ceil(20 / limit),
      currentPage: page,
    },
  })),
}));


const createMockUserInstance = (initialData?: any) => {
  const instance = {
    id: initialData?.id || 1,
    email: initialData?.email || 'test@example.com',
    nombre: initialData?.nombre || 'Test User',
    passwordHash: initialData?.passwordHash || 'hashed_password_123',
    update: jest.fn((data: any) => {
      return Promise.resolve({ ...instance, ...data });
    }),
    destroy: jest.fn(() => Promise.resolve()),
  };
  return instance;
};


jest.mock('src/utils/paginate', () => ({
  paginate: jest.fn((model, page, limit) => Promise.resolve({
    items: [
      { id: 1, email: `user${(page - 1) * limit + 1}@test.com` },
      { id: 2, email: `user${(page - 1) * limit + 2}@test.com` },
    ].slice(0, limit),
    meta: {
      totalItems: 20,
      itemCount: limit,
      itemsPerPage: limit,
      totalPages: Math.ceil(20 / limit),
      currentPage: page,
    },
  })),
}));

 
import { paginate } from 'src/utils/paginate';


describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarioModel: typeof Usuario;
  let logger: any;

 
  const mockUsuarioModel = {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    restore: jest.fn(),
    destroy: jest.fn(), // Aunque findOne().destroy() es más común, mockeamos si se llama directamente
  };

 
  const mockWinstonLogger = {
    warn: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

 
  const mockUserInstance = {
    id: 1,
    email: 'test@example.com',
    nombre: 'Test User',
    passwordHash: 'hashed_password_123',
 
    update: jest.fn((data) => Promise.resolve({ ...mockUserInstance, ...data })),
 
    destroy: jest.fn(() => Promise.resolve()),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getModelToken(Usuario),
          useValue: mockUsuarioModel,
        },
        {
 
          provide: WINSTON_MODULE_PROVIDER,
          useValue: mockWinstonLogger,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
    usuarioModel = module.get<typeof Usuario>(getModelToken(Usuario));
    logger = module.get(WINSTON_MODULE_PROVIDER);

 
    jest.clearAllMocks();

 
 
    (bcryptjs.hash as jest.Mock).mockImplementation((password) => Promise.resolve(`hashed_${password}`));
    (bcryptjs.compare as jest.Mock).mockImplementation((password, hashed) => Promise.resolve(password === 'correct_password_mock'));
    (paginate as jest.Mock).mockImplementation((model, page, limit) => Promise.resolve({
      items: [
        { id: 1, email: `user${(page - 1) * limit + 1}@test.com` },
        { id: 2, email: `user${(page - 1) * limit + 2}@test.com` },
      ].slice(0, limit),
      meta: {
        totalItems: 20,
        itemCount: limit,
        itemsPerPage: limit,
        totalPages: Math.ceil(20 / limit),
        currentPage: page,
      },
    }));

 
    (mockUsuarioModel.findOne as jest.Mock).mockClear();
    (mockUsuarioModel.findByPk as jest.Mock).mockClear();
    (mockUsuarioModel.create as jest.Mock).mockClear();
    (mockUsuarioModel.restore as jest.Mock).mockClear();
    (mockUserInstance.update as jest.Mock).mockClear();
    (mockUserInstance.destroy as jest.Mock).mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

 
  describe('create', () => {
    const createDto: CreateUsuarioDto = {
      email: 'newuser@example.com',
      password: 'newPassword123',
      nombre: 'New User',
    };

    it('should create a new user if email does not exist', async () => {
      (mockUsuarioModel.findOne as jest.Mock).mockResolvedValue(null); // No existe usuario
      (mockUsuarioModel.create as jest.Mock).mockResolvedValue({
        id: 2,
        ...createDto,
        passwordHash: 'hashed_newPassword123',
      });

      const result = await service.create(createDto);

      expect(usuarioModel.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
        paranoid: false,
      });
      expect(bcryptjs.hash).toHaveBeenCalledWith(createDto.password, (service as any)['saltRounds']);
      expect(usuarioModel.create).toHaveBeenCalledWith({
        email: createDto.email,
        passwordHash: 'hashed_newPassword123',
        nombre: createDto.nombre,
      });
      expect(logger.info).toHaveBeenCalledWith('Usuario creado', expect.any(Object));
      expect(result).toEqual(expect.objectContaining({ id: 2, email: createDto.email }));
    });

    it('should throw BadRequestException if email already exists', async () => {
      (mockUsuarioModel.findOne as jest.Mock).mockResolvedValue(mockUserInstance); // Usuario ya existe

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto)).rejects.toThrow('Email ya registrado');

      expect(usuarioModel.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
        paranoid: false,
      });
      expect(bcryptjs.hash).not.toHaveBeenCalled();
      expect(usuarioModel.create).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Intento de registrar un email ya existente', expect.any(Object));
    });
  });

 
  describe('findAll', () => {
    it('should return a paginated list of users', async () => {
      const page = 1;
      const limit = 5;

      const result = await service.findAll(page, limit);

      expect(logger.info).toHaveBeenCalledWith('Listando usuarios', expect.any(Object));
      expect(paginate).toHaveBeenCalledWith(usuarioModel, page, limit);
      expect(result).toEqual(expect.objectContaining({
        items: expect.any(Array),
        meta: expect.any(Object),
      }));
    });
  });

 
  describe('findOne', () => {
    const userId = 1;

    it('should return a user if found', async () => {
      (mockUsuarioModel.findByPk as jest.Mock).mockResolvedValue(mockUserInstance);

      const result = await service.findOne(userId);

      expect(usuarioModel.findByPk).toHaveBeenCalledWith(userId);
      expect(logger.warn).not.toHaveBeenCalled();
      expect(result).toEqual(mockUserInstance);
    });

    it('should throw NotFoundException if user not found', async () => {
      (mockUsuarioModel.findByPk as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(userId)).rejects.toThrow(`Usuario ${userId} no encontrado`);

      expect(usuarioModel.findByPk).toHaveBeenCalledWith(userId);
      expect(logger.warn).toHaveBeenCalledWith('Usuario no encontrado', expect.any(Object));
    });
  });

 
function createMockUserInstance(data: Partial<Usuario>): Usuario {
  const user = {
    ...data,
    update: jest.fn().mockImplementation(function (data) {
      Object.assign(this, data);
      return Promise.resolve(this);
    }),
        destroy: jest.spyOn(bcryptjs, 'hash').mockImplementation(async () => 'hashed_newStrongPassword')
  };
 
  return Object.setPrototypeOf(user, Usuario.prototype);
}
  describe('update', () => {
  it('should update user name and email if no email change conflict', async () => {
    const updateDto = {
      email: 'updated@example.com',
      nombre: 'Updated User Name',
    };

    const mockUserInstance = {
      id: 1,
      email: 'original@example.com',
      nombre: 'Original Name',
      passwordHash: 'original_hashed_password',
      update: jest.fn().mockImplementation(function (data) {
        Object.assign(this, data);
        return Promise.resolve(this);
      }),
    };

    jest.spyOn(service, 'findOne').mockResolvedValue(mockUserInstance as any);
    mockUsuarioModel.findOne.mockResolvedValue(null);
    jest.spyOn(bcryptjs, 'hash').mockImplementation(async () => 'fakeHash');

    const result = await service.update(1, updateDto);

    expect(bcryptjs.hash).not.toHaveBeenCalled();
    expect(mockUserInstance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        email: updateDto.email,
        nombre: updateDto.nombre,
        passwordHash: 'original_hashed_password',
      }),
    );
    expect(result).toEqual(mockUserInstance);
  });

 
});


 
  describe('remove', () => {
    const userId = 1;
    let findOneSpy: jest.SpyInstance;

    beforeEach(() => {
      findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValue(mockUserInstance);
      (mockUserInstance.destroy as jest.Mock).mockClear();
    });

    afterEach(() => {
      findOneSpy.mockRestore();
    });

    it('should remove a user if found', async () => {
      await service.remove(userId);

      expect(findOneSpy).toHaveBeenCalledWith(userId);
      expect(mockUserInstance.destroy).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith('Usuario eliminado', expect.any(Object));
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user to remove is not found (delegated to findOne)', async () => {
 
 
 
      findOneSpy.mockRejectedValue(new NotFoundException(`Usuario ${userId} no encontrado`));

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(userId)).rejects.toThrow(`Usuario ${userId} no encontrado`);

      expect(findOneSpy).toHaveBeenCalledWith(userId);
      expect(mockUserInstance.destroy).not.toHaveBeenCalled();
      expect(logger.info).not.toHaveBeenCalled();
 
 
 
 
    });
  });

 
  describe('restore', () => {
    const userId = 1;

    it('should restore a soft-deleted user', async () => {
 
      (mockUsuarioModel.findOne as jest.Mock).mockResolvedValue({ ...mockUserInstance, deletedAt: new Date() });
      (mockUsuarioModel.restore as jest.Mock).mockResolvedValue(1); // Sequelize devuelve 1 si se restauró

 
      (mockUsuarioModel.findByPk as jest.Mock).mockResolvedValue(mockUserInstance);

      const result = await service.restore(userId);

      expect(usuarioModel.findOne).toHaveBeenCalledWith({ where: { id: userId }, paranoid: false });
      expect(usuarioModel.restore).toHaveBeenCalledWith({ where: { id: userId } });
      expect(usuarioModel.findByPk).toHaveBeenCalledWith(userId);
      expect(logger.info).toHaveBeenCalledWith('Usuario restaurado', expect.any(Object));
      expect(logger.warn).not.toHaveBeenCalled();
      expect(result).toEqual(mockUserInstance);
    });

    it('should throw NotFoundException if user to restore is not found (even soft-deleted)', async () => {
      (mockUsuarioModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.restore(userId)).rejects.toThrow(NotFoundException);
      await expect(service.restore(userId)).rejects.toThrow(`Usuario con ID ${userId} no encontrado`);

      expect(usuarioModel.findOne).toHaveBeenCalledWith({ where: { id: userId }, paranoid: false });
      expect(usuarioModel.restore).not.toHaveBeenCalled();
      expect(usuarioModel.findByPk).not.toHaveBeenCalled();
      expect(logger.warn).toHaveBeenCalledWith('Intento de restaurar usuario no existente', expect.any(Object));
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

 
   describe('findByEmail', () => {
    const email = 'search@example.com';

    it('should return a user if found', async () => {
 
      (mockUsuarioModel.findOne as jest.Mock).mockResolvedValue({ ...mockUserInstance, email: email });

      const result = await service.findByEmail(email);

      expect(logger.info).toHaveBeenCalledWith('Buscando usuario por email', expect.any(Object));
      expect(usuarioModel.findOne).toHaveBeenCalledWith({ where: { email }, paranoid: true });
      expect(result).toEqual(expect.objectContaining({ email: email })); // Solo verificamos el email
    });

    it('should return null if user not found', async () => {
      (mockUsuarioModel.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(logger.info).toHaveBeenCalledWith('Buscando usuario por email', expect.any(Object));
      expect(usuarioModel.findOne).toHaveBeenCalledWith({ where: { email }, paranoid: true });
      expect(result).toBeNull();
    });

    it('should include soft-deleted users if includeDeleted is true', async () => {
 
 
      (mockUsuarioModel.findOne as jest.Mock).mockResolvedValue({
        ...mockUserInstance,
        email: email, // <--- SOBRESCRIBE el email del mockUserInstance
        deletedAt: new Date(),
      });

      const result = await service.findByEmail(email, true);

      expect(logger.info).toHaveBeenCalledWith('Buscando usuario por email', expect.any(Object));
      expect(usuarioModel.findOne).toHaveBeenCalledWith({ where: { email }, paranoid: false });
 
 
      expect(result).toEqual(expect.objectContaining({ email: email, deletedAt: expect.any(Date) }));
    });
  });
});