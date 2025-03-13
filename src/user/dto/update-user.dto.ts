import { PartialType } from '@nestjs/mapped-types';
import { RegisterRequestDto } from './request/user-request.dto';

export class UpdateUserDto extends PartialType(RegisterRequestDto) {}
