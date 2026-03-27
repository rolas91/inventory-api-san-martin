import { Injectable } from '@nestjs/common';
import { InvFisicoRepository } from '../../infrastructure/repositories/inv-fisico.repository';

@Injectable()
export class DeleteAllInvFisicoUseCase {
  constructor(private readonly invFisicoRepository: InvFisicoRepository) {}

  async execute(): Promise<{ success: boolean }> {
    await this.invFisicoRepository.deleteAll();
    return { success: true };
  }
}
