import { IsString, IsOptional, IsUUID, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty({ enum: ['all', 'teachers', 'students', 'specific_class'] })
  @IsEnum(['all', 'teachers', 'students', 'specific_class'])
  targetAudience: 'all' | 'teachers' | 'students' | 'specific_class';

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  targetClassIds?: string[];
}

export class SendMessageDto {
  @ApiProperty()
  @IsUUID()
  receiverId: string;

  @ApiProperty()
  @IsString()
  subject: string;

  @ApiProperty()
  @IsString()
  body: string;
}
