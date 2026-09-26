import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useReports } from '../context/ReportContext';
import {
  DIVISION_DISTRICTS,
  COMPLAINT_TYPES,
  TYPE_CATEGORIES,
  CATEGORY_NAMES_TRANSLATION,
  DIVISION_NAMES_TRANSLATION,
} from '../data/initialData';
import { Send, AlertTriangle, Upload, ImagePlus, Trash2, Eye, EyeOff, User, ShieldCheck, Loader2 } from 'lucide-react';
import { uploadMultipleImagesToImgBB } from '../utils/uploadImage';

const COMPLAINT_TYPE_TRANSLATIONS = {
  government: {
    label: { bn: '🏛️ সরকারি দপ্তর / কর্মকর্তা', en: '🏛️ Government Dept / Official' },
    description: {
      bn: 'সরকারি অফিস, সেবা, কর্মকর্তা/কর্মচারী সংক্রান্ত ঘুষ ও দুর্নীতি',
      en: 'Bribery and corruption regarding govt offices, services and public servants'
    },
    amountLabel: { bn: 'দাবিকৃত ঘুষের পরিমাণ (টাকা)', en: 'Demanded Bribe Amount (BDT)' },
    amountHint: { bn: 'কত টাকা অতিরিক্ত দাবি করা হয়েছিল', en: 'How much extra money was demanded' },
    categoryLabel: { bn: 'দপ্তর শ্রেণি', en: 'Department Category' },
    officeLabel: { bn: 'নির্দিষ্ট অফিস', en: 'Specific Office' },
    officePlaceholder: { bn: 'যেমন: উপজেলা ভূমি অফিস', en: 'e.g. Upazila Land Office' },
    officialLabel: { bn: 'অভিযুক্ত কর্মকর্তা', en: 'Accused Official' },
    officialPlaceholder: { bn: 'নাম (জানা থাকলে)', en: 'Name (if known)' },
    postLabel: { bn: 'পদবি', en: 'Designation' },
    postPlaceholder: { bn: 'যেমন: সাব-রেজিস্ট্রার', en: 'e.g. Sub-Registrar' },
    contentPlaceholder: {
      bn: 'কী সেবা নিতে গিয়েছিলেন? কখন ঘটেছে? কীভাবে টাকা দাবি করা হয়েছিল? বিস্তারিত লিখুন।',
      en: 'What service did you seek? When did it happen? How was the bribe demanded? Write in detail.'
    }
  },
  political: {
    label: { bn: '🏴 রাজনৈতিক নেতা / দল', en: '🏴 Political Leader / Party' },
    description: {
      bn: 'এলাকার রাজনৈতিক নেতা, দলীয় কর্মী, ক্ষমতার অপব্যবহার',
      en: 'Local political leaders, party cadres, extortion & abuse of power'
    },
    amountLabel: { bn: 'আর্থিক ক্ষতি / চাঁদা (টাকা)', en: 'Financial Loss / Extortion (BDT)' },
    amountHint: { bn: 'কত টাকার ক্ষতি বা চাঁদা আদায় হয়েছে', en: 'Amount of extortion or monetary loss' },
    categoryLabel: { bn: 'অভিযুক্তের পদমর্যাদা', en: 'Rank of Accused' },
    officeLabel: { bn: 'এলাকা / সংগঠন', en: 'Area / Organization' },
    officePlaceholder: { bn: 'যেমন: পবা উপজেলা আওয়ামী লীগ', en: 'e.g. Local Party Office' },
    officialLabel: { bn: 'অভিযুক্ত নেতা / ব্যক্তি', en: 'Accused Leader / Person' },
    officialPlaceholder: { bn: 'নাম (জানা থাকলে)', en: 'Name (if known)' },
    postLabel: { bn: 'পদবি / পরিচয়', en: 'Designation / Identity' },
    postPlaceholder: { bn: 'যেমন: ইউপি চেয়ারম্যান', en: 'e.g. Union Chairman' },
    contentPlaceholder: {
      bn: 'কী অন্যায় করেছে? কখন, কোথায় ঘটেছে? কীভাবে প্রভাব খাটিয়েছে? বিস্তারিত লিখুন।',
      en: 'What injustice took place? When and where? How was influence misused? Write in detail.'
    }
  },
  private: {
    label: { bn: '🏢 বেসরকারি / ব্যবসায়িক', en: '🏢 Private / Corporate' },
    description: {
      bn: 'বেসরকারি প্রতিষ্ঠান, ব্যবসায়ী, এনজিও, ব্যাংক সংক্রান্ত প্রতারণা',
      en: 'Private companies, businesses, NGOs, banking scams & fraud'
    },
    amountLabel: { bn: 'আর্থিক ক্ষতির পরিমাণ (টাকা)', en: 'Financial Loss Amount (BDT)' },
    amountHint: { bn: 'প্রতারণা বা অতিরিক্ত আদায়ের পরিমাণ', en: 'Amount of fraud or overcharging' },
    categoryLabel: { bn: 'প্রতিষ্ঠানের ধরন', en: 'Institution Type' },
    officeLabel: { bn: 'প্রতিষ্ঠানের নাম', en: 'Company / Organization Name' },
    officePlaceholder: { bn: 'যেমন: XYZ হাসপাতাল / ABC ব্যাংক', en: 'e.g. XYZ Hospital / ABC Bank' },
    officialLabel: { bn: 'অভিযুক্ত ব্যক্তি', en: 'Accused Person' },
    officialPlaceholder: { bn: 'নাম (জানা থাকলে)', en: 'Name (if known)' },
    postLabel: { bn: 'পদবি / পরিচয়', en: 'Designation / Role' },
    postPlaceholder: { bn: 'যেমন: ম্যানেজার / মালিক', en: 'e.g. Manager / Owner' },
    contentPlaceholder: {
      bn: 'কী ধরনের প্রতারণা বা অন্যায় হয়েছে? কখন ঘটেছে? বিস্তারিত লিখুন।',
      en: 'What kind of deception or injustice occurred? When did it happen? Write in detail.'
    }
  },
  social: {
    label: { bn: '👥 সামাজিক অন্যায় / নির্যাতন', en: '👥 Social Injustice / Oppression' },
    description: {
      bn: 'এলাকার প্রভাবশালী, মাস্তানি, জমি দখল, হয়রানি ও অন্যায়',
      en: 'Local muscle power, land grabbing, extortion & social harassment'
    },
    amountLabel: { bn: 'আর্থিক ক্ষতির পরিমাণ (টাকা)', en: 'Financial Loss (BDT)' },
    amountHint: { bn: 'আর্থিক ক্ষতি থাকলে লিখুন, না থাকলে ০ দিন', en: 'Enter amount if applicable, or 0' },
    categoryLabel: { bn: 'অন্যায়ের ধরন', en: 'Nature of Injustice' },
    officeLabel: { bn: 'ঘটনাস্থল / প্রতিষ্ঠান', en: 'Location / Incident Place' },
    officePlaceholder: { bn: 'যেমন: গ্রাম সালিশ / বাজার', en: 'e.g. Village Market / Arbitration' },
    officialLabel: { bn: 'অভিযুক্ত ব্যক্তি', en: 'Accused Person' },
    officialPlaceholder: { bn: 'নাম (জানা থাকলে)', en: 'Name (if known)' },
    postLabel: { bn: 'পরিচয় / সম্পর্ক', en: 'Identity / Relation' },
    postPlaceholder: { bn: 'যেমন: প্রভাবশালী / মাস্তান', en: 'e.g. Influential / Extortionist' },
    contentPlaceholder: {
      bn: 'কী অন্যায় হয়েছে? কার সাথে ঘটেছে? কখন, কোথায়? বিস্তারিত লিখুন।',
      en: 'What injustice occurred? To whom? When and where? Write in detail.'
    }
  }
};

