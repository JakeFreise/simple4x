import { useState } from 'react';
import { CardOrder } from '../../../shared/types';

export function useCardOrderState() {
  const [cardOrders, setCardOrders] = useState<CardOrder[]>([]);

  const addCardOrder = (order: CardOrder) => {
    setCardOrders(prev => [...prev, order]);
  };

  const removeCardOrderAt = (index: number) => {
    setCardOrders(prev => prev.filter((_, i) => i !== index));
  };

  const resetCardOrders = () => {
    setCardOrders([]);
  };

  return {
    cardOrders,
    setCardOrders,
    addCardOrder,
    removeCardOrderAt,
    resetCardOrders,
  };
}
