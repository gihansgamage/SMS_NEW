import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import type { SocietyRenewal } from '../types';
import StepIndicator from '../components/Common/StepIndicator';
import ApplicantInfoStep from '../components/Registration/steps/ApplicantInfoStep';
import SocietyInfoStep from '../components/Registration/steps/SocietyInfoStep';
import OfficialsStep from '../components/Registration/steps/OfficialsStep';
import MembersStep from '../components/Registration/steps/MembersStep';
import ReviewStep from '../components/Registration/steps/ReviewStep';
import { apiService } from '../services/api';

const steps = [
  { title: 'Applicant', description: 'Personal information' },
  { title: 'Society', description: 'Basic details' },
  { title: 'Officials', description: 'Committee members' },
  { title: 'Members', description: 'Society members' },
  { title: 'Review', description: 'Final review' }
];

const RenewalPage: React.FC = () => {
  const navigate = useNavigate();
  const { societies, addRenewal, addActivityLog } = useData();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Partial<SocietyRenewal>>({
    applicantFullName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantFaculty: '',
    applicantMobile: '',
    societyName: '',
    seniorTreasurer: {
      title: '', name: '', designation: '', department: '', email: '', address: '', mobile: ''
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

  const existingSocieties = [...societies].sort((a, b) =>
      a.societyName.localeCompare(b.societyName)
  );

  const updateFormData = (updates: Partial<SocietyRenewal>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        // Ensure lists are properly formatted if necessary
      };

      await apiService.renewals.submit(payload);

      addActivityLog(
          'Society Renewal Submitted',
          formData.societyName || 'Unknown',
          'user-' + formData.applicantRegNo,
          formData.applicantFullName || 'Unknown'
      );

      alert(`Renewal application submitted successfully! A confirmation email has been sent to ${formData.applicantEmail}`);
      navigate('/');

    } catch (error: any) {
      console.error("Renewal submission failed:", error);
      alert(`Submission Error: ${error.response?.data?.message || "Connection failed"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ApplicantInfoStep formData={formData} updateFormData={updateFormData} onNext={nextStep} />;
      case 1:
        return (
            <SocietyInfoStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
                isRenewal={true}
                activeSocieties={existingSocieties}
                errors={errors}
            />
        );
      case 2:
        return <OfficialsStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <MembersStep formData={formData} updateFormData={updateFormData} onNext={nextStep} onPrev={prevStep} isRenewal={true} />;
      case 4:
        return <ReviewStep formData={formData} onSubmit={handleSubmit} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  if (isSubmitting) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Submitting renewal application...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Society Renewal</h1>
              <p className="text-gray-600">Renew your existing society registration</p>
            </div>
            <StepIndicator steps={steps} currentStep={currentStep} />
            {renderStep()}
          </div>
        </div>
      </div>
  );
};

export default RenewalPage;