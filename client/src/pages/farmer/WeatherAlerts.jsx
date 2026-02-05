import FarmerLayout from '../../components/FarmerLayout.jsx';

const alerts = [
  { title: 'High humidity', detail: 'Expect fungal pressure after rainfall.' },
  { title: 'Wind advisory', detail: 'Secure greenhouses and irrigation lines.' }
];

export default function WeatherAlerts() {
  return (
    <FarmerLayout title="Weather & Alerts" subtitle="Plan field work with confidence">
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-900">7-day forecast</h2>
          <p className="text-sm text-slate-600">Daily outlook for your community.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { day: 'Mon', temp: '25°C', detail: 'Sunny' },
              { day: 'Tue', temp: '23°C', detail: 'Cloudy' },
              { day: 'Wed', temp: '22°C', detail: 'Light rain' },
              { day: 'Thu', temp: '26°C', detail: 'Sunny' },
              { day: 'Fri', temp: '24°C', detail: 'Windy' },
              { day: 'Sat', temp: '21°C', detail: 'Showers' },
              { day: 'Sun', temp: '27°C', detail: 'Warm' }
            ].map((item) => (
              <div key={item.day} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-xs text-slate-500">{item.day}</div>
                <div className="text-base font-semibold text-slate-900">{item.temp}</div>
                <div className="text-xs text-slate-600">{item.detail}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Active alerts</h2>
          <div className="mt-4 space-y-3">
            {alerts.map((alert) => (
              <div key={alert.title} className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div className="text-sm font-semibold text-amber-900">{alert.title}</div>
                <div className="mt-1 text-sm text-amber-800">{alert.detail}</div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl bg-agri-50 p-4 text-sm text-slate-700">
            Tip: Schedule spraying early morning when wind is calm.
          </div>
        </section>
      </div>
    </FarmerLayout>
  );
}
