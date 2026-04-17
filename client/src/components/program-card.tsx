import { BusinessCard } from "./business-card";
import { SUPPORT_TYPE_LABELS } from "@shared/constants";

interface ProgramCardProps {
  id: number;
  title: string;
  organization: string | null;
  supportType: string;
  status: string;
  region: string | null;
  endDate: string | null;
  supportAmount: string | null;
}

export function ProgramCard(props: ProgramCardProps) {
  return (
    <BusinessCard
      type="government"
      id={props.id}
      title={props.title}
      status={props.status}
      endDate={props.endDate}
      organization={props.organization}
      region={props.region}
      amount={props.supportAmount}
      typeLabel={SUPPORT_TYPE_LABELS[props.supportType] || props.supportType}
    />
  );
}
