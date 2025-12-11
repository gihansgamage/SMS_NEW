import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Society, SocietyRenewal } from '../types';
import StepIndicator from '../components/Common/StepIndicator';
import ApplicantInfoStep from '../components/Registration/steps/ApplicantInfoStep';
import SocietyInfoStep from '../components/Registration/steps/SocietyInfoStep';
import OfficialsStep from '../components/Registration/steps/OfficialsStep';
import MembersStep from '../components/Registration/steps/MembersStep';
import ReviewStep from '../components/Registration/steps/ReviewStep';
import { apiService } from '../services/api';

const steps = [
  { title: 'Select Society', description: 'Choose society to renew' },
  { title: 'Applicant', description: 'Personal information' },
  { title: 'Society', description: 'Basic details' },
  { title: 'Officials', description: 'Committee members' },
  { title: 'Members', description: 'Society members' },
  { title: 'Review', description: 'Final review' }
];

const RenewalPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { societies, addRenewal, addActivityLog } = useData();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSocietyName, setSelectedSocietyName] = useState('');
  const [formData, setFormData] = useState<Partial<SocietyRenewal>>({
    applicantFullName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantFaculty: '',
    applicantMobile: '',
    societyName: '',
    seniorTreasurer: {
      title: '',
      name: '',
      designation: '',
      department: '',
      email: '',
      address: '',
      mobile: ''
    },
    advisoryBoard: [{ name: '', designation: '', department: '' }],
    bankAccount: '',
    bankName: '',
    president: { regNo: '', name: '', address: '', email: '', mobile: '' },
    vicePresident: { regNo: '', name: '', address: '', email: '', mobile: '' },
    juniorTreasurer: { regNo: '', name: '', address: '', email: '', mobile: '' },
    secretary: { regNo: '', name: '', address: '', email: '', mobile: '' },
    jointSecretary: { regNo: '', name: '', address: '', email: '', mobile: '' },
    editor: { regNo: '', name: '', address: '', email: '', mobile: '' },
    committeeMember: [{ regNo: '', name: '' }],
    agmDate: '',
    member: [{ regNo: '', name: '' }],
    planningEvents: [{ month: '', activity: '' }],
    previousActivities: [{ month: '', activity: '' }],
    difficulties: '',
    website: ''
  });

  const activeSocieties = societies.filter(s => s.status === 'active');

  const handleSocietySelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const societyName = e.target.value;
    setSelectedSocietyName(societyName);

    if (!societyName) return;

    setIsLoading(true);
    try {
      const response = await apiService.societies.getLatestData(societyName);
      const society: Society = response.data;

      // Auto-fill form data from previous year
      setFormData(prev => ({
        ...prev,
        societyName: society.societyName,
        seniorTreasurer: {
          title: society.seniorTreasurer?.title || '',
          name: society.seniorTreasurer?.name || '',
          designation: society.seniorTreasurer?.designation || '',
          department: society.seniorTreasurer?.department || '',
          email: society.seniorTreasurer?.email || '',
          address: society.seniorTreasurer?.address || '',
          mobile: society.seniorTreasurer?.mobile || ''
        },
        president: {
          regNo: society.president?.regNo || '',
          name: society.president?.name || '',
          address: society.president?.address || '',
          email: society.president?.email || '',
          mobile: society.president?.mobile || ''
        },
        vicePresident: {
          regNo: society.vicePresident?.regNo || '',
          name: society.vicePresident?.name || '',
          address: society.vicePresident?.address || '',
          email: society.vicePresident?.email || '',
          mobile: society.vicePresident?.mobile || ''
        },
        secretary: {
          regNo: society.secretary?.regNo || '',
          name: society.secretary?.name || '',
          address: society.secretary?.address || '',
          email: society.secretary?.email || '',
          mobile: society.secretary?.mobile || ''
        },
        jointSecretary: {
          regNo: society.jointSecretary?.regNo || '',
          name: society.jointSecretary?.name || '',
          address: society.jointSecretary?.address || '',
          email: society.jointSecretary?.email || '',
          mobile: society.jointSecretary?.mobile || ''
        },
        juniorTreasurer: {
          regNo: society.juniorTreasurer?.regNo || '',
          name: society.juniorTreasurer?.name || '',
          address: society.juniorTreasurer?.address || '',
          email: society.juniorTreasurer?.email || '',
          mobile: society.juniorTreasurer?.mobile || ''
        },
        editor: {
          regNo: society.editor?.regNo || '',
          name: society.editor?.name || '',
          address: society.editor?.address || '',
          email: society.editor?.email || '',
          mobile: society.editor?.mobile || ''
        },
        website: society.website || ''
      }));

      alert('Society data loaded! You can now update any fields before submitting.');
    } catch (error) {
      console.error('Failed to load society data:', error);
      alert('Failed to load society data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (updates: Partial<SocietyRenewal>) => {
    setFormData(prev => ({ ...prev, ...updates }));

    Object.keys(updates).forEach(key => {
      if (errors[key]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[key];
          return newErrors;
        });
      }
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.bankAccount || formData.bankAccount.trim() === '') {
      newErrors.bankAccount = 'Bank account is required for renewal';
    }

    if (!formData.bankName || formData.bankName.trim() === '') {
      newErrors.bankName = 'Bank name is required for renewal';
    }

    if (!formData.difficulties || formData.difficulties.trim() === '') {
      newErrors.difficulties = 'Please describe difficulties faced during the previous year';
    }

    if (!formData.previousActivities || formData.previousActivities.length === 0) {
      newErrors.previousActivities = 'Please add at least one previous activity';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const element = document.querySelector(`[name="${firstErrorField}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      setIsLoading(true);
      await apiService.renewals.submit(formData);

      addActivityLog(
        'Society Renewal Submitted',
        formData.societyName || '',
        'user-' + formData.applicantRegNo,
        formData.applicantFullName || ''
      );

      alert(`Renewal application submitted successfully! A confirmation email has been sent to ${formData.applicantEmail}`);
      navigate('/');
    } catch (error) {
      console.error('Failed to submit renewal:', error);
      alert('Failed to submit renewal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Select Society to Renew</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Society Name <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSocietyName}
                onChange={handleSocietySelect}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading}
              >
                <option value="">-- Select a registered society --</option>
                {activeSocieties.map(society => (
                  <option key={society.id} value={society.societyName}>
                    {society.societyName}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-600">
                Only registered active societies can renew their registration
              </p>
            </div>
            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                disabled={!selectedSocietyName || isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Loading...' : 'Next'}
              </button>
            </div>
          </div>
        );
      case 1:
        return (
          <ApplicantInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
          />
        );
      case 2:
        return (
          <SocietyInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            isRenewal={true}
            activeSocieties={activeSocieties}
            errors={errors}
          />
        );
      case 3:
        return (
          <OfficialsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <MembersStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
            isRenewal={true}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            onSubmit={handleSubmit}
            onPrev={prevStep}
            isRenewal={true}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Society Renewal</h1>
            <p className="text-gray-600">Renew your existing society registration with the University of Peradeniya</p>
          </div>

          <StepIndicator steps={steps} currentStep={currentStep} />

          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default RenewalPageNew;
