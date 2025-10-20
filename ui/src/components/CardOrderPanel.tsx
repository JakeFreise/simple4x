// CardOrderPanel.tsx

import React from 'react';
import { CardOrder, UnitSnapshot } from '../../../shared/types';

interface Props {
  nation: string;
  ghostUnits: UnitSnapshot[];
  cardOrders: CardOrder[];
  setCardOrders: React.Dispatch<React.SetStateAction<CardOrder[]>>;
  onSubmit: () => void;
}

const CardOrderPanel: React.FC<Props> = ({
  nation,
  ghostUnits,
  cardOrders,
  setCardOrders,
  onSubmit,
}) => {
  return (
    <div className="card-order-panel">
      <h3>🃏 Card Orders</h3>
      <ul>
        {cardOrders.map((order, i) => (
          <li key={i}>
            {order.nation} • {order.cardType.toUpperCase()}
            {order.unit?.order ? ` → ${order.unit.order}` : ''}
          </li>
        ))}
      </ul>
      <button onClick={onSubmit}>Submit Card Orders</button>
    </div>
  );
};

export default CardOrderPanel;
