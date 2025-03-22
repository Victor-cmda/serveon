import { Injectable, NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CreateStateDto } from '../dto/create-state.dto';
import { UpdateStateDto } from '../dto/update-state.dto';
import { DatabaseService } from '../../../common/database/database.service';
import { State } from '../entities/state.entity';

@Injectable()
export class StatesService {
    constructor(private readonly databaseService: DatabaseService) { }

    async create(createStateDto: CreateStateDto): Promise<State> {
        try {
            const existingCountry = await this.databaseService.query(
                'SELECT id FROM dbo.pais WHERE id = $1',
                [createStateDto.paisId]
            );

            if (existingCountry.rowCount === 0) {
                throw new NotFoundException(`País com ID ${createStateDto.paisId} não encontrado`);
            }

            const existingState = await this.databaseService.query(
                'SELECT id FROM dbo.estado WHERE uf = $1 AND pais_id = $2',
                [createStateDto.uf, createStateDto.paisId]
            );

            if (existingState.rowCount > 0) {
                throw new ConflictException(`Estado com UF ${createStateDto.uf} já existe para o país informado`);
            }

            const result = await this.databaseService.query(
                `INSERT INTO dbo.estado
                    (nome, uf, pais_id)
                VALUES
                    ($1, $2, $3)
                RETURNING *`,
                [
                    createStateDto.nome,
                    createStateDto.uf,
                    createStateDto.paisId
                ]
            );

            return this.mapToStateEntity(result.rows[0]);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            console.error('Erro ao criar estado:', error);
            throw new InternalServerErrorException('Erro ao criar estado');
        }
    }

    async findAll(): Promise<State[]> {
        try {
            const result = await this.databaseService.query(`
                SELECT e.*, p.nome as pais_nome
                FROM dbo.estado e
                JOIN dbo.pais p ON e.pais_id = p.id
                ORDER BY e.nome
            `);

            return result.rows.map(row => this.mapToStateEntity(row));
        } catch (error) {
            console.error('Erro ao buscar estados:', error);
            throw new InternalServerErrorException('Erro ao buscar estados');
        }
    }

