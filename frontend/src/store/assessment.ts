import { create } from 'zustand';
import type { Assignment, Assessment, CreateAssignmentInput } from '@/types';

interface AssessmentStore {
  assignments: Assignment[];
  currentAssignment: Assignment | null;
  currentAssessment: Assessment | null;
  generationProgress: number;
  generationStatus: string;
  isGenerating: boolean;

  setAssignments: (assignments: Assignment[]) => void;
  addAssignment: (assignment: Assignment) => void;
  setCurrentAssignment: (assignment: Assignment | null) => void;
  setCurrentAssessment: (assessment: Assessment | null) => void;
  setGenerationProgress: (progress: number) => void;
  setGenerationStatus: (status: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  updateAssignmentStatus: (id: string, status: string) => void;
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  assignments: [],
  currentAssignment: null,
  currentAssessment: null,
  generationProgress: 0,
  generationStatus: '',
  isGenerating: false,

  setAssignments: (assignments) => set({ assignments }),
  addAssignment: (assignment) =>
    set((state) => ({ assignments: [assignment, ...state.assignments] })),
  setCurrentAssignment: (currentAssignment) => set({ currentAssignment }),
  setCurrentAssessment: (currentAssessment) => set({ currentAssessment }),
  setGenerationProgress: (generationProgress) => set({ generationProgress }),
  setGenerationStatus: (generationStatus) => set({ generationStatus }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  updateAssignmentStatus: (id, status) =>
    set((state) => ({
      assignments: state.assignments.map((a) =>
        a._id === id ? { ...a, status: status as any } : a
      ),
      currentAssignment:
        state.currentAssignment?._id === id
          ? { ...state.currentAssignment, status: status as any }
          : state.currentAssignment,
    })),
}));
