import { IsString, IsUUID, IsEnum, IsNumber, Min, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeeStructureDto {
  @ApiProperty()
  @IsUUID()
  classId: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ enum: ['monthly', 'quarterly', 'annual'] })
  @IsEnum(['monthly', 'quarterly', 'annual'])
  frequency: 'monthly' | 'quarterly' | 'annual';
}

export class GenerateFeeRecordsDto {
  @ApiProperty()
  @IsUUID()
  classId: string;

  @ApiProperty()
  @IsUUID()
  feeStructureId: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;
}

export class RecordPaymentDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty()
  @IsString()
  paymentMethod: string; // e.g., 'cash', 'card', 'bank_transfer'

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  transactionId?: string;
}
