import { Injectable } from '@nestjs/common';
import { CreateTransporterDto } from './dto/create-transporter.dto';
import { UpdateTransporterDto } from './dto/update-transporter.dto';

@Injectable()
export class TransportersService {
  create(createTransporterDto: CreateTransporterDto) {
    return 'This action adds a new transporter';
  }

  findAll() {
    return `This action returns all transporters`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transporter`;
  }

  update(id: number, updateTransporterDto: UpdateTransporterDto) {
    return `This action updates a #${id} transporter`;
  }

  remove(id: number) {
    return `This action removes a #${id} transporter`;
  }
}
