import { Firestore, doc, setDoc } from "firebase/firestore";
import { mockStations } from "./data";

export async function seedStations(firestore: Firestore) {
    console.log("Starting seed process...");
    try {
        const promises = mockStations.map((station) => {
            const stationRef = doc(firestore, "charging_stations", station.id);
            // Remove the id from the document data as it is the key
            const { id, ...data } = station;
            return setDoc(stationRef, { ...data, id }, { merge: true });
        });

        await Promise.all(promises);
        console.log("Successfully seeded stations!");
        return { success: true };
    } catch (error) {
        console.error("Error seeding stations:", error);
        return { success: false, error };
    }
}
