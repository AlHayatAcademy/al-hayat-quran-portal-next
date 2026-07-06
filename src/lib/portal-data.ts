import {
  BadgeCheck,
  Bell,
  BookOpen,
  ChartBar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Headphones,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

export const courses = [
  "Noorani Qaida",
  "Nazra Quran",
  "Hifz-ul-Quran",
  "Tajweed",
  "Duas",
  "Salah/Namaz",
  "Islamic Studies for Kids",
  "Basic Arabic",
  "Quran Translation Basics",
  "Revision/Daur",
];

export const modules = [
  { title: "Students", icon: Users, value: "184", tone: "bg-emerald-50 text-emerald-700" },
  { title: "Teachers", icon: GraduationCap, value: "26", tone: "bg-amber-50 text-amber-700" },
  { title: "Courses", icon: BookOpen, value: "10", tone: "bg-sky-50 text-sky-700" },
  { title: "Live Classes", icon: Video, value: "42", tone: "bg-violet-50 text-violet-700" },
  { title: "Attendance", icon: CheckCircle2, value: "93%", tone: "bg-lime-50 text-lime-700" },
  { title: "Homework", icon: ClipboardList, value: "71", tone: "bg-orange-50 text-orange-700" },
  { title: "Progress", icon: ChartBar, value: "88%", tone: "bg-cyan-50 text-cyan-700" },
  { title: "Payments", icon: CreditCard, value: "$8.4k", tone: "bg-rose-50 text-rose-700" },
  { title: "Support", icon: Headphones, value: "9", tone: "bg-indigo-50 text-indigo-700" },
  { title: "Announcements", icon: Bell, value: "5", tone: "bg-teal-50 text-teal-700" },
  { title: "Approvals", icon: ShieldCheck, value: "4", tone: "bg-green-50 text-green-700" },
  { title: "Quality", icon: BadgeCheck, value: "A+", tone: "bg-yellow-50 text-yellow-700" },
];

export const schedule = [
  { time: "07:00 PM", student: "Ayesha Khan", course: "Nazra Quran", teacher: "Qari Hamza", link: "Jitsi Room 12" },
  { time: "07:30 PM", student: "Omar Ahmed", course: "Noorani Qaida", teacher: "Qaria Maryam", link: "Google Meet 8" },
  { time: "08:15 PM", student: "Zain Malik", course: "Hifz-ul-Quran", teacher: "Qari Bilal", link: "Zoom Hifz 3" },
];

export const homework = [
  { title: "Memorize Surah Al-Fil", due: "Today", status: "Pending review" },
  { title: "Tajweed: heavy letters practice", due: "Tomorrow", status: "Assigned" },
  { title: "Qaida page 18 revision", due: "Friday", status: "Submitted" },
];

export const applications = [
  { name: "Qaria Sana Noor", subject: "Tajweed", experience: "7 years", status: "Interview" },
  { name: "Qari Abdul Basit", subject: "Hifz", experience: "10 years", status: "Pending" },
  { name: "Ustadah Fatima", subject: "Kids Islamic Studies", experience: "5 years", status: "Pending" },
];

export const roleCards = [
  {
    role: "Admin",
    title: "Command center",
    copy: "Approve teachers, manage courses, monitor payments, publish notices, and supervise academy quality.",
  },
  {
    role: "Teacher",
    title: "Teaching cockpit",
    copy: "See assigned students, live classes, attendance, homework review, and lesson progress in one calm workspace.",
  },
  {
    role: "Student",
    title: "Learning journey",
    copy: "Join class, see your teacher, submit homework, track attendance, and understand Quran learning progress.",
  },
  {
    role: "Parent",
    title: "Family oversight",
    copy: "Review children, schedules, payments, homework, attendance, progress, and support conversations.",
  },
];
