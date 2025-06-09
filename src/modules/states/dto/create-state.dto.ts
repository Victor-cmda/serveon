import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Length, Matches, MaxLength } from 'class-validator';

export class CreateStateDto {
    @ApiProperty({
        description: 'Nome do estado',
        example: 'São Paulo'
    })
    @IsNotEmpty({ message: 'Nome do estado é obrigatório' })
    @IsString({ message: 'Nome do estado deve ser uma string' })
    @MaxLength(60, { message: 'Nome do estado deve ter no máximo 60 caracteres' })
    nome: string;

    @ApiProperty({
        description: 'UF do estado (2 caracteres)',
        example: 'SP'
    })
    @IsNotEmpty({ message: 'UF é obrigatória' })
    @IsString({ message: 'UF deve ser uma string' })
    @Length(2, 2, { message: 'UF deve ter exatamente 2 caracteres' })
    @Matches(/^[A-Z]+$/, { message: 'UF deve conter apenas letras maiúsculas' })
    uf: string;

    @ApiProperty({
        description: 'ID do país ao qual o estado pertence',
        example: 1
    })
    @IsNotEmpty({ message: 'ID do país é obrigatório' })
    @IsNumber({}, { message: 'ID do país deve ser um número válido' })
    paisId: number;
}