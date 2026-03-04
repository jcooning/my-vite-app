import { create } from 'zustand'

export const useReservationStore = create((set) => ({
    reservations: [
        {
            id: 1,
            name: '홍길동 & 홍길순',
            date: '2026-02-14',
            time: '13:00',
            location: '강남 루나미엘레',
            products: ['Basic Album'],
            totalPrice: 496000
        }
    ],
    selectedDate: new Date(),
    setSelectedDate: (date) => set({ selectedDate: date }),
    addReservation: (reservation) => set((state) => ({
        reservations: [...state.reservations, { ...reservation, id: Date.now() }]
    })),
    removeReservation: (id) => set((state) => ({
        reservations: state.reservations.filter(r => r.id !== id)
    })),
    updateReservation: (id, updatedReservation) => set((state) => ({
        reservations: state.reservations.map(r => r.id === id ? { ...updatedReservation, id } : r)
    })),
    setReservations: (reservations) => set({ reservations })
}))
