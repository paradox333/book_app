import { paginate, PaginatedResult } from './paginate'; // Import both the function and the interface
import { Model } from 'sequelize-typescript'; // Or just 'sequelize' if you use the generic Model type

 
 
class MockSequelizeModel<T> extends Model {
 
  static findAndCountAll: jest.Mock;
}

describe('paginate', () => {
  let mockModel: typeof MockSequelizeModel; // To mock the static methods of the model

  beforeEach(() => {
 
    mockModel = MockSequelizeModel;
    mockModel.findAndCountAll = jest.fn();
  });

  it('should return paginated data with default page and limit', async () => {
    const mockItems = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));
    mockModel.findAndCountAll.mockResolvedValue({
      count: 100, // Total items
      rows: mockItems.slice(0, 10), // Default limit is 10
    });

    const result: PaginatedResult<any> = await paginate(mockModel); // No page/limit provided

    expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
      limit: 10,  // Default limit
      offset: 0,  // Default page 1 -> offset 0
    });

    expect(result.data).toEqual(mockItems.slice(0, 10));
    expect(result.meta).toEqual({
      total: 100,
      page: 1,    // Default page
      limit: 10,  // Default limit
    });
  });

  it('should return paginated data for a specific page and limit', async () => {
    const mockItems = Array.from({ length: 5 }, (_, i) => ({ id: i + 11, name: `Item ${i + 11}` }));
    mockModel.findAndCountAll.mockResolvedValue({
      count: 25, // Total items
      rows: mockItems, // 5 items for page 3, limit 5
    });

    const page = 3;
    const limit = 5;

    const result: PaginatedResult<any> = await paginate(mockModel, page, limit);

    expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
      limit: limit,
      offset: (page - 1) * limit, // (3 - 1) * 5 = 10
    });

    expect(result.data).toEqual(mockItems);
    expect(result.meta).toEqual({
      total: 25,
      page: 3,
      limit: 5,
    });
  });

  it('should return empty data when no items are found', async () => {
    mockModel.findAndCountAll.mockResolvedValue({
      count: 0,
      rows: [],
    });

    const page = 1;
    const limit = 10;

    const result: PaginatedResult<any> = await paginate(mockModel, page, limit);

    expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
      limit,
      offset: 0,
    });

    expect(result.data).toHaveLength(0);
    expect(result.meta).toEqual({
      total: 0,
      page: 1,
      limit: 10,
    });
  });

  it('should pass through additional options to findAndCountAll', async () => {
    const mockItems = [{ id: 1, name: 'Filtered Item' }];
    const options = { where: { name: 'Filtered' }, include: ['Category'] };

    mockModel.findAndCountAll.mockResolvedValue({
      count: 1,
      rows: mockItems,
    });

    const page = 1;
    const limit = 10;

    const result: PaginatedResult<any> = await paginate(mockModel, page, limit, options);

    expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
      ...options, // Ensure options are spread
      limit,
      offset: 0,
    });

    expect(result.data).toEqual(mockItems);
    expect(result.meta.total).toBe(1);
  });

  it('should handle zero limit gracefully', async () => {
 
 
    mockModel.findAndCountAll.mockResolvedValue({
      count: 50,
      rows: [], // No rows for limit 0
    });

    const page = 1;
    const limit = 0;

    const result: PaginatedResult<any> = await paginate(mockModel, page, limit);

    expect(mockModel.findAndCountAll).toHaveBeenCalledWith({
      limit: 0,
      offset: 0,
    });

    expect(result.data).toHaveLength(0);
    expect(result.meta).toEqual({
      total: 50,
      page: 1,
      limit: 0,
    });
  });
});