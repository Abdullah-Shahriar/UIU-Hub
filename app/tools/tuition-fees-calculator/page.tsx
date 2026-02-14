"use client";

import { useState, useCallback } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { LuCalculator, LuRefreshCw, LuGraduationCap, LuFileText } from "react-icons/lu";

// Undergraduate Programs Data
const undergraduatePrograms = [
  {
    code: "BBA",
    name: "Bachelor of Business Administration",
    totalCredit: 125,
    perCreditFee: 6500,
    duration: "12 Trimester",
    baseFee: {
      semester: 13514000,
      waiver25: 13712250,
      waiver32: 13510500,
      noWaiver: 13810500
    }
  },
  {
    code: "BA(Hons)",
    name: "Bachelor of Arts (Honours)",
    totalCredit: 125,
    perCreditFee: 6500,
    duration: "12 Trimester",
    baseFee: {
      semester: 13514000,
      waiver25: 13712250,
      waiver32: 13510500,
      noWaiver: 13810500
    }
  },
  {
    code: "BSECO",
    name: "Bachelor of Science in Economics",
    totalCredit: 122,
    perCreditFee: 6500,
    duration: "12 Trimester",
    baseFee: {
      semester: 13504250,
      waiver25: 13697625,
      waiver32: 13497500,
      noWaiver: 13491600
    }
  },
  {
    code: "BSSEDS",
    name: "Bachelor of Social Science in Educational Development Studies",
    totalCredit: 123,
    perCreditFee: 6500,
    duration: "12 Semester",
    baseFee: {
      semester: 13517750,
      waiver25: 13707775,
      waiver32: 13507500,
      noWaiver: 13497500
    }
  },
  {
    code: "BSCSE",
    name: "Bachelor of Science in Computer Science & Engineering",
    totalCredit: 138,
    perCreditFee: 6500,
    duration: "12 Trimester",
    baseFee: {
      semester: 13546000,
      waiver25: 13748000,
      waiver32: 13540500,
      noWaiver: 13555000
    }
  },
  {
    code: "BSDS",
    name: "Bachelor of Science in Data Science",
    totalCredit: 138,
    perCreditFee: 6500,
    duration: "12 Trimester",
    baseFee: {
      semester: 13547500,
      waiver25: 13750250,
      waiver32: 13542000,
      noWaiver: 13558000
    }
  },
  {
    code: "BSEEE",
    name: "Bachelor of Science in Electrical & Electronic Engineering",
    totalCredit: 140,
    perCreditFee: 6500,
    duration: "12 Trimester",
    baseFee: {
      semester: 13560000,
      waiver25: 13780500,
      waiver32: 13550500,
      noWaiver: 13510000
    }
  },
  {
    code: "BSc",
    name: "Bachelor of Science",
    totalCredit: 141.5,
    perCreditFee: 6500,
    duration: "8 Semester",
    baseFee: {
      semester: 13609875,
      waiver25: 13846212.50,
      waiver32: 13604750,
      noWaiver: 0
    }
  },
  {
    code: "Civil",
    name: "Bachelor of Science in Civil Engineering",
    totalCredit: 160,
    perCreditFee: 6500,
    duration: "12 Trimester",
    baseFee: {
      semester: 13521000,
      waiver25: 13571500,
      noWaiver: 13528000
    }
  },
  {
    code: "CSD",
    name: "Bachelor of Science in Computer Science & Design",
    totalCredit: 123,
    perCreditFee: 5525,
    duration: "8 Semester",
    baseFee: {
      semester: 13446075,
      waiver25: 13614325,
      waiver32: 13434133,
      noWaiver: 13477375
    }
  },
  {
    code: "BA_English",
    name: "BA in English",
    totalCredit: 126,
    perCreditFee: 5525,
    duration: "8 Semester",
    baseFee: {
      semester: 13444125,
      waiver25: 13611625,
      waiver32: 13432250,
      noWaiver: 13416250
    }
  },
  {
    code: "BSSMSI",
    name: "Bachelor of Social Science in Media Studies & Journalism",
    totalCredit: 126,
    perCreditFee: 5525,
    duration: "8 Semester",
    baseFee: {
      semester: 13446075,
      waiver25: 13614813,
      noWaiver: 13416250
    }
  },
  {
    code: "BSBGE",
    name: "BSc in Biotechnology & Genetic Engineering",
    totalCredit: 140,
    perCreditFee: 6500,
    duration: "8 Semester",
    baseFee: {
      semester: 13583500,
      waiver25: 13697750,
      noWaiver: 13522000
    }
  }
];

