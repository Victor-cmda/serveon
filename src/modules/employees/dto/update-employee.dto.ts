import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateEmployeeDto } from './create-employee.dto';

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {
  @ApiProperty({
    description: 'Data de demissão no formato YYYY-MM-DD',
    example: '2023-12-31',
    required: false
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: 'Data de demissão deve ser uma data válida' })
  dataDemissao?: Date;
}