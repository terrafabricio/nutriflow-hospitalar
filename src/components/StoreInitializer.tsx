'use client';

import { useEffect, useRef } from 'react';
import { useOrderStore } from '@/store/useOrderStore';

export default function StoreInitializer() {
    const { fetchData, subscribeToChanges } = useOrderStore();
    const initialized = useRef(false);

    useEffect(() => {
        if (!initialized.current) {
            fetchData();
            const unsubscribe = subscribeToChanges();
            initialized.current = true;

            return () => {
                unsubscribe();
            };
        }
    }, [fetchData, subscribeToChanges]);

    return null;
}
