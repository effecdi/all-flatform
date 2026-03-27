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
  const statusColorClass = props.status === '완료' ? 'text-portfolio-secondary' : 'text-portfolio-primary';

  return (
    <div className="relative overflow-hidden rounded-xl bg-portfolio-card shadow-card-soft hover:shadow-card-hover transition-all duration-300 ease-in-out group">
      {/* 상단 강조 바 (선택 사항) */}
      <div className="absolute top-0 left-0 w-full h-2 bg-portfolio-secondary group-hover:bg-portfolio-accent transition-colors duration-300"></div>
      
      <div className="p-6 flex flex-col h-full">
        {/* 타이틀 및 상태 */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-bold text-portfolio-text group-hover:text-portfolio-secondary transition-colors duration-300">
            {props.title}
          </h3>
          <span className={`text-sm font-semibold ${statusColorClass} px-3 py-1 rounded-full bg-portfolio-border`}>
            {props.status}
          </span>
        </div>

        {/* 핵심 정보 요약 */}
        <p className="text-portfolio-text-light text-sm mb-4 line-clamp-2">
          {props.organization && <span className="font-medium text-portfolio-text">{props.organization}</span>}
          {props.organization && props.supportType && <span className="mx-1">·</span>}
          {SUPPORT_TYPE_LABELS[props.supportType] || props.supportType}
        </p>

        {/* 상세 정보 그리드 */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-portfolio-text-light mt-auto pt-4 border-t border-portfolio-border">
          <div>
            <span className="block text-xs uppercase font-semibold text-portfolio-text-light">유형</span>
            <span className="font-medium text-portfolio-text">{SUPPORT_TYPE_LABELS[props.supportType] || props.supportType}</span>
          </div>
          {props.supportAmount && (
            <div>
              <span className="block text-xs uppercase font-semibold text-portfolio-text-light">지원금</span>
              <span className="font-medium text-portfolio-text">{props.supportAmount}</span>
            </div>
          )}
          {props.region && (
            <div>
              <span className="block text-xs uppercase font-semibold text-portfolio-text-light">지역</span>
              <span className="font-medium text-portfolio-text">{props.region}</span>
            </div>
          )}
          {props.endDate && (
            <div>
              <span className="block text-xs uppercase font-semibold text-portfolio-text-light">완료일</span>
              <span className="font-medium text-portfolio-text">{props.endDate}</span>
            </div>
          )}
        </div>

        {/* 카드 하단 추가 정보 또는 버튼 (선택 사항) */}
        {/* <div className="mt-4 text-right">
          <button className="text-portfolio-secondary hover:text-portfolio-accent text-sm font-semibold">상세 보기</button>
        </div> */}

      </div>
    </div>
  );
}
