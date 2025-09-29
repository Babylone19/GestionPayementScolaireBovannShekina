import React from "react";
import { FaUser, FaPhone, FaEnvelope, FaGraduationCap, FaHashtag } from "react-icons/fa";
import { Student } from '../types/student';

interface StudentCardProps {
  student: Student;
}

const StudentCard: React.FC<StudentCardProps> = ({ student }) => {
  const getDomainLabel = (domain: string) => {
    const domains = {
      'GENIE_INFORMATIQUE': 'Génie Info',
      'MULTIMEDIA_MARKETING_DIGITAL': 'Multimédia',
      'CREATION_SITE_DEVELOPPEMENT_LOGICIEL': 'Développement'
    };
    return domains[domain as keyof typeof domains] || domain;
  };

  const getChannelLabel = (channel: string) => {
    const channels = {
      'TIKTOK': 'TikTok',
      'FACEBOOK': 'Facebook',
      'INSTAGRAM': 'Instagram',
      'LINKEDIN': 'LinkedIn',
      'WHATSAPP': 'WhatsApp',
      'AUTRE': 'Autre'
    };
    return channels[channel as keyof typeof channels] || channel;
  };

  return (
    <div className="bg-primary p-4 rounded-lg shadow-md border border-gray-200">
      <div className="flex items-center mb-3">
        <FaUser className="text-secondary text-xl mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          {student.lastName} {student.firstName}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-2 text-sm">
        <div className="flex items-center">
          <FaPhone className="text-secondary mr-2" />
          <span className="text-gray-600">{student.phone}</span>
        </div>
        
        <div className="flex items-center">
          <FaEnvelope className="text-secondary mr-2" />
          <span className="text-gray-600">{student.email}</span>
        </div>
        
        <div className="flex items-center">
          <FaGraduationCap className="text-secondary mr-2" />
          <span className="text-gray-600">{student.institution} • {student.studyLevel}</span>
        </div>
        
        <div className="flex items-center">
          <FaGraduationCap className="text-secondary mr-2" />
          <span className="text-gray-600">{student.profession} • {getDomainLabel(student.domain)}</span>
        </div>
        
        <div className="flex items-center">
          <FaHashtag className="text-secondary mr-2" />
          <span className="text-gray-600">Info: {getChannelLabel(student.infoChannel)}</span>
        </div>
      </div>
    </div>
  );
};

export default StudentCard;