import React, { ChangeEvent, FormEvent } from "react";
import styled from "styled-components";

// Styled Components for Modal
const Modal = styled.div.withConfig({
    shouldForwardProp: (prop) => prop !== "show", // Exclude 'show' prop
  }) <{ show: boolean }>`
    display: ${(props) => (props.show ? "flex" : "none")};
    position: fixed;
    margin-top:50px;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    justify-content: center;
    align-items: center;
    z-index: 1000;
    .modal-content {
      background: #fff;
      border-radius: 10px;
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      padding: 20px;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }
  `;

const ModalContent = styled.div`
  background: white;
  margin-top: 30px;
  padding: 2rem;
  border-radius: 8px;
  max-height: 90vh;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 95%;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const Dropdown = styled.select`
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
`;

const Button = styled.button`
  padding: 0.8rem;
  border: none;
  border-radius: 4px;
  background-color: #007bff;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

// Define the props for the JobModal component
interface ModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent) => void;
  formData: {
    job_category_id: number;
    name: string;
    description: string;
  };
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onDropChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  jobCategoryOptions: { value: number; label: string }[];
  isEditing: boolean;
}

const JobModalComp: React.FC<ModalProps> = ({
  show,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  onDropChange,
  jobCategoryOptions,
  isEditing,
}) => {
  return (
    <Modal show={show}>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <form onSubmit={onSubmit}>
          <label>
            Job Category:<span >+</span>
            <Dropdown
              name="job_category_id"
              value={formData.job_category_id}
              onChange={onDropChange}
            >
              {jobCategoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Dropdown>
          </label>
          <label>
            Name:
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={onInputChange}
            />
          </label>
          <label>
            Description:
            <Input
              type="text"
              name="description"
              value={formData.description}
              onChange={onInputChange}
            />
          </label>
          <Button type="submit">{isEditing ? "Update Job" : "Add Job"}</Button>
        </form>
      </ModalContent>
    </Modal>
  );
};

export default JobModalComp;