// Category & division name translations now come from ../data/initialData
// (shared with Ledger.jsx so both places stay in sync automatically)

const OUTCOME_OPTIONS = {
  government: [
    { value: 'পরিশোধিত', label: { bn: '🔴 পরিশোধ করতে বাধ্য হয়েছি (Paid)', en: '🔴 Forced to Pay (Paid)' } },
    { value: 'প্রত্যাখ্যাত', label: { bn: '✅ প্রত্যাখ্যান করেছি (Refused)', en: '✅ Refused to Pay (Refused)' } },
    { value: 'দাবি মুলতুবি', label: { bn: '🟡 এখনো দাবি মুলতুবি আছে (Pending)', en: '🟡 Demand is Pending (Pending)' } },
  ],
  political: [
    { value: 'পরিশোধিত', label: { bn: '🔴 চাঁদা/টাকা দিতে বাধ্য হয়েছি', en: '🔴 Forced to pay extortion' } },
    { value: 'প্রত্যাখ্যাত', label: { bn: '✅ প্রতিবাদ / প্রত্যাখ্যান করেছি', en: '✅ Protested / Refused' } },
    { value: 'দাবি মুলতুবি', label: { bn: '🟡 এখনো চাপ অব্যাহত আছে', en: '🟡 Pressure is ongoing' } },
    { value: 'ভুক্তভোগী', label: { bn: '🟠 ক্ষতিগ্রস্ত / নির্যাতিত হয়েছি', en: '🟠 Harmed / Victimized' } },
  ],
  private: [
    { value: 'পরিশোধিত', label: { bn: '🔴 অতিরিক্ত টাকা দিতে হয়েছে', en: '🔴 Forced to pay extra' } },
    { value: 'প্রত্যাখ্যাত', label: { bn: '✅ প্রতিবাদ করেছি / অভিযোগ দিয়েছি', en: '✅ Protested / Filed complaint' } },
    { value: 'দাবি মুলতুবি', label: { bn: '🟡 সমাধান হয়নি / চলমান', en: '🟡 Unresolved / Pending' } },
  ],
  social: [
    { value: 'পরিশোধিত', label: { bn: '🔴 ক্ষতি / নির্যাতন সহ্য করেছি', en: '🔴 Suffered loss / injustice' } },
    { value: 'প্রত্যাখ্যাত', label: { bn: '✅ প্রতিকার পেয়েছি / আইনি ব্যবস্থা নিয়েছি', en: '✅ Took legal action' } },
    { value: 'দাবি মুলতুবি', label: { bn: '🟡 সমাধান হয়নি / চলমান', en: '🟡 Unresolved / Ongoing' } },
    { value: 'ভুক্তভোগী', label: { bn: '🟠 ভুক্তভোগী / সাহায্য প্রয়োজন', en: '🟠 Victim / Need help' } },
  ],
};

