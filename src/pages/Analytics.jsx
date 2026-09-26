import React from 'react';
import { useReports } from '../context/ReportContext';
import { DIVISION_DISTRICTS } from '../data/initialData';
import { Bar, Doughnut, Line, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler
);

const DIVISION_NAMES = {
  'ঢাকা বিভাগ': { bn: 'ঢাকা', en: 'Dhaka' },
  'চট্টগ্রাম বিভাগ': { bn: 'চট্টগ্রাম', en: 'Chittagong' },
  'রাজশাহী বিভাগ': { bn: 'রাজশাহী', en: 'Rajshahi' },
  'খুলনা বিভাগ': { bn: 'খুলনা', en: 'Khulna' },
  'বরিশাল বিভাগ': { bn: 'বরিশাল', en: 'Barisal' },
  'সিলেট বিভাগ': { bn: 'সিলেট', en: 'Sylhet' },
  'রংপুর বিভাগ': { bn: 'রংপুর', en: 'Rangpur' },
  'ময়মনসিংহ বিভাগ': { bn: 'ময়মনসিংহ', en: 'Mymensingh' }
};

const CATEGORY_NAMES = {
  'ভূমি অফিস': { bn: 'ভূমি অফিস', en: 'Land Office' },
  'পাসপোর্ট অফিস': { bn: 'পাসপোর্ট অফিস', en: 'Passport Office' },
  'বিআরটিএ': { bn: 'বিআরটিএ', en: 'BRTA' },
  'ট্রাফিক পুলিশ': { bn: 'ট্রাফিক পুলিশ', en: 'Traffic Police' },
  'কাস্টমস অফিস': { bn: 'কাস্টমস অফিস', en: 'Customs Office' },
  'কর অফিস': { bn: 'কর ও ভ্যাট', en: 'Tax & VAT' },
  'কর ও ভ্যাট অফিস': { bn: 'কর ও ভ্যাট', en: 'Tax & VAT' },
  'সিটি কর্পোরেশন': { bn: 'সিটি কর্পোরেশন', en: 'City Corporation' },
  'সাব-রেজিস্ট্রি অফিস': { bn: 'সাব-রেজিস্ট্রি অফিস', en: 'Sub-Registry' },
  'শিক্ষা অফিস': { bn: 'শিক্ষা অফিস', en: 'Education' },
  'সরকারি হাসপাতাল': { bn: 'হাসপাতাল', en: 'Hospital' },
  'অন্যান্য সরকারি সেবা': { bn: 'অন্যান্য সরকারি সেবা', en: 'Other Public' },
  'চেয়ারম্যান / মেয়র': { bn: 'চেয়ারম্যান / মেয়র', en: 'Chairman / Mayor' },
  'ওয়ার্ড মেম্বার': { bn: 'ওয়ার্ড মেম্বার', en: 'Ward Member' },
  'হাসপাতাল / ক্লিনিক (প্রাইভেট)': { bn: 'প্রাইভেট হাসপাতাল', en: 'Private Clinic' },
  'মাস্তানি / চাঁদাবাজি': { bn: 'চাঁদাবাজি', en: 'Extortion' }
};

const DISTRICT_NAMES = {
  'ঢাকা': 'Dhaka',
  'চট্টগ্রাম': 'Chittagong',
  'রাজশাহী': 'Rajshahi',
  'খুলনা': 'Khulna',
  'সিলেট': 'Sylhet',
  'বরিশাল': 'Barisal',
  'রংপুর': 'Rangpur',
  'ময়মনসিংহ': 'Mymensingh',
  'গাজীপুর': 'Gazipur',
  'নাটোর': 'Natore',
  'ভোলা': 'Bhola',
  'কুমিল্লা': 'Comilla',
  'কক্সবাজার': "Cox's Bazar"
};

