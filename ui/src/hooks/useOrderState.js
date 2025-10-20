import { useState } from 'react';

export function useOrderState() {
  const [orders, setOrders] = useState([]);

  function setOrder(text) {
    const match = text.match(/^([A-Z]+(?:_[A-Z]+)?): (A|F) (\w+)/);
    if (!match) return;

    const [_, nation, type, region] = match;
    const prefix = `${nation}: ${type} ${region}`;

    setOrders(prev => {
      const idx = prev.findIndex(o => o.startsWith(prefix));
      if (idx >= 0) {
        const newOrders = [...prev];
        newOrders[idx] = text;
        return newOrders;
      } else {
        return [...prev, text];
      }
    });
  }

  function resetOrders(units) {
    setOrders([]);
    const holdOrders = units.map(({ nation, type, region }) =>
      `${nation}: ${type} ${region} holds`
    );
    setOrders(holdOrders); // ← replaces all existing orders
  }

  function resetRetreats(units) {
    setOrders([]);
    const retreatOrders = units
      .filter(u => u.status === 'dislodged' && u.dislodged_by) // dislodged units only
      .map(({ nation, type, region }) =>
        `${nation}: ${type} ${region} disbands`
      );

    setOrders(retreatOrders);
  }

  return {
    orders,
    setOrder,
    resetOrders,
    resetRetreats,
  };
}
