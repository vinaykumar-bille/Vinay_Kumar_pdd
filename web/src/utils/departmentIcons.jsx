import React from 'react';
import { 
  Activity, 
  Bone, 
  Ear, 
  Brain, 
  Sparkles, 
  Baby, 
  Stethoscope,
  Heart,
  Eye,
  FileText
} from 'lucide-react';

export const getDepartmentIcon = (dept, sizeClass = "w-6 h-6") => {
  switch (dept?.toLowerCase()) {
    case 'cardiology':
      return <Activity className={`${sizeClass} text-red-500`} />;
    case 'orthopedics':
      return <Bone className={`${sizeClass} text-amber-600`} />;
    case 'ent':
      return <Ear className={`${sizeClass} text-teal-600`} />;
    case 'neurology':
      return <Brain className={`${sizeClass} text-indigo-600`} />;
    case 'dermatology':
      return <Sparkles className={`${sizeClass} text-pink-500`} />;
    case 'pediatrics':
      return <Baby className={`${sizeClass} text-purple-500`} />;
    case 'general medicine':
    case 'general':
      return <Stethoscope className={`${sizeClass} text-blue-500`} />;
    default:
      return <Stethoscope className={`${sizeClass} text-slate-500`} />;
  }
};

export const departmentColors = {
  cardiology: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
  orthopedics: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  ent: "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100",
  neurology: "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
  dermatology: "bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100",
  pediatrics: "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
  generalmedicine: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
};

export const getDepartmentColor = (dept) => {
  const clean = dept?.replace(/\s+/g, '').toLowerCase() || 'general';
  return departmentColors[clean] || "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";
};
