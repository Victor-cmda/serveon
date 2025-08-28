import { Injectable } from '@nestjs/common';
import { CreateEmployeeFunctionDto } from './dto/create-employee-function.dto';
import { UpdateEmployeeFunctionDto } from './dto/update-employee-function.dto';

@Injectable()
export class EmployeeFunctionsService {
  create(createEmployeeFunctionDto: CreateEmployeeFunctionDto) {
    return 'This action adds a new employee function';
  }

  findAll() {
    return `This action returns all employee functions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} employee function`;
  }

  update(id: number, updateEmployeeFunctionDto: UpdateEmployeeFunctionDto) {
    return `This action updates a #${id} employee function`;
  }

  remove(id: number) {
    return `This action removes a #${id} employee function`;
  }
}
