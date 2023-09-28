import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StudioService } from './studio.service';
import { CreateStudioDto } from './dto/create-studio.dto';
import { UpdateStudioDto } from './dto/update-studio.dto';
import { AtGuards } from 'src/common/guards/at-guards';
import { CreateLocationDto } from './dto/create-locations.dto';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@Controller('studio')
@ApiTags('Studio')
@ApiSecurity('JWT-auth')
export class StudioController {
  constructor(private readonly studioService: StudioService) {}

  @UseGuards(AtGuards)
  @HttpCode(HttpStatus.OK)
  @Post()
  create(@Body() createStudioDto: CreateStudioDto) {
    return this.studioService.create(createStudioDto);
  }

  @UseGuards(AtGuards)
  @Get()
  findAll() {
    return this.studioService.findAll();
  }

  @UseGuards(AtGuards)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studioService.findOne(id);
  }

  @UseGuards(AtGuards)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudioDto: UpdateStudioDto) {
    return this.studioService.update(id, updateStudioDto);
  }

  //@Delete(':id')
  //remove(@Param('id') id: string) {
  //  return this.studioService.remove(+id);
  //}

  @UseGuards(AtGuards)
  @Post('location')
  createLocation(@Body() createLocationDto: CreateLocationDto) {}
}
