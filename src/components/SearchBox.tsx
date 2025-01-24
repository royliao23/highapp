import React, { ChangeEvent } from "react";
import styled from "styled-components";

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 300px;
`;

interface SearchBoxProps {
  searchTerm: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ searchTerm, onSearchChange }) => {
  return (
    <Input
      type="text"
      placeholder="Search"
      value={searchTerm}
      onChange={onSearchChange}
    />
  );
};

export default SearchBox;
