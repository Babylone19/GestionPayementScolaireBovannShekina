import { Institution } from './institution';

export interface Program {
  id: string;
  name: string;
  description?: string;
  duration?: string;
  price?: number;
  institutionId: string;
  institution?: Institution;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProgramDto {
  name: string;
  description?: string;
  duration?: string;
  price?: number;
  institutionId: string;
}

export interface UpdateProgramDto extends Partial<CreateProgramDto> {}

export interface ProgramFormData {
  name: string;
  description?: string;
  duration?: string;
  price?: string;
  institutionId: string;
}