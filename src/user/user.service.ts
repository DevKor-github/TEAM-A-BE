import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from 'src/entities/user.entity';
import { hash } from 'bcrypt';
import { checkPossibleResponseDto } from './dto/check-possible-response.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    const user = await this.userRepository.findUserByEmail(createUserDto.email);
    if (user) {
      throw new BadRequestException('이미 해당 이메일이 존재합니다.');
    }

    const hashedPassword = await hash(createUserDto.password, 10);

    return await this.userRepository.createUser({
      ...createUserDto,
      password: hashedPassword,
    });
  }

  async checkUsernamePossible(
    username: string,
  ): Promise<checkPossibleResponseDto> {
    const user = await this.userRepository.findUserByUsername(username);
    if (!user) {
      return new checkPossibleResponseDto(true);
    } else {
      return new checkPossibleResponseDto(false);
    }
  }

  async checkEmailPossible(email: string): Promise<checkPossibleResponseDto> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      return new checkPossibleResponseDto(true);
    } else {
      return new checkPossibleResponseDto(false);
    }
  }
}
