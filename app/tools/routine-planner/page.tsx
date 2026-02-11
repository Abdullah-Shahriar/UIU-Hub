"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseCardSelector from "@/components/course-card-selector";
import SchedulePlanner from "@/components/schedule-planner";
import {
  exportPlanAsPDF,
  exportPlanAsPNG,
  exportPlanAsExcel,
  exportPlanAsCalendar,
  exportAllPlansAsPDF,
  exportAllPlansAsPNG,
  exportAllPlansAsExcel,
  exportAllPlansAsCalendar
} from "@/lib/exportUtils";

interface Course {
  program: string;
  courseCode: string;
  title: string;
  section: string;
  room1: string;
  room2: string;
  day1: string;
  day2: string;
  time1: string;
  time2: string;
  facultyName: string;
  facultyInitial: string;
  credit: string;
}

const parsePdfText = (text: string): Course[] => {
  console.log("Starting to parse PDF text...");
  console.log("First 500 characters:", text.substring(0, 500));
  const courses: Course[] = [];
  
  const cleanedText = text.replace(/(\d{1,2}:\d{2}:[AP]M)\s-\s(\d{1,2}:\d{2}:[AP]M)/g, '$1-$2');
  
  // Detect PDF format by looking for table headers
  // Format 1 (252): "Credit" header
  // Format 2 (253): "Cr." header
  let isFormat253 = false;
  let headerEndMarker = "";
  let startIndex = -1;
  
  // Try Format 1 (252) header
  startIndex = cleanedText.indexOf("Credit");
  if (startIndex !== -1) {
    headerEndMarker = "Credit";
    isFormat253 = false;
    console.log("Detected Format 252 (with serial numbers)");
  } else {
    // Try Format 2 (253) header
    startIndex = cleanedText.indexOf("Cr.");
    if (startIndex !== -1) {
      headerEndMarker = "Cr.";
      isFormat253 = true;
      console.log("Detected Format 253 (without serial numbers)");
    }
  }
  
  if (startIndex === -1) {
    console.error("Could not find the header in the PDF text.");
    console.log("Full text preview:", cleanedText.substring(0, 1000));
    toast.error("Parsing Error: Could not find the data table header in the PDF. The PDF format might be unsupported.");
    return [];
  }
  
  const courseDataText = cleanedText.substring(startIndex + headerEndMarker.length).trim();

  // Split courses based on format
  // Format 1 (252): Starts with serial number + program (e.g., "1 BSCSE")
  // Format 2 (253): Starts directly with program (e.g., "BSCSE" or "BSDS")
  const courseBlocks = isFormat253
    ? courseDataText.split(/(?=(?:BSCSE|BSDS)\s+[A-Z]{2,4}\s+\d{4})/).filter(block => block.trim() !== "")
    : courseDataText.split(/(?=\d+\s+(?:BSCSE|BSDS))/).filter(block => block.trim() !== "");

  console.log(`Found ${courseBlocks.length} potential course blocks.`);

  courseBlocks.forEach((block) => {
    try {
      // Remove footer junk (Format 252: "CLASS ROUTINE 252", Format 253: "monir@admin.uiu.ac.bd")
      const junkKeywords = ['CLASS ROUTINE', 'United International University', 'Course Offerings', 'monir@admin.uiu'];
      let cleanText = block;
      junkKeywords.forEach((kw) => {
        const idx = cleanText.indexOf(kw);
        if (idx !== -1) {
          cleanText = cleanText.substring(0, idx).trim();
        }
      });
      let remainingBlock = cleanText.trim();

      // 1. Extract SL (if Format 252), Program, and Course Code
      let program = "";
      let courseCode = "";
      
      if (isFormat253) {
        // Format 253: No serial number, starts with "BSCSE CSE 2218" or "BSDS CSE 2218"
        const initialMatch = remainingBlock.match(/^(BSCSE|BSDS)\s+([A-Z]{2,4}\s+\d{4}[A-Z]?)/);
        if (!initialMatch) {
          console.warn(`Skipping block with unexpected start (253): ${block.substring(0, 100)}`);
          return;
        }
        program = initialMatch[1];
        courseCode = initialMatch[2];
        remainingBlock = remainingBlock.substring(initialMatch[0].length).trim();
      } else {
        // Format 252: Has serial number "1 BSCSE CSE 2218"
        const initialMatch = remainingBlock.match(/^(\d+)\s+(BSCSE|BSDS)\s+([A-Z]{2,4}\s+\d{4}[A-Z]?)/);
        if (!initialMatch) {
          console.warn(`Skipping block with unexpected start (252): ${block.substring(0, 100)}`);
          return;
        }
        program = initialMatch[2];
        courseCode = initialMatch[3];
        remainingBlock = remainingBlock.substring(initialMatch[0].length).trim();
      }

      // 4. Extract Faculty Name, Initial, and Credit by finding the last occurrence in the block
      // Extract faculty info by scanning for the last pattern of "Name Initial Credit"
      let facultyName = "TBA";
      let facultyInitial = "TBA";
      let credit = "0";
      const facultyPattern = /([A-Za-z.\s]+?)\s*([A-Za-z]{1,5}|TBA)\s*(\d)\b/g;
      let match: RegExpExecArray | null = null;
      let lastMatch: RegExpExecArray | null = null;
      while ((match = facultyPattern.exec(remainingBlock)) !== null) {
        lastMatch = match;
      }
      if (lastMatch) {
        facultyName = lastMatch[1].trim();
        facultyInitial = lastMatch[2];
        credit = lastMatch[3];
        remainingBlock = remainingBlock.substring(0, lastMatch.index).trim();
      } else {
        // If faculty info missing, still extract credit at end
        const creditOnlyMatch = remainingBlock.match(/(\d)\s*$/);
        if (creditOnlyMatch) {
          credit = creditOnlyMatch[1];
          // Remove credit from remainingBlock
          remainingBlock = remainingBlock.substring(0, creditOnlyMatch.index).trim();
        }
      }
      // Remove stray AM/PM tokens that belong to time, not name
      facultyName = facultyName.replace(/\b(AM|PM)\b/g, '').trim();

      // 5. Extract Times (one or two exact as in PDF)
      const timeRegex = /\d{1,2}:\d{2}:[AP]M-\d{1,2}:\d{2}:[AP]M/g;
      const rawTimeMatches = remainingBlock.match(timeRegex) || [];
      const times = rawTimeMatches.map(t => t.replace(/-/g, ' - '));
      const time1 = times[0] || '';
      const time2 = times[1] || '';
      if (rawTimeMatches.length > 0 && rawTimeMatches[0]) {
        const firstTime = rawTimeMatches[0];
        const idx = remainingBlock.indexOf(firstTime);
        if (idx !== -1) {
          remainingBlock = remainingBlock.substring(0, idx).trim();
        }
      }

      // 6. Extract Days (one or two exact as in PDF)
      const dayRegex = /Sat|Sun|Mon|Tue|Wed|Thu|Fri/g;
      const rawDayMatches = remainingBlock.match(dayRegex) || [];
      const day1 = rawDayMatches[0] || '';
      const day2 = rawDayMatches[1] || '';
      if (rawDayMatches.length > 0 && rawDayMatches[0]) {
        const firstDay = rawDayMatches[0];
        const idx = remainingBlock.indexOf(firstDay);
        if (idx !== -1) {
          remainingBlock = remainingBlock.substring(0, idx).trim();
        }
      }

      // 7. Extract Rooms (can be one or two, or none)
      const roomRegex = /\d{3}/g;
      const roomMatches = remainingBlock.match(roomRegex) || [];
      const room1 = roomMatches[0] || "TBA";
      const room2 = roomMatches[1] || (room1 === "TBA" ? "TBA" : room1);
      if (roomMatches.length > 0 && roomMatches[0]) {
        const firstRoomIndex = remainingBlock.indexOf(roomMatches[0]);
        if (firstRoomIndex !== -1) {
          remainingBlock = remainingBlock.substring(0, firstRoomIndex).trim();
        }
      }

      // 8. Extract Section (now supports multi-character sections like AC, AD, AE, AF)
      const sectionMatch = remainingBlock.match(/([A-Z]{1,2})(?:\s*\(If\s+Required\))?$/i);
      let section = "TBA";
      if (sectionMatch) {
        section = sectionMatch[1];
        remainingBlock = remainingBlock.substring(0, sectionMatch.index).trim();
      }

      // 9. Whatever is left is the Title
      const title = remainingBlock.trim();

      const course: Course = {
        program,
        courseCode,
        title,
        section,
        room1,
        room2,
        day1,
        day2,
        time1,
        time2,
        facultyName,
        facultyInitial,
        credit,
      };

      courses.push(course);
    } catch (e) {
      console.error(`Failed to parse block: "${block}"`, e);
    }
  });

  if (courses.length === 0 && courseBlocks.length > 0) {
      toast.error("Parsing Failed: Could not extract any course data, though blocks were found. The PDF structure might have changed.");
  }

  console.log("Finished parsing PDF text. Found courses:", courses.length);
  return courses;
};

