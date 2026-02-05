import FarmerLayout from '../../components/FarmerLayout.jsx';
import ImageUpload from '../../components/ImageUpload.jsx';

export default function DiseaseDetection() {
  return (
    <FarmerLayout
      title="Disease Detection"
      subtitle="Upload a crop photo for quick AI diagnosis"
    >
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
        <ImageUpload />
      </div>
    </FarmerLayout>
  );
}
