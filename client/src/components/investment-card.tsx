import { BusinessCard } from "./business-card";
import { INVESTOR_TYPE_LABELS } from "@shared/constants";

interface InvestmentCardProps {
  id: number;
  title: string;
  organization: string | null;
  investorType: string;
  investmentScale: string | null;
  targetStage: string | null;
  endDate: string | null;
  status: string;
}

export function InvestmentCard(props: InvestmentCardProps) {
  return (
    <BusinessCard
      type="investment"
      id={props.id}
      title={props.title}
      status={props.status}
      endDate={props.endDate}
      organization={props.organization}
      amount={props.investmentScale}
      typeLabel={INVESTOR_TYPE_LABELS[props.investorType] || props.investorType}
    />
  );
}
