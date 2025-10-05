import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
      >
        Précédent
      </button>
      
      <span className="px-3 py-2 text-gray-600">
        Page {currentPage} sur {totalPages}
      </span>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded border bg-white disabled:opacity-50 hover:bg-gray-50"
      >
        Suivant
      </button>
    </div>
  );
};

export default Pagination;