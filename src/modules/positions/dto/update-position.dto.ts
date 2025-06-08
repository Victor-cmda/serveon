import { PartialType } from '@nestjs/mapped-types';
import { CreatePositionDto } from './create-position.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePositionDto extends PartialType(CreatePositionDto) {
  @ApiProperty({
    description: 'Status ativo/inativo do cargo',
    example: true,
    required: false
  })
  @IsOptional()
  @IsBoolean({ message: 'ativo deve ser um valor booleano' })
  ativo?: boolean;
}
