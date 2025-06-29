import { ApiProperty } from '@nestjs/swagger';

/**
 * Entidade base que contém propriedades comuns a todas as entidades do sistema.
 * Deve ser herdada por todas as outras entidades para garantir consistência.
 * 
 * Propriedades incluídas:
 * - id: Código sequencial único gerado pelo sistema
 * - ativo: Status ativo/inativo do registro
 * - createdAt: Data de criação gerada automaticamente pelo sistema
 * - updatedAt: Data de atualização gerada automaticamente pelo sistema
 * 
 * Exemplo de uso:
 * 
 * ```typescript
 * import { BaseEntity } from '../../../common/entities/base.entity';
 * 
 * export class MinhaEntidade extends BaseEntity {
 *   @ApiProperty({
 *     description: 'Nome da entidade',
 *     example: 'Exemplo',
 *   })
 *   nome: string;
 * }
 * ```
 */
export abstract class BaseEntity {
  @ApiProperty({
    description: 'ID único do registro',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Status ativo/inativo do registro',
    example: true,
    default: true,
  })
  ativo: boolean;

  @ApiProperty({
    description: 'Data de criação do registro',
    example: '2025-06-19T10:00:00Z',
  })
  createdAt: Date | string;

  @ApiProperty({
    description: 'Data da última atualização do registro',
    example: '2025-06-19T10:00:00Z',
  })
  updatedAt: Date | string;
}
