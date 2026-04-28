import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import DaumPostcodeEmbed from "react-daum-postcode";

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: any) => void;
}

function AddressModal({ isOpen, onClose, onComplete }: AddressModalProps) {
  const handleComplete = (data: any) => {
    onComplete(data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] p-0 overflow-hidden bg-white top-[50px] left-[50px] translate-x-0 translate-y-0">
        <DialogHeader className="p-4 bg-gray-50 border-b">
          <DialogTitle>주소 검색</DialogTitle>
        </DialogHeader>
        <div className="h-[450px]">
          <DaumPostcodeEmbed
            onComplete={handleComplete}
            style={{ width: "100%", height: "100%" }}
            autoClose={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
export { AddressModal };
