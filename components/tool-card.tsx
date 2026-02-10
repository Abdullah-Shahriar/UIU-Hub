import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import Link from "next/link";
import { ReactNode } from "react";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: ReactNode;
  status?: "available" | "coming-soon";
}

export const ToolCard = ({
  title,
  description,
  href,
  icon,
  status = "available",
}: ToolCardProps) => {
  return (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex gap-3 px-4 sm:px-6">
        <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
          {icon}
        </div>
        <div className="flex flex-col min-w-0">
          <p className="text-base sm:text-lg font-semibold">{title}</p>
          {status === "coming-soon" && (
            <Chip size="sm" color="warning" variant="flat">
              Coming Soon
            </Chip>
          )}
        </div>
      </CardHeader>
      <CardBody className="px-4 sm:px-6">
        <p className="text-default-500 text-sm sm:text-base">{description}</p>
      </CardBody>
      <CardFooter className="px-4 sm:px-6 pb-4">
        {status === "available" ? (
          <Button as={Link} href={href} color="primary" variant="flat" className="w-full">
            Open Tool
          </Button>
        ) : (
          <Button isDisabled color="default" variant="flat" className="w-full">
            Coming Soon
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
