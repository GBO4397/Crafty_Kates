import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft, Printer, Trash2, ArrowUp, CheckCircle2,
  AlertTriangle, Clock, Megaphone, CalendarCheck, ClipboardList,
  Shield, Loader2
} from 'lucide-react';
import { LOGO } from '@/data/imageConfig';
import AdminLoginGate, { checkAdminAuth } from '@/components/admin/AdminLoginGate';


interface Task {
  id: string;
  text: string;
}

interface ChecklistSection {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ElementType;
  tasks: Task[];
}

const STORAGE_KEY = 'crafty-kates-checklist-v1';

const checklistData: ChecklistSection[] = [
  {
    id: 'immediate',
    title: 'Do Immediately',
    badge: 'Highest Priority',
    badgeColor: 'bg-red-50 border-red-200 text-red-700',
    icon: AlertTriangle,
    tasks: [
      { id: 'task1', text: 'County permit' },
      { id: 'task2', text: 'Make map per county instructions' },
      { id: 'task3', text: 'Fill out county paperwork' },
      { id: 'task4', text: 'Contact CHP for a letter' },
      { id: 'task5', text: 'Provide proof of insurance to the county' },
      { id: 'task6', text: 'Complete state permit after county approval and pay fee' },
      { id: 'task7', text: 'Coordinate with county roads for roadblocks and signage' },
      { id: 'task8', text: 'Coordinate with the rescue and shelter' },
      { id: 'task9', text: 'Confirm insurance' },
      { id: 'task10', text: 'Reserve porta-potties, tables, pop-ups, and chairs' },
      { id: 'task11', text: 'Update website for the current Classic Burger show' },
      { id: 'task12', text: 'Confirm date with Classic Burgers' },
    ],
  },
  {
    id: 'sponsors',
    title: 'Sponsors & Fundraising',
    badge: 'High Priority',
    badgeColor: 'bg-orange-50 border-orange-200 text-orange-700',
    icon: Shield,
    tasks: [
      { id: 'task13', text: 'Reach out to returning sponsors for commitment' },
      { id: 'task14', text: 'Create sponsor packet with levels and benefits' },
      { id: 'task15', text: 'Contact new potential sponsors' },
      { id: 'task16', text: 'Collect sponsor logos for banners and website' },
      { id: 'task17', text: 'Set up online payment for sponsorships' },
      { id: 'task18', text: 'Order sponsor banners and signage' },
      { id: 'task19', text: 'Secure raffle items and donation prizes' },
      { id: 'task20', text: 'Send thank-you letters to confirmed sponsors' },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics & Setup',
    badge: 'Important',
    badgeColor: 'bg-blue-50 border-blue-200 text-blue-700',
    icon: ClipboardList,
    tasks: [
      { id: 'task21', text: 'Create event site layout and parking plan' },
      { id: 'task22', text: 'Arrange sound system and PA equipment' },
      { id: 'task23', text: 'Confirm food vendors and food trucks' },
      { id: 'task24', text: 'Organize volunteer crew and assign roles' },
      { id: 'task25', text: 'Set up registration table supplies (forms, pens, cash box)' },
      { id: 'task26', text: 'Order trophies and award plaques' },
      { id: 'task27', text: 'Arrange trash and recycling bins' },
      { id: 'task28', text: 'Confirm power supply and generator if needed' },
      { id: 'task29', text: 'Prepare first aid kit and emergency plan' },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing & Promotion',
    badge: 'Ongoing',
    badgeColor: 'bg-purple-50 border-purple-200 text-purple-700',
    icon: Megaphone,
    tasks: [
      { id: 'task30', text: 'Design and print event flyers' },
      { id: 'task31', text: 'Post event on Facebook, Instagram, and YouTube' },
      { id: 'task32', text: 'Contact local newspaper and radio for coverage' },
      { id: 'task33', text: 'Distribute flyers to local businesses' },
      { id: 'task34', text: 'Create social media countdown posts' },
      { id: 'task35', text: 'Update car show entry page on website' },
      { id: 'task36', text: 'Send email blast to previous participants' },
      { id: 'task37', text: 'Post on car club forums and groups' },
    ],
  },
  {
    id: 'dayof',
    title: 'Day-of Event',
    badge: 'Event Day',
    badgeColor: 'bg-green-50 border-green-200 text-green-700',
    icon: CalendarCheck,
    tasks: [
      { id: 'task38', text: 'Arrive early for setup (minimum 2 hours before)' },
      { id: 'task39', text: 'Set up registration and check-in area' },
      { id: 'task40', text: 'Place directional signs and parking cones' },
      { id: 'task41', text: 'Test sound system and microphone' },
      { id: 'task42', text: 'Brief volunteers on their roles' },
      { id: 'task43', text: 'Set up sponsor banners and displays' },
      { id: 'task44', text: 'Prepare raffle table and ticket sales' },
      { id: 'task45', text: 'Coordinate trophy/award ceremony timing' },
      { id: 'task46', text: 'Take photos and videos for social media' },
      { id: 'task47', text: 'Announce sponsors and thank supporters' },
    ],
  },
  {
    id: 'postevent',
    title: 'Post-Event',
    badge: 'After Show',
    badgeColor: 'bg-gray-100 border-gray-300 text-gray-600',
    icon: Clock,
    tasks: [
      { id: 'task48', text: 'Clean up event site thoroughly' },
      { id: 'task49', text: 'Return all rented equipment' },
      { id: 'task50', text: 'Send thank-you messages to sponsors and volunteers' },
      { id: 'task51', text: 'Post event photos and recap on social media' },
      { id: 'task52', text: 'Tally up funds raised and prepare financial summary' },
      { id: 'task53', text: 'Deliver donation to rescue and shelter' },
      { id: 'task54', text: 'Gather feedback for next year\'s improvements' },
    ],
  },
];

const OrganizerChecklistContent: React.FC = () => {

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    checklistData.forEach(s => { initial[s.id] = true; });
    return initial;
  });

  // Load from localStorage
  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCheckedItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load checklist state:', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItems));
    } catch (e) {
      console.error('Failed to save checklist state:', e);
    }
  }, [checkedItems]);

  const toggleCheck = useCallback((taskId: string) => {
    setCheckedItems(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  const clearAllChecks = () => {
    if (window.confirm('Are you sure you want to clear all checkmarks? This cannot be undone.')) {
      setCheckedItems({});
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Calculate stats
  const totalTasks = checklistData.reduce((acc, s) => acc + s.tasks.length, 0);
  const completedTasks = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getSectionProgress = (section: ChecklistSection) => {
    const done = section.tasks.filter(t => checkedItems[t.id]).length;
    return { done, total: section.tasks.length };
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] font-sans text-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg print:hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={LOGO}
                alt="Crafty Kates Logo"
                className="w-10 h-10 rounded-full shadow-md"

              />
              <div className="hidden sm:block">
                <h1 className="font-heading text-xl text-[#9E065D] leading-none tracking-wide">Crafty Kates</h1>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Home</span>
              </Link>
              <Link
                to="/car-show"
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#9E065D] hover:bg-[#FEE6F4]/50 rounded-lg transition-all"
              >
                <span className="hidden sm:inline">Car Show Page</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Hero Card */}
        <section className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] rounded-xl flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-heading text-3xl sm:text-4xl text-[#9E065D] tracking-wide leading-tight">
                APRIL 18, 2026 CAR SHOW
                <br />
                ORGANIZER CHECKLIST
              </h1>
              <p className="text-gray-500 text-sm mt-2">
                Use this as your private master planning list. The checkmarks save in your browser on this device.
              </p>
            </div>
          </div>

          {/* Progress Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="bg-[#FEE6F4]/30 border border-[#FEE6F4] rounded-xl p-4">
              <p className="font-heading text-2xl text-[#9E065D]">{completedTasks}</p>
              <p className="text-gray-500 text-xs font-medium">Completed</p>
            </div>
            <div className="bg-[#FEE6F4]/30 border border-[#FEE6F4] rounded-xl p-4">
              <p className="font-heading text-2xl text-[#9E065D]">{totalTasks - completedTasks}</p>
              <p className="text-gray-500 text-xs font-medium">Remaining</p>
            </div>
            <div className="bg-[#FEE6F4]/30 border border-[#FEE6F4] rounded-xl p-4">
              <p className="font-heading text-2xl text-[#9E065D]">{totalTasks}</p>
              <p className="text-gray-500 text-xs font-medium">Total Tasks</p>
            </div>
            <div className="bg-[#FEE6F4]/30 border border-[#FEE6F4] rounded-xl p-4">
              <p className="font-heading text-2xl text-[#9E065D]">{progressPercent}%</p>
              <p className="text-gray-500 text-xs font-medium">Progress</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9E065D] to-[#FB50B1] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-3 mt-6 print:hidden">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#9E065D] to-[#7D0348] hover:from-[#FB50B1] hover:to-[#9E065D] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 shadow-md"
            >
              <Printer size={16} />
              Print Checklist
            </button>
            <button
              onClick={clearAllChecks}
              className="inline-flex items-center gap-2 bg-white border-2 border-[#9E065D] text-[#9E065D] hover:bg-[#9E065D] hover:text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-300"
            >
              <Trash2 size={16} />
              Clear All Checks
            </button>
          </div>
        </section>

        {/* Checklist Sections */}
        <div className="space-y-4">
          {checklistData.map((section) => {
            const progress = getSectionProgress(section);
            const isExpanded = expandedSections[section.id];
            const isComplete = progress.done === progress.total;

            return (
              <section
                key={section.id}
                className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
                  isComplete ? 'border-green-200' : 'border-gray-200'
                }`}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 hover:bg-gray-50/50 transition-colors text-left print:hover:bg-transparent"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isComplete
                        ? 'bg-green-100'
                        : 'bg-gradient-to-br from-[#9E065D]/10 to-[#FB50B1]/10'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <section.icon className="w-5 h-5 text-[#9E065D]" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${section.badgeColor}`}>
                          {section.badge}
                        </span>
                        <span className="text-xs text-gray-400">
                          {progress.done}/{progress.total}
                        </span>
                      </div>
                      <h2 className="font-heading text-xl text-gray-900 tracking-wide mt-1">{section.title.toUpperCase()}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Mini progress */}
                    <div className="hidden sm:block w-24">
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isComplete ? 'bg-green-500' : 'bg-gradient-to-r from-[#9E065D] to-[#FB50B1]'
                          }`}
                          style={{ width: `${progress.total > 0 ? (progress.done / progress.total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform duration-300 print:hidden ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Task List */}
                {(isExpanded || false) && (
                  <div className="border-t border-gray-100 px-5 sm:px-6 pb-4">
                    <ul className="divide-y divide-gray-50">
                      {section.tasks.map((task) => {
                        const isChecked = !!checkedItems[task.id];
                        return (
                          <li key={task.id} className="py-3">
                            <label className="flex items-start gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCheck(task.id)}
                                className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[#9E065D] focus:ring-[#FB50B1] focus:ring-offset-0 accent-[#9E065D] flex-shrink-0 cursor-pointer"
                              />
                              <span
                                className={`text-sm leading-relaxed transition-all duration-200 ${
                                  isChecked
                                    ? 'line-through text-gray-400'
                                    : 'text-gray-700 group-hover:text-gray-900'
                                }`}
                              >
                                {task.text}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {/* Print: always show tasks */}
                <div className="hidden print:block border-t border-gray-100 px-6 pb-4">
                  <ul>
                    {section.tasks.map((task) => {
                      const isChecked = !!checkedItems[task.id];
                      return (
                        <li key={task.id} className="py-2 flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            readOnly
                            className="mt-0.5 w-4 h-4"
                          />
                          <span className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                            {task.text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </section>
            );
          })}
        </div>

        {/* Bottom Note */}
        <div className="mt-8 text-center text-gray-400 text-sm pb-8 print:hidden">
          <p>Your progress is saved automatically in this browser.</p>
          <p className="mt-1">
            <Link to="/" className="text-[#9E065D] hover:text-[#FB50B1] transition-colors">
              Return to Crafty Kates Home
            </Link>
            {' '}&middot;{' '}
            <Link to="/car-show" className="text-[#9E065D] hover:text-[#FB50B1] transition-colors">
              View Car Show Page
            </Link>
          </p>
        </div>
      </div>

      {/* Scroll to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-gradient-to-br from-[#9E065D] to-[#FB50B1] text-white rounded-full shadow-lg shadow-[#9E065D]/30 flex items-center justify-center hover:scale-110 transition-transform duration-300 print:hidden"
        title="Back to top"
      >
        <ArrowUp size={20} />
      </button>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          nav { display: none !important; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
          section { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

// ─── Wrapper with Admin Auth Gate ────────────────────────────────
const OrganizerChecklist: React.FC<{ embedded?: boolean }> = ({ embedded = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (embedded) {
      setIsAuthenticated(true);
      setCheckingAuth(false);
      return;
    }
    setIsAuthenticated(checkAdminAuth());
    setCheckingAuth(false);
  }, [embedded]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#1a0a12] flex items-center justify-center">
        <Loader2 size={32} className="text-[#FB50B1] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLoginGate
        title="Organizer Checklist"
        subtitle="Enter the admin password to access the checklist"
        icon={<ClipboardList size={28} className="text-white" />}
        backTo="/"
        backLabel="Back to Home"
        onAuthenticated={() => setIsAuthenticated(true)}
      />
    );
  }

  return <OrganizerChecklistContent />;
};

export default OrganizerChecklist;
