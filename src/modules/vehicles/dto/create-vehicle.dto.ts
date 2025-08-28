import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsOptional, 
  IsString, 
  IsNumber,
  IsEnum,
  MaxLength, 
  Min, 
  Max 
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({
    description: 'Placa do veículo',
    example: 'ABC-1234',
  })
  @IsNotEmpty({ message: 'Placa é obrigatória' })
  @IsString({ message: 'Placa deve ser uma string' })
  @MaxLength(10, { message: 'Placa deve ter no máximo 10 caracteres' })
  placa: string;

  @ApiProperty({
    description: 'Marca do veículo',
    example: 'Volvo',
  })
  @IsNotEmpty({ message: 'Marca é obrigatória' })
  @IsString({ message: 'Marca deve ser uma string' })
  @MaxLength(50, { message: 'Marca deve ter no máximo 50 caracteres' })
  marca: string;

  @ApiProperty({
    description: 'Modelo do veículo',
    example: 'FH 540',
  })
  @IsNotEmpty({ message: 'Modelo é obrigatório' })
  @IsString({ message: 'Modelo deve ser uma string' })
  @MaxLength(50, { message: 'Modelo deve ter no máximo 50 caracteres' })
  modelo: string;

  @ApiProperty({
    description: 'Ano de fabricação',
    example: 2020,
  })
  @IsNotEmpty({ message: 'Ano é obrigatório' })
  @IsNumber({}, { message: 'Ano deve ser um número' })
  @Min(1900, { message: 'Ano deve ser maior que 1900' })
  @Max(new Date().getFullYear() + 1, { message: 'Ano não pode ser maior que o próximo ano' })
  ano: number;

  @ApiProperty({
    description: 'Cor do veículo',
    example: 'Branco',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Cor deve ser uma string' })
  @MaxLength(30, { message: 'Cor deve ter no máximo 30 caracteres' })
  cor?: string;

  @ApiProperty({
    description: 'Tipo do veículo',
    example: 'CAMINHAO',
    enum: ['CAMINHAO', 'VAN', 'CARRETA', 'UTILITARIO', 'OUTROS'],
  })
  @IsNotEmpty({ message: 'Tipo é obrigatório' })
  @IsEnum(['CAMINHAO', 'VAN', 'CARRETA', 'UTILITARIO', 'OUTROS'], {
    message: 'Tipo deve ser CAMINHAO, VAN, CARRETA, UTILITARIO ou OUTROS'
  })
  tipo: string;

  @ApiProperty({
    description: 'Capacidade de carga em kg',
    example: 15000.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Capacidade de carga deve ser um número com no máximo 2 casas decimais' })
  @Min(0, { message: 'Capacidade de carga deve ser maior ou igual a 0' })
  capacidadeCarga?: number;

  @ApiProperty({
    description: 'Observações sobre o veículo',
    example: 'Veículo com baú refrigerado',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Observações devem ser uma string' })
  @MaxLength(500, { message: 'Observações devem ter no máximo 500 caracteres' })
  observacoes?: string;
}
