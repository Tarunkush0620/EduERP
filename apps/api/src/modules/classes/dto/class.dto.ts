import { IsNotEmpty, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSectionDto {
  @ApiProperty({ example: 'A' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class CreateClassDto {
  @ApiProperty({ example: 'Class 10' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'High School Standard' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [CreateSectionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSectionDto)
  sections?: CreateSectionDto[];
}

export class UpdateClassDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