const Analytics = () => {
  const { reports, t, lang } = useReports();

  // 1. Division Bar Data
  const divCounts = {};
  reports.forEach(b => { divCounts[b.division] = (divCounts[b.division] || 0) + 1; });
  const divLabels = Object.keys(divCounts).map(d => DIVISION_NAMES[d]?.[lang] || d.replace(' বিভাগ', ''));

  const divBarData = {
    labels: divLabels,
    datasets: [{
      label: lang === 'bn' ? 'অভিযোগ সংখ্যা' : 'Reports Count',
      data: Object.values(divCounts),
      backgroundColor: '#006A4E',
      borderRadius: 6
    }]
  };

  // 2. Outcome Doughnut Data
  const pCount = reports.filter(b => b.outcome === 'পরিশোধিত' || b.outcome === 'Paid').length;
  const rCount = reports.filter(b => b.outcome === 'প্রত্যাখ্যাত' || b.outcome === 'Refused').length;
  const mCount = reports.filter(b => b.outcome === 'দাবি মুলতুবি' || b.outcome === 'ভুক্তভোগী' || b.outcome === 'Pending').length;

  const outcomeDoughnutData = {
    labels: lang === 'bn' ? ['পরিশোধিত (Paid)', 'প্রত্যাখ্যাত (Refused)', 'দাবি মুলতুবি (Pending)'] : ['Paid', 'Refused', 'Pending'],
    datasets: [{
      data: [pCount, rCount, mCount],
      backgroundColor: ['#F42A41', '#006A4E', '#f59e0b']
    }]
  };

  // 3. District Amount Horizontal Bar Data
  const distAmounts = {};
  reports.forEach(b => { distAmounts[b.district] = (distAmounts[b.district] || 0) + b.amount; });
  const sortedDists = Object.entries(distAmounts).sort((a,b) => b[1] - a[1]).slice(0, 10);

  const districtAmountData = {
    labels: sortedDists.map(x => (lang === 'en' ? (DISTRICT_NAMES[x[0]] || x[0]) : x[0])),
    datasets: [{
      label: lang === 'bn' ? 'মোট দাবিকৃত ঘুষ (৳)' : 'Total Bribe Demanded (৳)',
      data: sortedDists.map(x => x[1]),
      backgroundColor: '#F42A41',
      borderRadius: 6
    }]
  };

  // 4. Department Amount Pie Data
  const deptSums = {};
  reports.forEach(b => { deptSums[b.category] = (deptSums[b.category] || 0) + b.amount; });

  const deptPieData = {
    labels: Object.keys(deptSums).map(k => CATEGORY_NAMES[k]?.[lang] || k),
    datasets: [{
      data: Object.values(deptSums),
      backgroundColor: ['#006A4E', '#F42A41', '#0284c7', '#ca8a04', '#7c3aed', '#059669', '#d97706', '#64748b']
    }]
  };

  // 5. Monthly Trend Line Data
  const monthSums = {};
  reports.forEach(b => { monthSums[b.month] = (monthSums[b.month] || 0) + b.amount; });

  const monthlyTrendData = {
    labels: Object.keys(monthSums),
    datasets: [{
      label: lang === 'bn' ? 'মোট দাবিকৃত ঘুষ (৳)' : 'Total Demanded Amount (৳)',
      data: Object.values(monthSums),
      borderColor: '#006A4E',
      backgroundColor: 'rgba(0, 106, 78, 0.1)',
      fill: true,
      tension: 0.3,
      borderWidth: 3
    }]
  };

  // 6. Stacked Division vs Outcome Data
  const divs = Object.keys(DIVISION_DISTRICTS);
  const paidData = divs.map(d => reports.filter(b => b.division === d && (b.outcome === 'পরিশোধিত' || b.outcome === 'Paid')).length);
  const refusedData = divs.map(d => reports.filter(b => b.division === d && (b.outcome === 'প্রত্যাখ্যাত' || b.outcome === 'Refused')).length);
  const pendingData = divs.map(d => reports.filter(b => b.division === d && (b.outcome === 'দাবি মুলতুবি' || b.outcome === 'ভুক্তভোগী' || b.outcome === 'Pending')).length);

  const stackedDivData = {
    labels: divs.map(d => DIVISION_NAMES[d]?.[lang] || d.replace(' বিভাগ', '')),
    datasets: [
      { label: lang === 'bn' ? 'পরিশোধিত' : 'Paid', data: paidData, backgroundColor: '#F42A41' },
      { label: lang === 'bn' ? 'প্রত্যাখ্যাত' : 'Refused', data: refusedData, backgroundColor: '#006A4E' },
      { label: lang === 'bn' ? 'মুলতুবি' : 'Pending', data: pendingData, backgroundColor: '#f59e0b' }
    ]
  };

  // 7. Radar Chart Data
  const radarData = {
    labels: divLabels,
    datasets: [{
      label: lang === 'bn' ? 'রিপোর্ট ঘনত্ব সূচক' : 'Report Density Index',
      data: Object.values(divCounts),
      backgroundColor: 'rgba(0, 106, 78, 0.2)',
      borderColor: '#006A4E',
      pointBackgroundColor: '#006A4E',
      borderWidth: 2
    }]
  };

  return (
    <div>
      <div className="bg-[#006A4E] py-12 px-4 text-white text-center">
        <h1 className="text-3xl font-extrabold mb-2">{t.analyticsTitle}</h1>
        <p className="text-green-200 text-sm">{t.analyticsSubtitle}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
        {/* Row 1: Division Bar & Outcome Doughnut */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-3xl shadow p-6 border border-gray-100">
            <h3 className="font-extrabold text-gray-800 text-base mb-1">{t.chartDivReportsTitle}</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">Division-wise distribution</p>
            <div style={{ position: 'relative', height: '300px' }}>
              <Bar data={divBarData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl shadow p-6 border border-gray-100">
            <h3 className="font-extrabold text-gray-800 text-base mb-1">{t.chartOutcomeDoughnutTitle}</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">Paid vs Refused vs Pending</p>
            <div style={{ position: 'relative', height: '300px' }}>
              <Doughnut data={outcomeDoughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        {/* Row 2: Top Districts Horizontal Bar & Department Amount Pie */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-3xl shadow p-6 border border-gray-100">
            <h3 className="font-extrabold text-gray-800 text-base mb-1">{t.chartTopDistrictsTitle}</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">Top 10 affected districts by bribe volume</p>
            <div style={{ position: 'relative', height: '320px' }}>
              <Bar data={districtAmountData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-3xl shadow p-6 border border-gray-100">
            <h3 className="font-extrabold text-gray-800 text-base mb-1">{t.chartDeptPieTitle}</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">Category amount breakdown</p>
            <div style={{ position: 'relative', height: '320px' }}>
              <Pie data={deptPieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </div>
        </div>

        {/* Row 3: Monthly Trend Line */}
        <div className="bg-white rounded-3xl shadow p-6 border border-gray-100">
          <h3 className="font-extrabold text-gray-800 text-base mb-1">{t.chartMonthlyTrendTitle}</h3>
          <p className="text-xs text-gray-400 mb-4 font-mono">Time-series volume trend</p>
          <div style={{ position: 'relative', height: '280px' }}>
            <Line data={monthlyTrendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        {/* Row 4: Stacked Division-Outcome & Radar Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl shadow p-6 border border-gray-100">
            <h3 className="font-extrabold text-gray-800 text-base mb-1">{t.chartStackedOutcomeTitle}</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">Stacked outcome per division</p>
            <div style={{ position: 'relative', height: '300px' }}>
              <Bar data={stackedDivData} options={{ responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }} />
            </div>
          </div>
          <div className="bg-white rounded-3xl shadow p-6 border border-gray-100">
            <h3 className="font-extrabold text-gray-800 text-base mb-1">{t.chartRadarTitle}</h3>
            <p className="text-xs text-gray-400 mb-4 font-mono">Multi-axis comparative index</p>
            <div style={{ position: 'relative', height: '300px' }}>
              <Radar data={radarData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
