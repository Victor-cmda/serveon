import { useParams } from 'react-router-dom';
import PurchasePrintView from './PurchasePrintView';

const PurchasePrintRoute = () => {
  const { id } = useParams<{ id: string }>();
  const purchaseId = parseInt(id || '0', 10);

  return <PurchasePrintView purchaseId={purchaseId} />;
};

export default PurchasePrintRoute;
