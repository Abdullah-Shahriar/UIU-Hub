"use client";

import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { LuTrash2 } from "react-icons/lu";

import { Course } from "@/types";
import { GRADE_OPTIONS, CREDIT_OPTIONS } from "@/lib/grading";

interface CourseRowProps {
  course: Course;
  index: number;
  onUpdate: (field: keyof Course, value: string | number) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export const CourseRow = ({
  course,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: CourseRowProps) => {
  return (
    <div className="grid grid-cols-[40px_1fr_110px_140px_40px] gap-2 items-center">
      {/* Index — same height as inputs so it centers vertically */}
      <div className="hidden sm:flex items-center justify-center h-10 text-sm text-default-400 font-medium">
        {index}
      </div>

      {/* Course Name */}
      <div>
        <Input
          size="sm"
          variant="bordered"
          placeholder={`Course ${index}`}
          value={course.name}
          onChange={(e) => onUpdate("name", e.target.value)}
          aria-label="Course name"
          classNames={{
            inputWrapper: "h-10",
          }}
        />
      </div>

      {/* Credit Hours */}
      <div>
        <Select
          size="sm"
          variant="bordered"
          placeholder="Credit"
          selectedKeys={course.credit > 0 ? [String(course.credit)] : []}
          onChange={(e) => onUpdate("credit", parseFloat(e.target.value))}
          aria-label="Credit hours"
          classNames={{
            trigger: "h-10",
          }}
        >
          {CREDIT_OPTIONS.map((credit) => (
            <SelectItem key={String(credit)} textValue={String(credit)}>
              {credit.toFixed(1)} Cr
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Grade */}
      <div>
        <Select
          size="sm"
          variant="bordered"
          placeholder="Grade"
          selectedKeys={course.grade ? [course.grade] : []}
          onChange={(e) => onUpdate("grade", e.target.value)}
          aria-label="Grade"
          classNames={{
            trigger: "h-10",
          }}
        >
          {GRADE_OPTIONS.map((grade) => (
            <SelectItem key={grade.value} textValue={grade.label}>
              {grade.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Remove Button */}
      <div className="flex items-center justify-center h-10">
        <Button
          isIconOnly
          size="sm"
          variant="light"
          color="danger"
          onPress={onRemove}
          isDisabled={!canRemove}
          aria-label="Remove course"
        >
          <LuTrash2 size={14} />
        </Button>
      </div>
    </div>
  );
};
