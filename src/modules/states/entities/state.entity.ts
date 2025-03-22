import { ApiProperty } from '@nestjs/swagger';

export class State {
    @ApiProperty({
        description: 'ID único do estado (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    id: string;

    @ApiProperty({
        description: 'Nome do estado',
        example: 'São Paulo'
    })
    nome: string;

    @ApiProperty({
        description: 'UF do estado',
        example: 'SP'
    })
    uf: string;

    @ApiProperty({
        description: 'ID do país ao qual o estado pertence (UUID)',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    paisId: string;

    @ApiProperty({
        description: 'Nome do país ao qual o estado pertence',
        example: 'Brasil'
    })
    paisNome?: string;

    @ApiProperty({
        description: 'Data de criação do registro',
        example: '2023-01-15T12:00:00.000Z'
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Data da última atualização do registro',
        example: '2023-01-15T12:00:00.000Z'
    })
    updatedAt: Date;
}