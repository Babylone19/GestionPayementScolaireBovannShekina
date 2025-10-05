export interface Institution {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInstitutionDto {
  name: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  programIds?: string[];
}

export interface UpdateInstitutionDto extends Partial<CreateInstitutionDto> {}

export interface InstitutionFormData extends CreateInstitutionDto {
  programIds: string[];
}