const SubmitModal = () => {
  const { isSubmitModalOpen, setIsSubmitModalOpen, addReport, triggerToast, t, lang } = useReports();
  const fileInputRef = useRef(null);
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      complaintType: 'government',
      amount: '',
      outcome: 'পরিশোধিত',
      title: '',
      division: '',
      district: '',
      thana: '',
      category: '',
      office: '',
      official: '',
      officialPost: '',
      content: '',
      agreed: false,
      identityMode: 'anonymous',
      authorName: '',
    }
  });

  const formValues = watch();

  if (!isSubmitModalOpen) return null;

  const districts = formValues.division ? (DIVISION_DISTRICTS[formValues.division] || []) : [];
  const rawCategories = TYPE_CATEGORIES[formValues.complaintType] || [];
  const typeConfig = COMPLAINT_TYPE_TRANSLATIONS[formValues.complaintType] || COMPLAINT_TYPE_TRANSLATIONS.government;
  const currentOutcomes = OUTCOME_OPTIONS[formValues.complaintType] || OUTCOME_OPTIONS.government;

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 3) {
      triggerToast(lang === 'bn' ? 'সর্বোচ্চ ৩টি ছবি আপলোড করা যাবে।' : 'You can upload maximum 3 photos.', 'warning');
      return;
    }
    const newPhotos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB'
    }));
    setPhotos(prev => [...prev, ...newPhotos]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleTypeChange = (typeId) => {
    const newOutcomes = OUTCOME_OPTIONS[typeId] || OUTCOME_OPTIONS.government;
    setValue('complaintType', typeId);
    setValue('category', '');
    setValue('outcome', newOutcomes[0]?.value || 'পরিশোধিত');
  };

  const onValidSubmit = async (data) => {
    if (!data.agreed) {
      triggerToast(t.agreementAlert, 'warning');
      return;
    }

    if (data.identityMode === 'reveal' && !data.authorName?.trim()) {
      triggerToast(t.nameRequiredAlert, 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      const defaultAnonymous = lang === 'bn' ? 'নাম প্রকাশে অনিচ্ছুক' : 'Anonymous';
      const authorName = data.identityMode === 'reveal' && data.authorName?.trim()
        ? data.authorName.trim()
        : defaultAnonymous;

      // Upload selected images to ImgBB
      let uploadedImageUrls = [];
      if (photos.length > 0) {
        try {
          uploadedImageUrls = await uploadMultipleImagesToImgBB(photos);
        } catch (imgErr) {
          console.warn('ImgBB upload encountered error, falling back to local base64:', imgErr);
          const photoPromises = photos.map(p => {
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(p.file);
            });
          });
          uploadedImageUrls = await Promise.all(photoPromises);
        }
      }

      await addReport({
        complaintType: data.complaintType,
        amount: parseInt(data.amount, 10) || 0,
        outcome: data.outcome,
        title: data.title.trim(),
        division: data.division,
        district: data.district,
        thana: data.thana.trim(),
        category: data.category,
        office: data.office.trim(),
        official: (data.official || '').trim(),
        officialPost: (data.officialPost || '').trim(),
        content: data.content.trim(),
        author: authorName,
        photos: uploadedImageUrls,
      });

      photos.forEach(p => URL.revokeObjectURL(p.preview));
      setPhotos([]);
      reset();
      setIsSubmitModalOpen(false);
    } catch (err) {
      console.error(err);
      triggerToast(lang === 'bn' ? 'অভিযোগ জমা দেওয়া সম্ভব হয়নি।' : 'Failed to submit complaint.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-10 overflow-y-auto bg-black/75 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) setIsSubmitModalOpen(false);
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl animate-slide-up relative overflow-hidden my-6 border border-gray-100">
        {/* Modal Header */}
        <div className="bg-[#006A4E] text-white px-8 py-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono text-[#FFD700] uppercase tracking-wider">{t.modalHeaderSub}</span>
            <h2 className="text-xl font-extrabold mt-0.5">{t.modalHeaderTitle}</h2>
          </div>
          <button 
            onClick={() => setIsSubmitModalOpen(false)}
            className="text-white/70 hover:text-white text-3xl leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit(onValidSubmit)} className="p-6 sm:p-8 space-y-4 max-h-[80vh] overflow-y-auto font-sans">
          
          {/* Complaint Type Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
              {t.selectComplaintType}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {COMPLAINT_TYPES.map(type => {
                const tr = COMPLAINT_TYPE_TRANSLATIONS[type.id] || {};
                const labelText = tr.label?.[lang] || type.label;
                const descText = tr.description?.[lang] || type.description;
                const isSelected = formValues.complaintType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleTypeChange(type.id)}
                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                      isSelected
                        ? `${type.borderColor} ${type.bgColor} shadow-sm`
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div>
                      <p className={`text-xs font-bold leading-tight ${
                        isSelected ? type.textColor : 'text-gray-700'
                      }`}>
                        {labelText}
                      </p>
                      <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{descText}</p>
                    </div>
                    {isSelected && (
                      <div className={`shrink-0 ${type.textColor} text-sm font-bold`}>✓</div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Outcome */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#e8f5f0] p-4 rounded-2xl border border-green-200">
            <div>
              <label className="block text-xs font-bold text-[#004d38] uppercase tracking-wide mb-1">
                {typeConfig.amountLabel[lang]} *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold font-mono text-gray-500">৳</span>
                <input
                  type="number"
                  {...register('amount', {
                    required: true,
                    min: formValues.complaintType === 'social' ? 0 : 10
                  })}
                  placeholder={lang === 'bn' ? 'যেমন: ৫০০০' : 'e.g. 5000'}
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono font-bold border border-gray-300 rounded-xl focus:outline-none focus:border-[#006A4E] bg-white"
                />
              </div>
              <span className="text-[11px] text-gray-500 mt-1 block">
                {typeConfig.amountHint[lang]}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#004d38] uppercase tracking-wide mb-1">
                {lang === 'bn' ? 'আপনার সিদ্ধান্ত / ফলাফল *' : 'Your Action / Outcome *'}
              </label>
              <select
                {...register('outcome', { required: true })}
                className="w-full py-2 px-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:border-[#006A4E] bg-white cursor-pointer font-medium"
              >
                {currentOutcomes.map(o => (
                  <option key={o.value} value={o.value}>{o.label[lang]}</option>
                ))}
              </select>
              <span className="text-[11px] text-gray-500 mt-1 block">
                {lang === 'bn' ? 'আপনার নেওয়া পদক্ষেপ' : 'Action taken by you'}
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              {t.complaintTitleLabel} *
            </label>
            <input
              type="text"
              maxLength={120}
              {...register('title', { required: true })}
              placeholder={t.complaintTitlePlaceholder}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#006A4E]"
            />
          </div>

          {/* Division & District */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">{t.divisionLabel} *</label>
              <select
                {...register('division', {
                  required: true,
                  onChange: () => setValue('district', '')
                })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#006A4E] bg-white cursor-pointer"
              >
                <option value="">{t.selectDivision}</option>
                {Object.keys(DIVISION_DISTRICTS).map(div => (
                  <option key={div} value={div}>
                    {DIVISION_NAMES_TRANSLATION[div]?.[lang] || div}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">{t.districtLabelModal} *</label>
              <select
                disabled={!formValues.division}
                {...register('district', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#006A4E] bg-white cursor-pointer disabled:bg-gray-100"
              >
                <option value="">{formValues.division ? t.selectDistrict : t.selectDivisionFirst}</option>
                {districts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Thana & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">{t.thanaLabelModal} *</label>
              <input
                type="text"
                {...register('thana', { required: true })}
                placeholder={t.thanaPlaceholderModal}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#006A4E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                {typeConfig.categoryLabel[lang]} *
              </label>
              <select
                {...register('category', { required: true })}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#006A4E] bg-white cursor-pointer"
              >
                <option value="">{lang === 'bn' ? 'বাছুন' : 'Select'}</option>
                {rawCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {CATEGORY_NAMES_TRANSLATION[cat]?.[lang] || cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Office/Place, Official & Post */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                {typeConfig.officeLabel[lang]} *
              </label>
              <input
                type="text"
                {...register('office', { required: true })}
                placeholder={typeConfig.officePlaceholder[lang]}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#006A4E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                {typeConfig.officialLabel[lang]}
              </label>
              <input
                type="text"
                {...register('official')}
                placeholder={typeConfig.officialPlaceholder[lang]}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#006A4E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                {typeConfig.postLabel[lang]}
              </label>
              <input
                type="text"
                {...register('officialPost')}
                placeholder={typeConfig.postPlaceholder[lang]}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#006A4E]"
              />
            </div>
          </div>

          {/* Detailed Content */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              {t.contentLabel} *
            </label>
            <textarea
              rows={4}
              {...register('content', { required: true })}
              placeholder={typeConfig.contentPlaceholder[lang]}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-[#006A4E] leading-relaxed"
            />
          </div>

          {/* Photo Evidence Upload */}
          <div className="border border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50/50">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <ImagePlus size={14} className="text-[#006A4E]" />
              {t.attachProofLabel}
            </label>
            <p className="text-[11px] text-gray-500 mb-3">
              {t.attachProofDesc}
            </p>

            {photos.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                    <img
                      src={photo.preview}
                      alt={`Evidence ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-1.5 rounded-full shadow-lg transition-all cursor-pointer hover:bg-red-600"
                        title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="px-2 py-1 bg-white">
                      <p className="text-[10px] text-gray-500 truncate">{photo.name}</p>
                      <p className="text-[9px] text-gray-400">{photo.size}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 3 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#006A4E]/30 rounded-xl text-[#006A4E] text-xs font-bold hover:bg-[#006A4E]/5 hover:border-[#006A4E]/50 transition-all cursor-pointer"
              >
                <Upload size={16} />
                {t.uploadPhotoBtn} ({photos.length}/3)
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </div>

          {/* Identity Visibility Toggle */}
          <div className="bg-[#f0f4ff] border border-blue-200 rounded-2xl p-4">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-blue-600" />
              {t.yourIdentityLabel}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setValue('identityMode', 'anonymous');
                  setValue('authorName', '');
                }}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                  formValues.identityMode === 'anonymous'
                    ? 'border-[#006A4E] bg-[#006A4E]/5 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  formValues.identityMode === 'anonymous' ? 'bg-[#006A4E] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <EyeOff size={18} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${formValues.identityMode === 'anonymous' ? 'text-[#004d38]' : 'text-gray-700'}`}>
                    {t.stayAnonymousLabel}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight">{t.stayAnonymousDesc}</p>
                </div>
                {formValues.identityMode === 'anonymous' && (
                  <div className="ml-auto text-[#006A4E]">✓</div>
                )}
              </button>

              <button
                type="button"
                onClick={() => setValue('identityMode', 'reveal')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                  formValues.identityMode === 'reveal'
                    ? 'border-[#006A4E] bg-[#006A4E]/5 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  formValues.identityMode === 'reveal' ? 'bg-[#006A4E] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  <Eye size={18} />
                </div>
                <div>
                  <p className={`text-sm font-bold ${formValues.identityMode === 'reveal' ? 'text-[#004d38]' : 'text-gray-700'}`}>
                    {t.revealIdentityLabel}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight">{t.revealIdentityDesc}</p>
                </div>
                {formValues.identityMode === 'reveal' && (
                  <div className="ml-auto text-[#006A4E]">✓</div>
                )}
              </button>
            </div>

            {formValues.identityMode === 'reveal' && (
              <div className="mt-3 animate-fade-in">
                <div className="relative">
                  <User size={14} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    {...register('authorName')}
                    placeholder={t.enterYourName}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#006A4E] bg-white"
                  />
                </div>
                <p className="text-[10px] text-amber-600 mt-1.5 flex items-center gap-1">
                  <AlertTriangle size={10} />
                  {t.revealWarning}
                </p>
              </div>
            )}
          </div>

          {/* Agreement Checkbox */}
          <div className="flex items-start gap-2.5 bg-yellow-50 border border-yellow-200 rounded-xl p-3">
            <input
              type="checkbox"
              id="submitAgreement"
              {...register('agreed')}
              className="mt-0.5 accent-[#006A4E] cursor-pointer"
            />
            <label htmlFor="submitAgreement" className="text-[11px] text-gray-600 leading-snug cursor-pointer">
              {t.agreementText}
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsSubmitModalOpen(false)}
              className="flex-1 border border-gray-200 text-gray-600 py-3 rounded-xl font-bold text-xs sm:text-sm hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-[#006A4E] hover:bg-[#004d38] text-white py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {lang === 'bn' ? 'জমা হচ্ছে...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send size={14} /> {t.publishBtn}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitModal;