// Graduate Programs Data
const graduatePrograms = [
  {
    code: "MBA",
    name: "Master of Business Administration",
    totalCredit: 60,
    perCreditFee: 6500,
    totalTrimester: 6,
    baseFee: {
      waiver25: "Tk 1,92,500 (30 Cr)",
      waiver32: "Tk 2,61,000 (30 Cr)",
      noWaiver: "Tk 3,21,000 (30 Cr)"
    }
  },
  {
    code: "EMBA",
    name: "Executive Master of Business Administration",
    totalCredit: 45,
    perCreditFee: 6500,
    totalTrimester: 5,
    baseFee: {
      waiver25: "Tk 1,92,500 (30 Cr)",
      waiver32: "Tk 2,61,000 (30 Cr)",
      noWaiver: "Tk 3,45,000 (45 Cr)"
    }
  },
  {
    code: "MScEO",
    name: "Master of Science in Economics",
    totalCredit: 30,
    perCreditFee: 6500,
    totalTrimester: 4,
    baseFee: {
      thesis: "Tk 1,97,000 (Thesis Based)",
      researchPaper: "Tk 2,41,000",
      thesisResearch: "Tk 2,41,000 (Thesis & Research Paper Based)"
    }
  },
  {
    code: "MDS",
    name: "Master of Development Studies",
    totalCredit: 39,
    perCreditFee: 6500,
    totalTrimester: 4,
    baseFee: {
      courseBased: "Tk 2,36,125 (Course Based)",
      thesis: "Tk 2,57,500",
      courseThesis: "Tk 6,882500 (Course & Thesis Based)"
    }
  },
  {
    code: "MDcSE",
    name: "Master of Science in Computer Science & Engineering",
    totalCredit: 36,
    perCreditFee: 6500,
    totalTrimester: 4,
    baseFee: {
      theoryBased: "Tk 2,51,500 (Theory Based)",
      project: "Tk 2,80,000",
      theoryProject: "Tk 9,661250 (Theory, Project, Thesis Based)"
    }
  }
];

// Additional Fees
const additionalFees = {
  admission: 20000,
  cautionMoney: 20000,
  laboratoryPerSemester: 5000,
  bPharmaDiplomaFee: 9750
};