const UploadView = ({ onPdfProcessed }: { onPdfProcessed: (courses: Course[]) => void }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setIsLoading(true);
    toast.info("Uploading and processing PDF...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "An unknown error occurred during upload.");
      }

      const data = await response.json();
      if (data.text) {
        const parsedCourses = parsePdfText(data.text);
        onPdfProcessed(parsedCourses);
      } else {
        throw new Error("The PDF could not be read or is empty.");
      }
    } catch (error) {
      console.error("Error processing file:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
      onPdfProcessed([]); // Send empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreUploadedLoad = async () => {
    setIsLoading(true);
    toast.info("Loading pre-uploaded course data...");
    try {
      const response = await fetch("/api/demo-pdf", {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load pre-uploaded data.");
      }

      const data = await response.json();
      if (data.text) {
        const parsedCourses = parsePdfText(data.text);
        onPdfProcessed(parsedCourses);
      } else {
        throw new Error("The pre-uploaded PDF could not be read or is empty.");
      }
    } catch (error) {
      console.error("Error loading pre-uploaded PDF:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred while loading pre-uploaded data.");
      }
      onPdfProcessed([]); // Send empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      handleFileChange(file);
    } else {
      toast.error("Please drop a PDF file.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary absolute top-0"></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-primary animate-pulse">Processing PDF...</p>
        <p className="mt-2 text-sm text-muted-foreground">Please wait while we parse your course data</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)] p-3 sm:p-4 md:p-6">
      <Card 
        className={`w-full max-w-2xl border-2 border-dashed transition-all duration-300 shadow-xl ${isDragging ? 'border-primary bg-primary/5 scale-105' : 'border-border hover:border-primary/50'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardHeader className="text-center px-6 py-8">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 text-primary text-4xl">
              📚
            </div>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold">Section Planner</CardTitle>
          <CardDescription className="text-sm sm:text-base mt-3">Upload your class routine PDF or use demo data to get started</CardDescription>
        </CardHeader>
        <CardContent className="text-center p-4 sm:p-6">
          <div className="space-y-6">
            {/* Pre-uploaded Section */}
            <div className="space-y-4 p-6 bg-muted/50 rounded-lg border border-border hover:border-primary/50 transition-all duration-200">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold">Quick Start</h3>
              </div>
              <Button 
                size="lg"
                onClick={handlePreUploadedLoad}
                className="w-full font-semibold py-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <span className="mr-2">🚀</span> Use Demo Data
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Using CLASS-ROUTINE-253.pdf · Ready to use
              </p>
            </div>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-background px-3 text-xs font-medium text-muted-foreground uppercase">Or</span>
              </div>
            </div>

            {/* Upload Section */}
            <div className="space-y-4 p-6 bg-muted/30 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-all duration-200">
              <div className="flex items-center justify-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <span className="text-2xl">📂</span>
                </div>
                <h3 className="text-lg font-semibold">Upload Custom PDF</h3>
              </div>
              <div>
                <Input 
                  id="file-upload"
                  type="file" 
                  className="hidden" 
                  onChange={(e) => handleFileChange(e.target.files ? e.target.files[0] : null)} 
                  accept=".pdf"
                />
                <label htmlFor="file-upload" className="cursor-pointer block">
                  <Button asChild size="lg" variant="outline" className="w-full font-semibold py-6 border-2 hover:bg-muted transition-all duration-200">
                    <span><span className="mr-2">📄</span> Choose PDF File</span>
                  </Button>
                </label>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Drag & drop your routine PDF or click to browse
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface SectionPlan {
  id: string;
  name: string;
  courses: Course[];
}

const DataView = ({ courses: initialCourses, onBack }: { courses: Course[], onBack: () => void }) => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(initialCourses);
  const [sectionPlans, setSectionPlans] = useState<SectionPlan[]>([
    { id: '1', name: 'Section Plan 1', courses: [] }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'card' | 'table' | 'planner'>('card');
  const [expandedPlans, setExpandedPlans] = useState<Set<string>>(new Set(sectionPlans.map(p => p.id)));
  const [sectionPlansVisible, setSectionPlansVisible] = useState(false);
  
  // Computed: all selected courses across all plans
  const selectedCourses = sectionPlans.flatMap(plan => plan.courses);

  const togglePlanExpanded = (planId: string) => {
    setExpandedPlans(prev => {
      const newSet = new Set(prev);
      if (newSet.has(planId)) {
        newSet.delete(planId);
      } else {
        newSet.add(planId);
      }
      return newSet;
    });
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawTerm = event.target.value;
    setSearchTerm(rawTerm);
    const term = rawTerm.toLowerCase().trim();
    
    const filtered = initialCourses.filter((course) => {
      const titleLower = course.title.toLowerCase();
      const codeLower = course.courseCode.toLowerCase();
      const facultyLower = course.facultyName.toLowerCase();
      const sectionLower = course.section.toLowerCase();
      const initialLower = course.facultyInitial.toLowerCase();
      
      // Basic matching
      if (titleLower.includes(term) || codeLower.includes(term) || 
          facultyLower.includes(term) || initialLower.includes(term) || 
          sectionLower.includes(term)) {
        return true;
      }
      
      // Dynamic uppercase letter extraction
      const upperCaseLetters = course.title.match(/[A-Z]/g);
      if (upperCaseLetters && upperCaseLetters.length >= 2) {
        const acronymFromUppercase = upperCaseLetters.join('').toLowerCase();
        if (acronymFromUppercase === term || acronymFromUppercase.includes(term) || 
            (term.length >= 2 && acronymFromUppercase.startsWith(term))) {
          return true;
        }
      }
      
      // Dynamic acronym from title, skipping common stop words
      const stopWords = ['and', 'of', 'the', 'for', 'if', 'required', 'a', 'an', 'in', 'on', 'to', 'using', 'lab', 'laboratory', 'introduction', 'basic', 'advanced', 'theory', 'practical'];
      const titleWords = course.title.split(/\s+/).filter(w => 
        w.length > 1 && !stopWords.includes(w.toLowerCase())
      );
      
      if (titleWords.length >= 2) {
        // Full acronym from first letters
        const acronym = titleWords.map(w => w[0]).join('').toLowerCase();
        if (acronym === term || acronym.includes(term) || term.includes(acronym)) {
          return true;
        }
        
        // Partial acronyms
        for (let i = 2; i <= Math.min(titleWords.length, term.length + 2); i++) {
          const partialAcronym = titleWords.slice(0, i).map(w => w[0]).join('').toLowerCase();
          if (partialAcronym === term) {
            return true;
          }
        }
        
        // Sliding window acronyms
        for (let start = 0; start <= titleWords.length - 2; start++) {
          for (let length = 2; length <= Math.min(4, titleWords.length - start); length++) {
            const slidingAcronym = titleWords.slice(start, start + length)
              .map(w => w[0]).join('').toLowerCase();
            if (slidingAcronym === term) {
              return true;
            }
          }
        }
      }
      
      // Check if search term matches the start of any significant word
      if (titleWords.length > 0) {
        const matchesWordStart = titleWords.some(word => 
          word.toLowerCase().startsWith(term) && term.length >= 2
        );
        if (matchesWordStart) {
          return true;
        }
      }

      return false;
    });
    setFilteredCourses(filtered);
  };

  const handleSelectCourse = (course: Course, planId?: string) => {
    // If planId is not provided, check if course exists in any plan and remove it from ALL plans
    if (!planId) {
      const plansWithCourse = sectionPlans.filter(plan => 
        plan.courses.some(c => c.courseCode === course.courseCode && c.section === course.section)
      );
      
      if (plansWithCourse.length > 0) {
        // Remove from all plans that have this course
        setSectionPlans(prev => prev.map(plan => ({
          ...plan,
          courses: plan.courses.filter(c => !(c.courseCode === course.courseCode && c.section === course.section))
        })));
        toast.info(`Removed ${course.courseCode} ${course.section} from all plans`);
        return;
      }
      
      // If not in any plan and no planId specified, add to first plan
      planId = sectionPlans[0].id;
    }
    
    // Determine target plan
    const targetPlanId = planId;
    const targetPlan = sectionPlans.find(p => p.id === targetPlanId);
    
    if (!targetPlan) return;
    
    // Check if target plan already has this exact course (same course code AND section)
    const exactCourseInTargetPlan = targetPlan.courses.find(
      c => c.courseCode === course.courseCode && c.section === course.section
    );
    
    if (exactCourseInTargetPlan) {
      // This exact course is already in the target plan, so remove it
      const planName = targetPlan.name;
      setSectionPlans(prev => prev.map(plan => 
        plan.id === targetPlanId 
          ? { ...plan, courses: plan.courses.filter(c => !(c.courseCode === course.courseCode && c.section === course.section)) }
          : plan
      ));
      toast.info(`Removed ${course.courseCode} ${course.section} from ${planName}`);
      return;
    }
    
    // Check if target plan already has this course with a different section
    const existingCourseInPlan = targetPlan.courses.find(c => c.courseCode === course.courseCode);
    
    if (existingCourseInPlan) {
      // Don't allow adding the same course (different section) to the same plan
      toast.error(`${course.courseCode} is already in ${targetPlan.name}. Use move/swap to exchange sections.`);
      return;
    }
    
    // Add to target plan
    const planName = targetPlan.name;
    setSectionPlans(prev => prev.map(plan => 
      plan.id === targetPlanId 
        ? { ...plan, courses: [...plan.courses, course] }
        : plan
    ));
    
    toast.success(`Added ${course.courseCode} ${course.section} to ${planName}`);
  };

  const handleMoveCourse = (course: Course, fromPlanId: string, toPlanId: string) => {
    setSectionPlans(prev => {
      const newPlans = prev.map(plan => ({ ...plan, courses: [...plan.courses] }));
      
      // Find the source and target plans
      const fromPlan = newPlans.find(p => p.id === fromPlanId);
      const toPlan = newPlans.find(p => p.id === toPlanId);
      
      if (!fromPlan || !toPlan) return prev;
      
      // Find the course in the source plan
      const courseIndex = fromPlan.courses.findIndex(
        c => c.courseCode === course.courseCode && c.section === course.section
      );
      
      if (courseIndex === -1) return prev;
      
      // Check if target plan has the same course (same course code, any section)
      const existingCourseIndex = toPlan.courses.findIndex(
        c => c.courseCode === course.courseCode
      );
      
      if (existingCourseIndex !== -1) {
        // SWAP: Exchange the courses
        const existingCourse = toPlan.courses[existingCourseIndex];
        const movingCourse = fromPlan.courses[courseIndex];
        
        // Get plan names for toast
        const fromPlanName = prev.find(p => p.id === fromPlanId)?.name || 'Plan';
        const toPlanName = prev.find(p => p.id === toPlanId)?.name || 'Plan';
        
        // Replace in target plan
        toPlan.courses[existingCourseIndex] = movingCourse;
        
        // Replace in source plan
        fromPlan.courses[courseIndex] = existingCourse;
        
        toast.success(`Swapped ${course.courseCode} sections between plans`, {
          description: `${fromPlanName}: Section ${existingCourse.section} ↔ ${toPlanName}: Section ${movingCourse.section}`
        });
      } else {
        // MOVE: Just move the course
        const [movedCourse] = fromPlan.courses.splice(courseIndex, 1);
        toPlan.courses.push(movedCourse);
        
        const fromPlanName = prev.find(p => p.id === fromPlanId)?.name || 'Plan';
        const toPlanName = prev.find(p => p.id === toPlanId)?.name || 'Plan';
        
        toast.success(`Moved ${course.courseCode} from ${fromPlanName} to ${toPlanName}`);
      }
      
      return newPlans;
    });
  };

  const handleRemoveCourse = (course: Course, planId: string) => {
    setSectionPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, courses: plan.courses.filter(c => !(c.courseCode === course.courseCode && c.section === course.section)) }
        : plan
    ));
  };

  const handleAddNewPlan = () => {
    const newId = (Math.max(...sectionPlans.map(p => parseInt(p.id)), 0) + 1).toString();
    setSectionPlans(prev => [...prev, { 
      id: newId, 
      name: `Section Plan ${newId}`, 
      courses: [] 
    }]);
    // Expand the newly created plan
    setExpandedPlans(prev => new Set(Array.from(prev).concat(newId)));
    toast.success('New section plan added');
  };

  const handleAddPlanFromSchedule = (courses: Course[], scheduleName: string) => {
    // Find a unique name by checking existing plan names
    let finalName = scheduleName;
    let counter = 1;
    
    // Extract the base name and number if it exists
    const baseNameMatch = scheduleName.match(/^(.*?)(\d+)$/);
    const baseName = baseNameMatch ? baseNameMatch[1].trim() : scheduleName;
    
    // Check if name exists and increment until we find a unique one
    while (sectionPlans.some(plan => plan.name === finalName)) {
      counter++;
      finalName = `${baseName} ${counter}`;
    }
    
    const newId = (Math.max(...sectionPlans.map(p => parseInt(p.id)), 0) + 1).toString();
    setSectionPlans(prev => [...prev, { 
      id: newId, 
      name: finalName, 
      courses: courses 
    }]);
    // Expand the newly created plan
    setExpandedPlans(prev => new Set(Array.from(prev).concat(newId)));
    // Stay in Schedule Planner view
    toast.success(`Added "${finalName}" as a new section plan`);
  };

  const handleDeletePlan = (planId: string) => {
    if (sectionPlans.length === 1) {
      toast.error('Cannot delete the last plan');
      return;
    }
    setSectionPlans(prev => prev.filter(p => p.id !== planId));
    // Remove from expanded plans
    setExpandedPlans(prev => {
      const newSet = new Set(prev);
      newSet.delete(planId);
      return newSet;
    });
    toast.success('Section plan deleted');
  };

  const handleRenamePlan = (planId: string, newName: string) => {
    setSectionPlans(prev => prev.map(plan => 
      plan.id === planId ? { ...plan, name: newName } : plan
    ));
  };

  const handleClearAllSelected = () => {
    setSectionPlans(prev => prev.map(plan => ({ ...plan, courses: [] })));
  };

  const isCourseSelected = (course: Course) => {
    return selectedCourses.some(c => c.courseCode === course.courseCode && c.section === course.section);
  }

  // Helper function to check for conflicts within a specific plan
  const hasConflictInPlan = (course: Course, plan: SectionPlan): boolean => {
    const parseTime = (timeStr: string): { start: number; end: number } | null => {
      if (!timeStr) return null;
      
      // Updated regex to handle formats like "11:11:AM - 12:30:PM" (no space before AM/PM)
      const match = timeStr.match(/(\d+):(\d+)\s*:?\s*([AP]M)?\s*-\s*(\d+):(\d+)\s*:?\s*([AP]M)?/i);
      
      if (!match) return null;
      
      let startHour = parseInt(match[1]);
      const startMin = parseInt(match[2]);
      const startPeriod = match[3]?.toUpperCase();
      let endHour = parseInt(match[4]);
      const endMin = parseInt(match[5]);
      const endPeriod = match[6]?.toUpperCase();
      
      // If no period specified for start, inherit from end
      const effectiveStartPeriod = startPeriod || endPeriod;
      const effectiveEndPeriod = endPeriod || startPeriod;
      
      if (effectiveStartPeriod === 'PM' && startHour !== 12) startHour += 12;
      if (effectiveStartPeriod === 'AM' && startHour === 12) startHour = 0;
      if (effectiveEndPeriod === 'PM' && endHour !== 12) endHour += 12;
      if (effectiveEndPeriod === 'AM' && endHour === 12) endHour = 0;
      
      return {
        start: startHour * 60 + startMin,
        end: endHour * 60 + endMin
      };
    };

    const timesOverlap = (time1: string, time2: string): boolean => {
      const t1 = parseTime(time1);
      const t2 = parseTime(time2);
      if (!t1 || !t2) return false;
      return (t1.start < t2.end) && (t2.start < t1.end);
    };

    const courseDays = [course.day1, course.day2].filter(Boolean);
    const courseTimes = [course.time1, course.time2].filter(Boolean);

    return plan.courses.some(existingCourse => {
      if (existingCourse.courseCode === course.courseCode && 
          existingCourse.section === course.section) {
        return false;
      }

      const existingDays = [existingCourse.day1, existingCourse.day2].filter(Boolean);
      const existingTimes = [existingCourse.time1, existingCourse.time2].filter(Boolean);

      const hasCommonDay = courseDays.some(day => existingDays.includes(day));
      if (!hasCommonDay) return false;

      return courseTimes.some(time => 
        existingTimes.some(existingTime => timesOverlap(time, existingTime))
      );
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl min-h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-border">
        <Button 
          onClick={onBack} 
          variant="ghost" 
          size="sm"
          className="font-medium text-muted-foreground hover:text-foreground"
        >
          ← Back
        </Button>
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-full sm:w-auto">
          <Button 
            variant={viewMode === 'card' ? 'default' : 'ghost'}
            onClick={() => setViewMode('card')}
            size="sm"
            className="flex-1 sm:flex-none text-sm font-medium"
          >
            Card View
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'ghost'}
            onClick={() => setViewMode('table')}
            size="sm"
            className="flex-1 sm:flex-none text-sm font-medium"
          >
            Table View
          </Button>
          <Button 
            variant={viewMode === 'planner' ? 'default' : 'ghost'}
            onClick={() => setViewMode('planner')}
            size="sm"
            className="flex-1 sm:flex-none text-sm font-medium"
          >
            AI Planner
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {/* Show Section Plans in all views */}
        <div className="w-full space-y-4">
          {/* Add New Plan and Export All Buttons */}
          <div className="flex flex-col gap-3">
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card px-5 py-4 rounded-lg border border-border shadow-sm gap-4">
              <button
                onClick={() => setSectionPlansVisible(!sectionPlansVisible)}
                className="flex items-center gap-3 cursor-pointer flex-1 w-full sm:w-auto group"
              >
                <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center transition-colors duration-200 group-hover:bg-muted/80">
                  <span className="text-sm font-medium text-muted-foreground transition-transform duration-200">
                    {sectionPlansVisible ? '▼' : '▶'}
                  </span>
                </div>
                <div className="text-left">
                  <h2 className="text-base font-semibold text-foreground">Your Section Plans</h2>
                  <p className="text-xs text-muted-foreground">
                    {sectionPlans.length} plan{sectionPlans.length !== 1 ? 's' : ''} · {sectionPlans.reduce((acc, p) => acc + p.courses.length, 0)} courses
                  </p>
                </div>
              </button>
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleAddNewPlan} 
                  size="sm" 
                  className="text-sm flex-1 sm:flex-none font-medium"
                >
                  + New Plan
                </Button>
                {sectionPlans.length > 0 && sectionPlans.some(p => p.courses.length > 0) && (
                  <Select value="" onValueChange={(value: string) => {
                    const plansWithCourses = sectionPlans.filter(p => p.courses.length > 0);
                    if (value === 'pdf') exportAllPlansAsPDF(plansWithCourses);
                    else if (value === 'png') exportAllPlansAsPNG(plansWithCourses);
                    else if (value === 'excel') exportAllPlansAsExcel(plansWithCourses);
                    else if (value === 'calendar') exportAllPlansAsCalendar(plansWithCourses);
                  }}>
                    <SelectTrigger className="h-8 text-sm w-full sm:w-auto font-medium">
                      <SelectValue placeholder="Export All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf" className="cursor-pointer">📄 PDF Document</SelectItem>
                      <SelectItem value="png" className="cursor-pointer">🖼️ PNG Image</SelectItem>
                      <SelectItem value="excel" className="cursor-pointer">📊 Excel Sheet</SelectItem>
                      <SelectItem value="calendar" className="cursor-pointer">📅 Calendar File</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

            {/* Section Plans - truncated for brevity, continues in next message... */}
          </div>

        {/* Content based on view mode */}
        {viewMode === 'planner' ? (
          <SchedulePlanner courses={initialCourses} onAddPlanFromSchedule={handleAddPlanFromSchedule} />
        ) : viewMode === 'card' ? (
          <CourseCardSelector 
            courses={initialCourses} 
            sectionPlans={sectionPlans}
            onCourseSelect={handleSelectCourse}
            onClearAllSelected={handleClearAllSelected}
          />
        ) : (
          <div className="w-full">
            <Card className="border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">Available Courses</CardTitle>
                <CardDescription>
                  {initialCourses.length} courses available
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="text"
                  placeholder="Search by course code, title, faculty, or section..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="max-w-md"
                />
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full border-collapse min-w-[800px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Code</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Section</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Faculty</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Credit</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Schedule</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCourses.map((course, index) => (
                        <tr
                          key={`${course.courseCode}-${course.section}-${index}`}
                          className={`border-b hover:bg-muted/30 transition-colors ${
                            isCourseSelected(course) ? 'bg-primary/5' : ''
                          }`}
                        >
                          <td className="px-4 py-3 text-sm font-medium">{course.courseCode}</td>
                          <td className="px-4 py-3 text-sm">{course.title}</td>
                          <td className="px-4 py-3 text-sm">{course.section}</td>
                          <td className="px-4 py-3 text-sm">
                            {course.facultyName === "TBA"
                              ? "TBA"
                              : `${course.facultyName} (${course.facultyInitial})`}
                          </td>
                          <td className="px-4 py-3 text-sm">{course.credit}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="space-y-0.5">
                              <div className="text-xs text-muted-foreground">{course.day1}{course.day2 ? ` - ${course.day2}` : ''}</div>
                              {course.time1 && <div className="text-xs">{course.time1}</div>}
                              {course.room1 && <div className="text-xs text-muted-foreground">Room {course.room1}</div>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {sectionPlans.length === 1 ? (
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => handleSelectCourse(course, sectionPlans[0].id)} 
                                className="text-xs font-medium"
                                disabled={sectionPlans[0].courses.some(c => c.courseCode === course.courseCode)}
                              >
                                {sectionPlans[0].courses.some(c => c.courseCode === course.courseCode) 
                                  ? 'Added' 
                                  : 'Add'}
                              </Button>
                            ) : (
                              <Select onValueChange={(planId: string) => handleSelectCourse(course, planId)}>
                                <SelectTrigger className="h-9 w-[110px] text-xs">
                                  <SelectValue placeholder="Add to..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {sectionPlans.map(p => {
                                    const alreadyHasCourse = p.courses.some(c => c.courseCode === course.courseCode);
                                    return (
                                      <SelectItem 
                                        key={p.id} 
                                        value={p.id} 
                                        disabled={alreadyHasCourse}
                                      >
                                        {p.name}
                                      </SelectItem>
                                    );
                                  })}
                                </SelectContent>
                              </Select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};


export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [view, setView] = useState<'upload' | 'data'>('upload');

  const handlePdfProcessed = (parsedCourses: Course[]) => {
    if (parsedCourses.length > 0) {
      setCourses(parsedCourses);
      setView('data');
      toast.success(`Successfully parsed ${parsedCourses.length} courses.`);
    } else {
      // Error toast is handled in UploadView
      setView('upload');
    }
  };

  const handleBack = () => {
    setView('upload');
    setCourses([]);
  }

  if (view === 'upload') {
    return <UploadView onPdfProcessed={handlePdfProcessed} />;
  }

  return <DataView courses={courses} onBack={handleBack} />;
}
