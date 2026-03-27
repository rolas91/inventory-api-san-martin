import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { InvFisicoEntity } from '../../domain/entities/inv-fisico.entity';
import { IInvFisicoRepository } from '../../domain/interfaces/inv-fisico-repository.interface';

@Injectable()
export class InvFisicoRepository implements IInvFisicoRepository {
  constructor(
    @InjectRepository(InvFisicoEntity)
    private readonly invFisicoRepo: Repository<InvFisicoEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async batchInsert(items: Partial<InvFisicoEntity>[]): Promise<InvFisicoEntity[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const entities = items.map((item) => this.invFisicoRepo.create(item));
      const saved = await queryRunner.manager.save(InvFisicoEntity, entities);
      await queryRunner.commitTransaction();
      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteAll(): Promise<void> {
    await this.invFisicoRepo.delete({});
  }

  findAll(): Promise<InvFisicoEntity[]> {
    return this.invFisicoRepo.find({
      relations: ['details'],
      order: { createdAt: 'DESC' },
    });
  }
}
