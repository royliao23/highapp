import React, { ChangeEvent } from "react";
import styled from "styled-components";

const Input = styled.input`
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  max-width: 300px;
  margin:0.5rem;
  height:30px;
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
