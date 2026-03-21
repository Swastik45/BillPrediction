export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  password: string;
  created_at: string;
}

export interface HistoryItem {
  id: number;
  user_id: number | null;
  units: number;
  predicted_bill: number;
  timestamp: string;
}

let nextUserId = 1;
let nextHistoryId = 1;

export const users: User[] = [];
export const history: HistoryItem[] = [];

export function createUser({ username, email, password, full_name }: Omit<User, 'id' | 'created_at'>) {
  const now = new Date().toISOString();
  const user: User = {
    id: nextUserId++,
    username,
    email,
    full_name,
    password,
    created_at: now,
  };
  users.push(user);
  return user;
}

export function findUserByUsername(username: string) {
  return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function createHistoryItem({ user_id, units, predicted_bill }: Omit<HistoryItem, 'id' | 'timestamp'>) {
  const item: HistoryItem = {
    id: nextHistoryId++,
    user_id,
    units,
    predicted_bill,
    timestamp: new Date().toISOString(),
  };
  history.push(item);
  return item;
}

export function getHistory(user_id?: number | null) {
  if (user_id == null) return history.slice().sort((a, b) => b.id - a.id);
  return history
    .filter((h) => h.user_id === user_id)
    .sort((a, b) => b.id - a.id);
}

export function deleteHistoryItem(id: number) {
  const idx = history.findIndex((item) => item.id === id);
  if (idx < 0) return false;
  history.splice(idx, 1);
  return true;
}

export function clearHistory(user_id?: number | null) {
  if (user_id == null) {
    history.splice(0, history.length);
    return;
  }
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].user_id === user_id) history.splice(i, 1);
  }
}

export function predictBill(units: number) {
  const baseRate = 0.22; // $ per kWh
  const seasonalAdjust = Math.sin(units / 150) * 0.05;
  const variableRate = baseRate + seasonalAdjust;
  const noise = (Math.random() - 0.5) * 0.02;
  const predicted = units * (variableRate + noise);
  return Math.max(0, Number(predicted.toFixed(2)));
}
