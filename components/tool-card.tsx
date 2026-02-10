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
    <Card className="max-w-md w-full hover:shadow-lg transition-shadow">
      <CardHeader className="flex gap-3">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="flex flex-col">
          <p className="text-lg font-semibold">{title}</p>
          {status === "coming-soon" && (
            <Chip size="sm" color="warning" variant="flat">
              Coming Soon
            </Chip>
          )}
        </div>
      </CardHeader>
      <CardBody>
        <p className="text-default-500">{description}</p>
      </CardBody>
      <CardFooter>
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
