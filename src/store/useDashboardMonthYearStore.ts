import { create } from "zustand";

interface DashboardMonthYearState {
  month: number;
  year: number;
  setMonthYear: (month: number, year: number) => void;
}

const useDashboardMonthYearStore = create<DashboardMonthYearState>((set) => ({
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  setMonthYear: (month: number, year: number) => set({ month, year }),
}));

export default useDashboardMonthYearStore;
