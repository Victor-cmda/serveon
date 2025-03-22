import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class CreateCityDto {
    @ApiProperty({
        description: 'Nome da cidade',
        example: 'São Paulo'
    })
    @IsNotEmpty({ message: 'Nome da cidade é obrigatório' })
    @IsString({ message: 'Nome da cidade deve ser uma string' })
    @MaxLength(100, { message: 'Nome da cidade deve ter no máximo 100 caracteres' })
    nome: string;

    @ApiProperty({
        description: 'Código IBGE da cidade',
        example: '3550308',
        required: false
    })
    @IsOptional()
    @IsString({ message: 'Código IBGE deve ser uma string' })
    @Matches(/^[0-9]{7}$/, { message: 'Código IBGE deve conter exatamente 7 dígitos numéricos' })
    codigoIbge?: string;

    @ApiProperty({
        description: 'ID do estado ao qual a cidade pertence (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsNotEmpty({ message: 'ID do estado é obrigatório' })
    @IsUUID(4, { message: 'ID do estado deve ser um UUID válido' })
    estadoId: string;
}