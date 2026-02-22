import { X } from 'lucide-react';
import { useEffect } from 'react';

interface MotivationalPopupProps {
  message: string;
  onClose: () => void;
}

export default function MotivationalPopup({ message, onClose }: MotivationalPopupProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-card p-8 rounded-2xl max-w-md mx-4 animate-slide-up shadow-2xl">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-2xl font-bold text-white">Well Done!</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <p className="text-lg text-gray-300">{message}</p>
        <div className="mt-6 flex justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      </div>
    </div>
  );
}
