import { useNavigate } from 'react-router-dom';
import FarmerLayout from '../../components/FarmerLayout.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';

export default function DiseaseDetection() {
  const navigate = useNavigate();

  const handleAskAi = (detection) => {
    // Store detection in localStorage for AI Assistant to pick up
    localStorage.setItem('ach_lastDetection', JSON.stringify(detection));
    // Navigate to AI Assistant
    navigate('/farmer/ai-assistant', { 
      state: { fromDetection: true, detection } 
    });
  };

  return (
    <FarmerLayout
      title="Disease Detection"
      subtitle="Upload a crop photo for quick AI diagnosis"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <ImageUpload onAskAi={handleAskAi} />
      </div>
    </FarmerLayout>
  );
}
