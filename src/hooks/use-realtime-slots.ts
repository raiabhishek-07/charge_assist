import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { useFirebase } from '@/firebase';

export function useRealtimeSlots() {
    const { database } = useFirebase();
    const [slots, setSlots] = useState<{ [key: string]: boolean }>({
        slot1: false,
        slot2: false,
    });

    useEffect(() => {
        if (!database) return;

        // Listen to slot1IR
        const slot1Ref = ref(database, 'slot1IR');
        const unsubscribe1 = onValue(slot1Ref, (snapshot) => {
            setSlots((prev) => ({ ...prev, slot1: snapshot.val() === true }));
        });

        // Listen to slot2IR
        const slot2Ref = ref(database, 'slot2IR');
        const unsubscribe2 = onValue(slot2Ref, (snapshot) => {
            setSlots((prev) => ({ ...prev, slot2: snapshot.val() === true }));
        });

        return () => {
            unsubscribe1();
            unsubscribe2();
        };
    }, [database]);

    return slots;
}
