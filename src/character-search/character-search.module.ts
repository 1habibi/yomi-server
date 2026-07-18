import { Module } from '@nestjs/common';
import { CharacterSearchController } from './character-search.controller';
import { CharacterSearchService } from './character-search.service';

@Module({
  controllers: [CharacterSearchController],
  providers: [CharacterSearchService],
})
export class CharacterSearchModule {}
