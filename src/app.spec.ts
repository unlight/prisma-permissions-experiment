import { HttpException } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

describe('App', () => {
  let testingModule: TestingModule;

  beforeAll(async () => {
    testingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  describe('PrismaService', () => {
    it('smoke test', () => {
      const service = testingModule.get(PrismaService);
      expect(service).toBeTruthy();
    });
  });

  describe('Nest errors', () => {
    it('inheritance', () => {
      const error = new BadRequestException();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(HttpException);
      expect(error).toBeInstanceOf(BadRequestException);
    });
  });
});
