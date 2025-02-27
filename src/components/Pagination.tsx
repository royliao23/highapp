import React from "react";
import { PaginationContainer, PagedButton } from "../StyledComponent";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  handlePageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ totalPages, currentPage, handlePageChange }) => {
  return (
    <PaginationContainer>
      {Array.from({ length: totalPages }, (_, index) => (
        <PagedButton
        key={index}
        onClick={() => handlePageChange(index + 1)}
        style={{ 
          margin: "0 5px", 
          backgroundColor: currentPage === index + 1 ? "#007bff" : "#ddd" 
        }}
      >
        {index + 1}
        </PagedButton>
      ))}
    </PaginationContainer>
  );
};

export default Pagination;
