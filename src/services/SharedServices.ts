// navigationService.ts
import { useNavigate } from 'react-router-dom';
import { Purchase, Invoice, Pay } from '../models';// Assuming your Purchase interface is in types.ts

export const useNavigationService = () => {
  const navigate = useNavigate();

  const handleViewPurchase = (purchase: Purchase) => {
    navigate(`/purchase/${purchase.code}`, { state: { purchase } });
  };
  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/invoice/${invoice.code}`, { state: { invoice } });
  };

  const handleViewPay = (pay: Pay) => {
    console.log(pay);
    navigate(`/pay/${pay.code}`, { state: { pay } });
  };
  return {
    handleViewPurchase,
    handleViewInvoice,
    handleViewPay
  };
};