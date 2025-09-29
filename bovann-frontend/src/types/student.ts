export type Institution = 'SHEKINA' | 'BOVANN GROUP SAS';
export type StudyLevel = 'BEPC' | 'PROBATOIRE' | 'BAC' | 'LICENCE' | 'MASTER' | 'DOCTORAT';
export type Profession = 'Etudiant' | 'Travailleur' | 'Autre';
export type StudyDomain = 'GENIE_INFORMATIQUE' | 'MULTIMEDIA_MARKETING_DIGITAL' | 'CREATION_SITE_DEVELOPPEMENT_LOGICIEL';
export type InfoChannel = 'TIKTOK' | 'FACEBOOK' | 'INSTAGRAM' | 'LINKEDIN' | 'WHATSAPP' | 'AUTRE';

export interface Student {
  id: string;
  lastName: string;
  firstName: string;
  institution: string; // Changé en string
  studyLevel: string;  // Changé en string
  profession: string;  // Changé en string
  phone: string;
  email: string;
  photo?: string;
  domain: string;      // Changé en string
  infoChannel: string; // Changé en string
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateStudentDto {
  lastName: string;
  firstName: string;
  institution: string; // Changé en string
  studyLevel: string;  // Changé en string
  profession: string;  // Changé en string
  phone: string;
  email: string;
  photo?: string;
  domain: string;      // Changé en string
  infoChannel: string; // Changé en string
}