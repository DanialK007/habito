import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
} from 'firebase/firestore';
import { db } from './config';
import { Habit, HabitFormData } from '@/types/habit';

const HABITS_COLLECTION = 'habits';

// Helper function to convert Firestore data to Habit
const convertToHabit = (doc: DocumentData): Habit => {
  const data = doc.data();
  return {
    id: doc.id,
    userId: data.userId,
    title: data.title,
    description: data.description,
    frequency: data.frequency,
    customDays: data.customDays,
    startDate: data.startDate?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    completedDates: data.completedDates?.map((date: Timestamp) => date.toDate()) || [],
    color: data.color,
    icon: data.icon,
    deleted: data.deleted || false,
    deletedAt: data.deletedAt?.toDate() || null,
    favorite: data.favorite || false,
  };
};

// Create a new habit
export const createHabit = async (userId: string, habitData: HabitFormData): Promise<Habit> => {
  const docRef = await addDoc(collection(db, HABITS_COLLECTION), {
    userId,
    ...habitData,
    startDate: Timestamp.fromDate(habitData.startDate),
    createdAt: Timestamp.now(),
    completedDates: [],
    deleted: false,
    favorite: false,
  });
  
  const docSnap = await getDoc(docRef);
  return convertToHabit(docSnap);
};

// Get all habits for a user (excluding deleted)
export const getUserHabits = async (userId: string): Promise<Habit[]> => {
  const q = query(
    collection(db, HABITS_COLLECTION),
    where('userId', '==', userId),
    where('deleted', '==', false)
  );
  
  const querySnapshot = await getDocs(q);
  // Sort locally by createdAt desc
  return querySnapshot.docs
    .map(convertToHabit)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Get deleted habits for trash
export const getDeletedHabits = async (userId: string): Promise<Habit[]> => {
  const q = query(
    collection(db, HABITS_COLLECTION),
    where('userId', '==', userId),
    where('deleted', '==', true)
  );
  
  const querySnapshot = await getDocs(q);
  // Sort locally by deletedAt desc
  return querySnapshot.docs
    .map(convertToHabit)
    .sort((a, b) => (b.deletedAt?.getTime() || 0) - (a.deletedAt?.getTime() || 0));
};

// Get favorite habits
export const getFavoriteHabits = async (userId: string): Promise<Habit[]> => {
  const q = query(
    collection(db, HABITS_COLLECTION),
    where('userId', '==', userId),
    where('deleted', '==', false),
    where('favorite', '==', true)
  );
  
  const querySnapshot = await getDocs(q);
  // Sort locally by createdAt desc
  return querySnapshot.docs
    .map(convertToHabit)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Toggle favorite status
export const toggleFavorite = async (habitId: string, isFavorite: boolean): Promise<void> => {
  const docRef = doc(db, HABITS_COLLECTION, habitId);
  await updateDoc(docRef, {
    favorite: isFavorite
  });
};

// Get a single habit by ID
export const getHabitById = async (habitId: string): Promise<Habit | null> => {
  const docRef = doc(db, HABITS_COLLECTION, habitId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return convertToHabit(docSnap);
  }
  return null;
};

// Update a habit
export const updateHabit = async (habitId: string, updates: Partial<HabitFormData>): Promise<void> => {
  const docRef = doc(db, HABITS_COLLECTION, habitId);
  const updateData: any = { ...updates };
  
  if (updates.startDate) {
    updateData.startDate = Timestamp.fromDate(updates.startDate);
  }
  
  await updateDoc(docRef, updateData);
};

// Toggle habit completion for a specific date
export const toggleHabitCompletion = async (habitId: string, date: Date): Promise<void> => {
  const docRef = doc(db, HABITS_COLLECTION, habitId);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    throw new Error('Habit not found');
  }
  
  const habit = convertToHabit(docSnap);
  const dateStr = date.toDateString();
  const completedDates = habit.completedDates || [];
  
  const isCompleted = completedDates.some(d => d.toDateString() === dateStr);
  
  if (isCompleted) {
    // Remove the date
    const updatedDates = completedDates.filter(d => d.toDateString() !== dateStr);
    await updateDoc(docRef, {
      completedDates: updatedDates.map(d => Timestamp.fromDate(d))
    });
  } else {
    // Add the date
    await updateDoc(docRef, {
      completedDates: [...completedDates, Timestamp.fromDate(date)]
    });
  }
};

// Soft delete a habit (move to trash)
export const softDeleteHabit = async (habitId: string): Promise<void> => {
  const docRef = doc(db, HABITS_COLLECTION, habitId);
  await updateDoc(docRef, {
    deleted: true,
    deletedAt: Timestamp.now()
  });
};

// Restore a habit from trash
export const restoreHabit = async (habitId: string): Promise<void> => {
  const docRef = doc(db, HABITS_COLLECTION, habitId);
  await updateDoc(docRef, {
    deleted: false,
    deletedAt: null
  });
};

// Permanently delete a habit
export const deleteHabit = async (habitId: string): Promise<void> => {
  const docRef = doc(db, HABITS_COLLECTION, habitId);
  await deleteDoc(docRef);
};
