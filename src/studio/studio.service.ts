import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Studio } from './entities/studio.entity';
import { EntityManager, In, Repository } from 'typeorm';
import { Locations } from './entities/locations.entity';
import { CreateLocationDto } from './dto/create-locations.dto';

@Injectable()
export class StudioService {
  private logger = new Logger('StudioService');

  constructor(
    @InjectRepository(Studio)
    private readonly studioRepository: Repository<Studio>,
    //private readonly locationsRepository: Repository<Locations>,
    private entityManager: EntityManager,
  ) {}

  async create(createStudioDto: CreateStudioDto) {
    this.logger.log('Creating new studio');
    const studio = new Studio(createStudioDto);
    try {
      return await this.entityManager.save(studio);
    } catch (error) {
      if (error.errno == 1062) {
        this.logger.error('Duplicate entry for studio.', error);
        throw new ConflictException('Studio already exists.');
      } else {
        this.logger.error('Unexpected error : ', error);
        throw new InternalServerErrorException();
      }
    }
  }

  findAll() {
    this.logger.log('Find all studio');
    return this.studioRepository.find();
  }

  findOne(id: string) {
    this.logger.log('Find one studio');
    return this.studioRepository.findOneBy({
      id,
    });
  }

  async update(id: string, updateStudioDto: UpdateStudioDto) {
    this.logger.log('Update Studio');
    return await this.studioRepository.update(
      { id: In([id]) },
      { name: updateStudioDto.name },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} studio`;
  }

  async createLocation(createLocationDto: CreateLocationDto) {
    const location = null; //new Locations(createLocationDto);
    try {
      return await this.entityManager.save(location);
    } catch (error) {
      if (error.errno == 1062) {
        this.logger.error('Duplicate entry for location.', error);
        throw new ConflictException('Location already exists.');
      } else {
        this.logger.error('Unexpected error : ', error);
        throw new InternalServerErrorException();
      }
    }
  }
}
