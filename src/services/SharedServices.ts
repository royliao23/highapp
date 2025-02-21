// navigationService.ts
import { useNavigate } from 'react-router-dom';
import { Purchase, Invoice } from '../models';// Assuming your Purchase interface is in types.ts

export const useNavigationService = () => {
  const navigate = useNavigate();

  const handleViewPurchase = (purchase: Purchase) => {
    navigate(`/purchase/${purchase.code}`, { state: { purchase } });
  };
  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/invoice/${invoice.code}`, { state: { invoice } });
  };
  return {
    handleViewPurchase,
    handleViewInvoice,
  };
};