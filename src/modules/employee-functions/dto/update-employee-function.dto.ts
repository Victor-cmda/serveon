import { PartialType } from '@nestjs/swagger';
import { CreateEmployeeFunctionDto } from './create-employee-function.dto';

export class UpdateEmployeeFunctionDto extends PartialType(CreateEmployeeFunctionDto) {}
