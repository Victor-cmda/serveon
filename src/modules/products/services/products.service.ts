import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se produto com mesmo código já existe (se fornecido)
        if (createProductDto.codigo) {
          const existingProduct = await client.query(
            'SELECT id FROM dbo.produto WHERE codigo = $1',
            [createProductDto.codigo],
          );

          if (existingProduct.rowCount > 0) {
            throw new ConflictException(
              `Produto com código ${createProductDto.codigo} já existe`,
            );
          }
        }

        // Inserir o novo produto
        const result = await client.query(
          `INSERT INTO dbo.produto
            (produto, unidade_medida_id, codigo_barras, referencia, marca_id, categoria_id,
            quantidade_minima, valor_compra, valor_venda, quantidade, percentual_lucro,
            descricao, observacoes, situacao, usuario_criacao, codigo, ncm, cest, unidade,
            valor_unitario, peso_liquido, peso_bruto, gtin, gtin_tributavel, ativo)
          VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
          RETURNING *`,
          [
            createProductDto.produto,
            createProductDto.unidadeMedidaId || null,
            createProductDto.codigoBarras || null,
            createProductDto.referencia || null,
            createProductDto.marcaId || null,
            createProductDto.categoriaId || null,
            createProductDto.quantidadeMinima || 0,
            createProductDto.valorCompra || null,
            createProductDto.valorVenda || null,
            createProductDto.quantidade || 0,
            createProductDto.percentualLucro || null,
            createProductDto.descricao || null,
            createProductDto.observacoes || null,
            createProductDto.situacao || null,
            createProductDto.usuarioCriacao || null,
            createProductDto.codigo || null,
            createProductDto.ncm || null,
            createProductDto.cest || null,
            createProductDto.unidade || null,
            createProductDto.valorUnitario || null,
            createProductDto.pesoLiquido || null,
            createProductDto.pesoBruto || null,
            createProductDto.gtin || null,
            createProductDto.gtinTributavel || null,
            createProductDto.ativo !== undefined
              ? createProductDto.ativo
              : true,
          ],
        );

        await client.query('COMMIT');

        const createdProduct = result.rows[0];
        return this.mapDatabaseToEntity(createdProduct);
      } catch (error) {
        await client.query('ROLLBACK');

        if (error instanceof ConflictException) {
          throw error;
        }

        console.error('Erro ao criar produto:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao criar produto',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async findAll(): Promise<Product[]> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(`
          SELECT 
            p.*,
            um.sigla as unidade_medida_nome,
            m.nome as marca_nome,
            c.nome as categoria_nome
          FROM dbo.produto p
          LEFT JOIN dbo.unidade_medida um ON p.unidade_medida_id = um.id
          LEFT JOIN dbo.marca m ON p.marca_id = m.id
          LEFT JOIN dbo.categoria c ON p.categoria_id = c.id
          ORDER BY p.produto ASC
        `);

        return result.rows.map((row) => this.mapDatabaseToEntity(row));
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao buscar produtos',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async findOne(id: number): Promise<Product> {
    try {
      const client = await this.databaseService.getClient();

      try {
        const result = await client.query(
          `
          SELECT 
            p.*,
            um.sigla as unidade_medida_nome,
            m.nome as marca_nome,
            c.nome as categoria_nome
          FROM dbo.produto p
          LEFT JOIN dbo.unidade_medida um ON p.unidade_medida_id = um.id
          LEFT JOIN dbo.marca m ON p.marca_id = m.id
          LEFT JOIN dbo.categoria c ON p.categoria_id = c.id
          WHERE p.id = $1
        `,
          [id],
        );

        if (result.rowCount === 0) {
          throw new NotFoundException(`Produto com ID ${id} não encontrado`);
        }

        return this.mapDatabaseToEntity(result.rows[0]);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }

        console.error('Erro ao buscar produto:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao buscar produto',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se o produto existe
        const existingProduct = await client.query(
          'SELECT id FROM dbo.produto WHERE id = $1',
          [id],
        );

        if (existingProduct.rowCount === 0) {
          throw new NotFoundException(`Produto com ID ${id} não encontrado`);
        }

        // Verificar se código não conflita com outro produto (se fornecido)
        if (updateProductDto.codigo) {
          const codeConflict = await client.query(
            'SELECT id FROM dbo.produto WHERE codigo = $1 AND id != $2',
            [updateProductDto.codigo, id],
          );

          if (codeConflict.rowCount > 0) {
            throw new ConflictException(
              `Código ${updateProductDto.codigo} já está sendo usado por outro produto`,
            );
          }
        } // Construir query de atualização dinamicamente
        const updateFields: string[] = [];
        const updateValues: any[] = [];
        let paramCounter = 1;

        const fieldMappings = {
          produto: 'produto',
          unidadeMedidaId: 'unidade_medida_id',
          codigoBarras: 'codigo_barras',
          referencia: 'referencia',
          marcaId: 'marca_id',
          categoriaId: 'categoria_id',
          quantidadeMinima: 'quantidade_minima',
          valorCompra: 'valor_compra',
          valorVenda: 'valor_venda',
          quantidade: 'quantidade',
          percentualLucro: 'percentual_lucro',
          descricao: 'descricao',
          observacoes: 'observacoes',
          situacao: 'situacao',
          usuarioAtualizacao: 'usuario_atualizacao',
          codigo: 'codigo',
          ncm: 'ncm',
          cest: 'cest',
          unidade: 'unidade',
          valorUnitario: 'valor_unitario',
          pesoLiquido: 'peso_liquido',
          pesoBruto: 'peso_bruto',
          gtin: 'gtin',
          gtinTributavel: 'gtin_tributavel',
          ativo: 'ativo',
        };

        for (const [dtoField, dbField] of Object.entries(fieldMappings)) {
          if (updateProductDto.hasOwnProperty(dtoField)) {
            updateFields.push(`${dbField} = $${paramCounter}`);
            updateValues.push((updateProductDto as any)[dtoField]);
            paramCounter++;
          }
        }

        // Sempre atualizar data_alteracao
        updateFields.push(`data_alteracao = CURRENT_DATE`);

        if (updateFields.length === 1) {
          // Apenas data_alteracao
          throw new BadRequestException(
            'Nenhum campo válido fornecido para atualização',
          );
        }

        updateValues.push(id); // Para o WHERE

        const updateQuery = `
          UPDATE dbo.produto 
          SET ${updateFields.join(', ')}
          WHERE id = $${paramCounter}
          RETURNING *
        `;

        const result = await client.query(updateQuery, updateValues);

        await client.query('COMMIT');

        const updatedProduct = result.rows[0];
        return this.mapDatabaseToEntity(updatedProduct);
      } catch (error) {
        await client.query('ROLLBACK');

        if (
          error instanceof NotFoundException ||
          error instanceof ConflictException ||
          error instanceof BadRequestException
        ) {
          throw error;
        }

        console.error('Erro ao atualizar produto:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao atualizar produto',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  async remove(id: number): Promise<void> {
    try {
      const client = await this.databaseService.getClient();

      try {
        await client.query('BEGIN');

        // Verificar se o produto existe
        const existingProduct = await client.query(
          'SELECT id FROM dbo.produto WHERE id = $1',
          [id],
        );

        if (existingProduct.rowCount === 0) {
          throw new NotFoundException(`Produto com ID ${id} não encontrado`);
        }

        // TODO: Verificar se produto está sendo usado em NFe antes de excluir
        // Por enquanto, fazemos soft delete (marcar como inativo)
        await client.query(
          'UPDATE dbo.produto SET ativo = false WHERE id = $1',
          [id],
        );

        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');

        if (error instanceof NotFoundException) {
          throw error;
        }

        console.error('Erro ao remover produto:', error);
        throw new InternalServerErrorException(
          'Erro interno do servidor ao remover produto',
        );
      } finally {
        client.release();
      }
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }

      console.error('Erro ao obter conexão com banco:', error);
      throw new InternalServerErrorException(
        'Erro de conexão com banco de dados',
      );
    }
  }

  private mapDatabaseToEntity(row: any): Product {
    return {
      id: row.id,
      produto: row.produto,
      unidadeMedidaId: row.unidade_medida_id,
      unidadeMedidaNome: row.unidade_medida_nome,
      codigoBarras: row.codigo_barras,
      referencia: row.referencia,
      marcaId: row.marca_id,
      marcaNome: row.marca_nome,
      categoriaId: row.categoria_id,
      categoriaNome: row.categoria_nome,
      quantidadeMinima: row.quantidade_minima || 0,
      valorCompra: row.valor_compra ? parseFloat(row.valor_compra) : undefined,
      valorVenda: row.valor_venda ? parseFloat(row.valor_venda) : undefined,
      quantidade: row.quantidade || 0,
      percentualLucro: row.percentual_lucro
        ? parseFloat(row.percentual_lucro)
        : undefined,
      descricao: row.descricao,
      observacoes: row.observacoes,
      situacao: row.situacao ? row.situacao.toISOString().split('T')[0] : null,
      dataCriacao: row.data_criacao
        ? row.data_criacao.toISOString().split('T')[0]
        : null,
      dataAlteracao: row.data_alteracao
        ? row.data_alteracao.toISOString().split('T')[0]
        : null,
      usuarioCriacao: row.usuario_criacao,
      usuarioAtualizacao: row.usuario_atualizacao,
      codigo: row.codigo,
      ncm: row.ncm,
      cest: row.cest,
      unidade: row.unidade,
      valorUnitario: row.valor_unitario
        ? parseFloat(row.valor_unitario)
        : undefined,
      pesoLiquido: row.peso_liquido ? parseFloat(row.peso_liquido) : undefined,
      pesoBruto: row.peso_bruto ? parseFloat(row.peso_bruto) : undefined,
      gtin: row.gtin,
      gtinTributavel: row.gtin_tributavel,
      ativo: row.ativo,
      createdAt: row.created_at?.toISOString(),
      updatedAt: row.updated_at?.toISOString(),
    };
  }
}
