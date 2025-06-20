import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'Usuário que está atualizando o produto',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Usuário de atualização deve ser uma string' })
  usuarioAtualizacao?: string;
}