export default function TuitionFeesCalculatorPage() {
  const [programType, setProgramType] = useState<"undergraduate" | "graduate">("undergraduate");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [waiverType, setWaiverType] = useState<"none" | "25" | "32" | "100">("none");
  const [completedCredits, setCompletedCredits] = useState("");
  const [remainingCredits, setRemainingCredits] = useState("");
  const [includeAdditionalFees, setIncludeAdditionalFees] = useState(false);

  const getCurrentProgram = useCallback(() => {
    if (programType === "undergraduate") {
      return undergraduatePrograms.find(p => p.code === selectedProgram);
    } else {
      return graduatePrograms.find(p => p.code === selectedProgram);
    }
  }, [programType, selectedProgram]);

  const calculateFees = useCallback(() => {
    const program = getCurrentProgram();
    if (!program) return null;

    let perCreditFee = program.perCreditFee;
    let creditsToCalculate = parseFloat(remainingCredits) || program.totalCredit;
    
    // Apply waiver
    if (waiverType === "25") {
      perCreditFee = perCreditFee * 0.75;
    } else if (waiverType === "32") {
      perCreditFee = perCreditFee * 0.68;
    } else if (waiverType === "100") {
      perCreditFee = 0;
    }

    const tuitionFee = creditsToCalculate * perCreditFee;
    let totalFee = tuitionFee;

    // Add additional fees if selected
    let additionalTotal = 0;
    if (includeAdditionalFees) {
      additionalTotal = additionalFees.admission + additionalFees.cautionMoney;
      if (programType === "undergraduate") {
        // Estimate lab fees (assume 12 semesters for undergraduate)
        const estimatedSemesters = Math.ceil(creditsToCalculate / (program.totalCredit / 12));
        additionalTotal += additionalFees.laboratoryPerSemester * estimatedSemesters;
      }
      totalFee += additionalTotal;
    }

    return {
      perCreditFee: program.perCreditFee,
      discountedPerCredit: perCreditFee,
      creditsToCalculate,
      tuitionFee,
      additionalFees: additionalTotal,
      totalFee,
      waiverAmount: (program.perCreditFee - perCreditFee) * creditsToCalculate
    };
  }, [getCurrentProgram, remainingCredits, waiverType, includeAdditionalFees, programType]);

  const handleReset = useCallback(() => {
    setSelectedProgram("");
    setWaiverType("none");
    setCompletedCredits("");
    setRemainingCredits("");
    setIncludeAdditionalFees(false);
  }, []);

  const fees = calculateFees();
  const currentProgram = getCurrentProgram();

  return (
    <section className="flex flex-col items-center gap-6 sm:gap-8 py-6 sm:py-8 md:py-12 px-4">
      <div className="text-center max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 text-primary">
            <LuCalculator size={32} />
          </div>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          UIU Tuition Fees Calculator
        </h1>
        <p className="mt-2 sm:mt-3 text-sm sm:text-base text-default-500">
          Calculate your tuition fees based on UIU&apos;s official fee structure. 
          Select your program, waiver type, and get an accurate estimate.
        </p>
      </div>

      <div className="w-full max-w-6xl space-y-6">
        {/* Program Selection Card */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex items-center gap-3">
              <LuGraduationCap size={24} className="text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Program Selection</h2>
                <p className="text-sm text-default-500">Choose your program and waiver type</p>
              </div>
            </div>
            <Button
              color="danger"
              variant="flat"
              startContent={<LuRefreshCw size={18} />}
              onPress={handleReset}
              size="sm"
            >
              Reset
            </Button>
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            {/* Program Type Selection */}
            <div className="flex gap-3">
              <Button
                color={programType === "undergraduate" ? "primary" : "default"}
                variant={programType === "undergraduate" ? "solid" : "flat"}
                onPress={() => {
                  setProgramType("undergraduate");
                  setSelectedProgram("");
                }}
                className="flex-1"
              >
                Undergraduate
              </Button>
              <Button
                color={programType === "graduate" ? "primary" : "default"}
                variant={programType === "graduate" ? "solid" : "flat"}
                onPress={() => {
                  setProgramType("graduate");
                  setSelectedProgram("");
                }}
                className="flex-1"
              >
                Graduate
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Program Selection */}
              <Select
                label="Select Program"
                placeholder="Choose your program"
                selectedKeys={selectedProgram ? [selectedProgram] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setSelectedProgram(selected);
                  setRemainingCredits("");
                }}
                className="w-full"
              >
                {(programType === "undergraduate" ? undergraduatePrograms : graduatePrograms).map((program) => (
                  <SelectItem key={program.code}>
                    {program.code} - {program.name}
                  </SelectItem>
                ))}
              </Select>

              {/* Waiver Type Selection */}
              <Select
                label="Waiver Type"
                placeholder="Select waiver percentage"
                selectedKeys={waiverType ? [waiverType] : []}
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as "none" | "25" | "32" | "100";
                  setWaiverType(selected);
                }}
                className="w-full"
              >
                <SelectItem key="none">
                  No Waiver (0%)
                </SelectItem>
                <SelectItem key="25">
                  25% Waiver
                </SelectItem>
                <SelectItem key="32">
                  32% Waiver
                </SelectItem>
                <SelectItem key="100">
                  100% Waiver (Scholarship)
                </SelectItem>
              </Select>
            </div>

            {currentProgram && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="number"
                  label="Completed Credits (Optional)"
                  placeholder="0"
                  value={completedCredits}
                  onValueChange={setCompletedCredits}
                  description={`Total required: ${currentProgram.totalCredit} credits`}
                />
                <Input
                  type="number"
                  label="Remaining Credits (Optional)"
                  placeholder={`${currentProgram.totalCredit}`}
                  value={remainingCredits}
                  onValueChange={setRemainingCredits}
                  description="Leave empty to calculate for all credits"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="additionalFees"
                checked={includeAdditionalFees}
                onChange={(e) => setIncludeAdditionalFees(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
              />
              <label htmlFor="additionalFees" className="text-sm text-default-600">
                Include additional fees (Admission, Caution Money, Lab Fees)
              </label>
            </div>
          </CardBody>
        </Card>

        {/* Results Card */}
        {currentProgram && fees && (
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <LuFileText size={24} className="text-primary" />
                <div>
                  <h2 className="text-xl font-semibold">Fee Breakdown</h2>
                  <p className="text-sm text-default-500">
                    {currentProgram.code} - {currentProgram.name}
                  </p>
                </div>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="gap-4">
              {/* Program Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-default-500">Total Credits</p>
                  <p className="text-2xl font-bold text-primary">
                    {currentProgram.totalCredit}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-default-500">Duration</p>
                  <p className="text-2xl font-bold text-primary">
                    {'duration' in currentProgram ? currentProgram.duration : `${(currentProgram as any).totalTrimester} Trimesters`}
                  </p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-sm text-default-500">Per Credit Fee</p>
                  <p className="text-2xl font-bold text-primary">
                    Tk {currentProgram.perCreditFee.toLocaleString()}
                  </p>
                </div>
              </div>

              <Divider />

              {/* Fee Calculation */}
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-default-600">Credits to Calculate</span>
                  <span className="font-semibold">{fees.creditsToCalculate} credits</span>
                </div>

                {waiverType !== "none" && (
                  <>
                    <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                      <span className="text-default-600">Original Per Credit Fee</span>
                      <span className="font-semibold">Tk {fees.perCreditFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="text-success-600 flex items-center gap-2">
                        <Chip color="success" size="sm" variant="flat">
                          {waiverType === "100" ? "100%" : `${waiverType}%`} Waiver
                        </Chip>
                        Discounted Per Credit Fee
                      </span>
                      <span className="font-semibold text-success-600">
                        Tk {fees.discountedPerCredit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                      <span className="text-success-600">Total Waiver Amount</span>
                      <span className="font-semibold text-success-600">
                        - Tk {fees.waiverAmount.toLocaleString()}
                      </span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-default-600">Tuition Fee</span>
                  <span className="font-semibold">Tk {fees.tuitionFee.toLocaleString()}</span>
                </div>

                {includeAdditionalFees && fees.additionalFees > 0 && (
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <span className="text-default-600">Additional Fees</span>
                    <span className="font-semibold">Tk {fees.additionalFees.toLocaleString()}</span>
                  </div>
                )}

                <Divider />

                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                  <span className="text-lg font-semibold text-primary">Total Estimated Fee</span>
                  <span className="text-2xl font-bold text-primary">
                    Tk {fees.totalFee.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Additional Information Card */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Additional Fee Information</h3>
          </CardHeader>
          <Divider />
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-default-700 mb-2">One-Time Fees:</p>
                <ul className="space-y-1 text-default-600">
                  <li>• Admission Fee: Tk {additionalFees.admission.toLocaleString()}</li>
                  <li>• Caution Money: Tk {additionalFees.cautionMoney.toLocaleString()} (Refundable)</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-default-700 mb-2">Recurring Fees:</p>
                <ul className="space-y-1 text-default-600">
                  <li>• Laboratory Fee: Tk {additionalFees.laboratoryPerSemester.toLocaleString()} per semester</li>
                  <li>• B.Pharm Diploma: Tk {additionalFees.bPharmaDiplomaFee.toLocaleString()}</li>
                </ul>
              </div>
            </div>
            <Divider className="my-4" />
            <div className="text-xs text-default-500">
              <p>
                <strong>Note:</strong> This calculator provides an estimate based on the current fee structure. 
                Actual fees may vary. Please contact the UIU Accounts Department for official fee confirmation.
                Fees are subject to change without prior notice.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
