import React, { ChangeEvent, FormEvent, useState } from "react";
import styled from "styled-components";
import GeneralModal from "./Modal"; // Import the reusable GeneralModal component

// Styled Components for Modal
const Modal = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "show", // Exclude 'show' prop
})<{ show: boolean }>`
  display: ${(props) => (props.show ? "flex" : "none")};
  position: fixed;
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
  margin-top: 50px;
  padding: 2rem;
  border-radius: 8px;
  max-height: 90vh;
  width: 90%;
  max-width: 500px;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  overflow-y: auto; /* Enable scrolling for modal content */
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
  width: 90%;
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
  onAddCategory: (newCategory: { value: number; label: string }) => void; // Callback to add a new category
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
  onAddCategory,
}) => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false); // State for nested modal
  const [newCategoryName, setNewCategoryName] = useState(""); // State for new category name

  // Handle opening the nested modal
  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  // Handle closing the nested modal
  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setNewCategoryName(""); // Reset the input field
  };

  // Handle adding a new category
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        value: jobCategoryOptions.length + 1, // Generate a new ID (replace with actual API call if needed)
        label: newCategoryName,
      };
      onAddCategory(newCategory); // Pass the new category to the parent component
      handleCloseCategoryModal();
    }
  };

  return (
    <>
      <Modal show={show}>
        <ModalContent>
          <CloseButton onClick={onClose}>&times;</CloseButton>
          <form onSubmit={onSubmit}>
            
            <label>
              Job Category:
              
              <Dropdown
                name="job_category_id"
                value={formData.job_category_id}
                onChange={onDropChange}
              >
                
                <option value="">Please Select</option>
                {jobCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                  
                ))}
              </Dropdown>
              <span onClick={handleOpenCategoryModal} className="addModal"> +</span>
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

      {/* Nested Modal for Adding a New Category */}
      <GeneralModal show={isCategoryModalOpen} onClose={handleCloseCategoryModal}>
        <h3>Add New Category</h3>
        <Input
          type="text"
          placeholder="Enter category name"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
        />
        <Button onClick={handleAddCategory}>Add Category</Button>
      </GeneralModal>
    </>
  );
};

export default JobModalComp;