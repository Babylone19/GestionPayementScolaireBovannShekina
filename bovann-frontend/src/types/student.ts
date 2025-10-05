export type StudyLevel = 'BEPC' | 'PROBATOIRE' | 'BAC' | 'LICENCE' | 'MASTER' | 'DOCTORAT' | string;
export type Profession = 'Etudiant' | 'Travailleur' | 'Autre' | string;
export type StudyDomain = 'GENIE_INFORMATIQUE' | 'MULTIMEDIA_MARKETING_DIGITAL' | 'CREATION_SITE_DEVELOPPEMENT_LOGICIEL' | string;
export type InfoChannel = 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'WHATSAPP' | 'AUTRE' | string;
export type Nationality = 'Togolaise' | 'Ivoirienne' | 'Française' | 'Malienne' | 'Burkinabé' | 'Guinéenne' | 'Sénégalaise' | 'Autre' | string;

export interface Student {
  id: string;
  lastName: string;
  firstName: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality: Nationality;
  institutionId: string;
  institution: string;
  programId?: string;
  program?: any;
  studyLevel: StudyLevel;
  profession: Profession;
  phone: string;
  email: string;
  photo?: string;
  domain: StudyDomain;
  infoChannel: InfoChannel;
  address?: string;
  emergencyContact?: string;
  createdAt?: string;
  updatedAt?: string;
  payments?: any[];
  accessCards?: any[];
}

export interface CreateStudentDto {
  lastName: string;
  firstName: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  nationality?: Nationality;
  institutionId: string;
  programId?: string;
  studyLevel?: StudyLevel;
  profession?: Profession;
  phone: string;
  email: string;
  photo?: string;
  domain?: StudyDomain;
  infoChannel?: InfoChannel;
  address?: string;
  emergencyContact?: string;
}

export interface UpdateStudentDto extends Partial<CreateStudentDto> {}

export interface StudentFilters {
  search?: string;
  institutionId?: string;
  programId?: string;
  studyLevel?: StudyLevel;
  domain?: StudyDomain;
}

export type StudentsResponse = Student[];