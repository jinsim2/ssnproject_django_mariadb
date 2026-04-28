// src/pages/Register/components/TermsModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TERMS_DATA, type TermKey } from "./TermsContent";

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  termKey: TermKey | null; // 현재 선택된 약관 키
}

export function TermsModal({ open, onOpenChange, termKey }: TermsModalProps) {
  // 키에 해당하는 데이터 가져오기 (없으면 빈 객체)
  const data = termKey ? TERMS_DATA[termKey] : null;

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[700px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{data.title}</DialogTitle>
          <DialogDescription className="sr-only">
            약관 상세 내용
          </DialogDescription>
        </DialogHeader>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-4 border rounded-md bg-slate-50 text-sm leading-relaxed whitespace-pre-wrap">
          {data.content}
        </div>

        <div className="text-center mt-4">
          {/* 닫기 버튼은 Dialog 기본 X 버튼이 있지만 필요하면 여기에 추가 */}
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-2 bg-slate-900 text-white rounded"
          >
            닫기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