    async findAllByCountry(paisId: string): Promise<State[]> {
        try {
            const existingCountry = await this.databaseService.query(
                'SELECT id FROM dbo.pais WHERE id = $1',
                [paisId]
            );

            if (existingCountry.rowCount === 0) {
                throw new NotFoundException(`País com ID ${paisId} não encontrado`);
            }

            const result = await this.databaseService.query(`
                SELECT e.*, p.nome as pais_nome
                FROM dbo.estado e
                JOIN dbo.pais p ON e.pais_id = p.id
                WHERE e.pais_id = $1
                ORDER BY e.nome
            `, [paisId]);

            return result.rows.map(row => this.mapToStateEntity(row));
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Erro ao buscar estados do país ${paisId}:`, error);
            throw new InternalServerErrorException(`Erro ao buscar estados do país ${paisId}`);
        }
    }

    async findOne(id: string): Promise<State> {
        try {
            const result = await this.databaseService.query(`
                SELECT e.*, p.nome as pais_nome
                FROM dbo.estado e
                JOIN dbo.pais p ON e.pais_id = p.id
                WHERE e.id = $1
            `, [id]);

            if (result.rowCount === 0) {
                throw new NotFoundException(`Estado com ID ${id} não encontrado`);
            }

            return this.mapToStateEntity(result.rows[0]);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Erro ao buscar estado ${id}:`, error);
            throw new InternalServerErrorException(`Erro ao buscar estado ${id}`);
        }
    }

    async findByUf(uf: string, paisId: string): Promise<State> {
        try {
            const result = await this.databaseService.query(`
                SELECT e.*, p.nome as pais_nome
                FROM dbo.estado e
                JOIN dbo.pais p ON e.pais_id = p.id
                WHERE e.uf = $1 AND e.pais_id = $2
            `, [uf, paisId]);

            if (result.rowCount === 0) {
                throw new NotFoundException(`Estado com UF ${uf} não encontrado para o país informado`);
            }

            return this.mapToStateEntity(result.rows[0]);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            console.error(`Erro ao buscar estado com UF ${uf}:`, error);
            throw new InternalServerErrorException(`Erro ao buscar estado com UF ${uf}`);
        }
    }

    async update(id: string, updateStateDto: UpdateStateDto): Promise<State> {
        try {
            const existingState = await this.databaseService.query(
                'SELECT id FROM dbo.estado WHERE id = $1',
                [id]
            );

            if (existingState.rowCount === 0) {
                throw new NotFoundException(`Estado com ID ${id} não encontrado`);
            }

            if (updateStateDto.uf && updateStateDto.paisId) {
                const existingUf = await this.databaseService.query(
                    'SELECT id FROM dbo.estado WHERE uf = $1 AND pais_id = $2 AND id != $3',
                    [updateStateDto.uf, updateStateDto.paisId, id]
                );

                if (existingUf.rowCount > 0) {
                    throw new ConflictException(`Estado com UF ${updateStateDto.uf} já existe para o país informado`);
                }
            }
            else if (updateStateDto.uf) {
                const currentState = await this.databaseService.query(
                    'SELECT pais_id FROM dbo.estado WHERE id = $1',
                    [id]
                );
                const paisId = currentState.rows[0].pais_id;

                const existingUf = await this.databaseService.query(
                    'SELECT id FROM dbo.estado WHERE uf = $1 AND pais_id = $2 AND id != $3',
                    [updateStateDto.uf, paisId, id]
                );

                if (existingUf.rowCount > 0) {
                    throw new ConflictException(`Estado com UF ${updateStateDto.uf} já existe para o país informado`);
                }
            }
            else if (updateStateDto.paisId) {
                const currentState = await this.databaseService.query(
                    'SELECT uf FROM dbo.estado WHERE id = $1',
                    [id]
                );
                const uf = currentState.rows[0].uf;

                const existingUf = await this.databaseService.query(
                    'SELECT id FROM dbo.estado WHERE uf = $1 AND pais_id = $2 AND id != $3',
                    [uf, updateStateDto.paisId, id]
                );

                if (existingUf.rowCount > 0) {
                    throw new ConflictException(`Estado com UF ${uf} já existe para o país informado`);
                }
            }

            if (updateStateDto.paisId) {
                const existingCountry = await this.databaseService.query(
                    'SELECT id FROM dbo.pais WHERE id = $1',
                    [updateStateDto.paisId]
                );

                if (existingCountry.rowCount === 0) {
                    throw new NotFoundException(`País com ID ${updateStateDto.paisId} não encontrado`);
                }
            }

            const updates: string[] = [];
            const values: any[] = [];
            let paramCounter = 1;

            if (updateStateDto.nome !== undefined) {
                updates.push(`nome = $${paramCounter++}`);
                values.push(updateStateDto.nome);
            }

            if (updateStateDto.uf !== undefined) {
                updates.push(`uf = $${paramCounter++}`);
                values.push(updateStateDto.uf);
            }

            if (updateStateDto.paisId !== undefined) {
                updates.push(`pais_id = $${paramCounter++}`);
                values.push(updateStateDto.paisId);
            }

            if (updates.length === 0) {
                return this.findOne(id);
            }

            values.push(id);

            const updateQuery = `
                UPDATE dbo.estado
                SET ${updates.join(', ')}
                WHERE id = $${paramCounter}
                RETURNING *
            `;

            const result = await this.databaseService.query(updateQuery, values);

            return this.findOne(id);
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            console.error(`Erro ao atualizar estado ${id}:`, error);
            throw new InternalServerErrorException(`Erro ao atualizar estado ${id}`);
        }
    }

    async remove(id: string): Promise<void> {
        try {
            const existingState = await this.databaseService.query(
                'SELECT id FROM dbo.estado WHERE id = $1',
                [id]
            );

            if (existingState.rowCount === 0) {
                throw new NotFoundException(`Estado com ID ${id} não encontrado`);
            }

            const hasCities = await this.databaseService.query(
                'SELECT id FROM dbo.cidade WHERE estado_id = $1 LIMIT 1',
                [id]
            );

            if (hasCities.rowCount > 0) {
                throw new ConflictException(`Não é possível excluir o estado pois ele possui cidades vinculadas`);
            }

            await this.databaseService.query(
                'DELETE FROM dbo.estado WHERE id = $1',
                [id]
            );
        } catch (error) {
            if (error instanceof NotFoundException || error instanceof ConflictException) {
                throw error;
            }
            console.error(`Erro ao remover estado ${id}:`, error);
            throw new InternalServerErrorException(`Erro ao remover estado ${id}`);
        }
    }

    private mapToStateEntity(dbRecord: any): State {
        return {
            id: dbRecord.id,
            nome: dbRecord.nome,
            uf: dbRecord.uf,
            paisId: dbRecord.pais_id,
            paisNome: dbRecord.pais_nome,
            createdAt: dbRecord.created_at,
            updatedAt: dbRecord.updated_at
        };
    }
}