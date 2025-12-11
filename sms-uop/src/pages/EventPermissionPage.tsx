import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import StepIndicator from '../components/Common/StepIndicator';
import FormField from '../components/Common/FormField';
import ReviewStep from '../components/Registration/steps/ReviewStep';
import { apiService } from '../services/api';

const steps = [
  { title: 'Applicant', description: 'Personal details' },
  { title: 'Event', description: 'Main event info' },
  { title: 'Logistics', description: 'Venue & Participants' },
  { title: 'Finance', description: 'Budget & Funding' },
  { title: 'Review', description: 'Final check' }
];

const EventPermissionPage: React.FC = () => {
  const navigate = useNavigate();
  const { societies, addActivityLog } = useData();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sort Active Societies
  const activeSocieties = [...societies].sort((a, b) => a.societyName.localeCompare(b.societyName));

  const [formData, setFormData] = useState({
    // Applicant
    societyName: '',
    applicantName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantPosition: '',
    applicantMobile: '',

    // Event
    eventName: '',
    eventDate: '',
    timeFrom: '',
    timeTo: '',

    // Logistics
    place: '',
    isInsideUniversity: false,
    latePassRequired: false,
    outsidersInvited: false,
    outsidersList: '',
    firstYearParticipation: false,

    // Finance
    budgetEstimate: '',
    fundCollectionMethods: '',
    studentFeeAmount: '',

    // Officials (Senior Treasurer)
    seniorTreasurerName: '',
    seniorTreasurerDepartment: '',
    seniorTreasurerMobile: '',

    // Officials (Premises Officer - Optional/If known)
    premisesOfficerName: '',
    premisesOfficerDesignation: '',
    premisesOfficerDivision: '',

    receiptNumber: '',
    paymentDate: ''
  });

  const updateFormData = (updates: any) => {
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
      await apiService.events.request(formData);
      addActivityLog('Event Permission Requested', formData.eventName, 'user', formData.applicantName);
      alert("Event permission request submitted successfully!");
      navigate('/');
    } catch (error) {
      console.error(error);
      alert("Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Steps ---

  const Step1Applicant = () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Applicant Information</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Society <span className="text-red-500">*</span></label>
          <select name="societyName" value={formData.societyName} onChange={(e) => updateFormData({societyName: e.target.value})} className="w-full px-4 py-2 border rounded-lg">
            <option value="">Select Society...</option>
            {activeSocieties.map(s => <option key={s.id} value={s.societyName}>{s.societyName}</option>)}
          </select>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <FormField label="Full Name" name="applicantName" value={formData.applicantName} onChange={(e) => updateFormData({applicantName: e.target.value})} required />
          <FormField label="Registration No" name="applicantRegNo" value={formData.applicantRegNo} onChange={(e) => updateFormData({applicantRegNo: e.target.value})} required />
          <FormField label="Email" name="applicantEmail" type="email" value={formData.applicantEmail} onChange={(e) => updateFormData({applicantEmail: e.target.value})} required />
          <FormField label="Mobile" name="applicantMobile" value={formData.applicantMobile} onChange={(e) => updateFormData({applicantMobile: e.target.value})} required />
          <FormField label="Position" name="applicantPosition" value={formData.applicantPosition} onChange={(e) => updateFormData({applicantPosition: e.target.value})} required placeholder="e.g. Secretary" />
        </div>
        <div className="flex justify-end mt-6"><button onClick={nextStep} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Next</button></div>
      </div>
  );

  const Step2Event = () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
        <FormField label="Event Name" name="eventName" value={formData.eventName} onChange={(e) => updateFormData({eventName: e.target.value})} required />

        <div className="grid md:grid-cols-3 gap-6">
          <FormField label="Date" name="eventDate" type="date" value={formData.eventDate} onChange={(e) => updateFormData({eventDate: e.target.value})} required />
          <FormField label="Start Time" name="timeFrom" type="time" value={formData.timeFrom} onChange={(e) => updateFormData({timeFrom: e.target.value})} required />
          <FormField label="End Time" name="timeTo" type="time" value={formData.timeTo} onChange={(e) => updateFormData({timeTo: e.target.value})} required />
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Participation</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input type="checkbox" checked={formData.firstYearParticipation} onChange={e => updateFormData({firstYearParticipation: e.target.checked})} className="mr-2" />
              First Year Students Participating?
            </label>
          </div>
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="bg-gray-200 px-6 py-2 rounded-lg">Previous</button>
          <button onClick={nextStep} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Next</button>
        </div>
      </div>
  );

  const Step3Logistics = () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Logistics</h2>
        <FormField label="Place / Venue" name="place" value={formData.place} onChange={(e) => updateFormData({place: e.target.value})} required />

        <div className="grid md:grid-cols-2 gap-4">
          <label className="flex items-center p-3 border rounded hover:bg-gray-50">
            <input type="checkbox" checked={formData.isInsideUniversity} onChange={e => updateFormData({isInsideUniversity: e.target.checked})} className="mr-3" />
            Inside University Premises
          </label>
          <label className="flex items-center p-3 border rounded hover:bg-gray-50">
            <input type="checkbox" checked={formData.latePassRequired} onChange={e => updateFormData({latePassRequired: e.target.checked})} className="mr-3" />
            Late Pass Required
          </label>
          <label className="flex items-center p-3 border rounded hover:bg-gray-50">
            <input type="checkbox" checked={formData.outsidersInvited} onChange={e => updateFormData({outsidersInvited: e.target.checked})} className="mr-3" />
            Outsiders Invited
          </label>
        </div>

        {formData.outsidersInvited && (
            <FormField label="List of Outsiders" name="outsidersList" value={formData.outsidersList} onChange={(e) => updateFormData({outsidersList: e.target.value})} required as="textarea" />
        )}

        <h3 className="font-semibold mt-4">Premises Officer (If known)</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <FormField label="Name" name="premisesOfficerName" value={formData.premisesOfficerName} onChange={(e) => updateFormData({premisesOfficerName: e.target.value})} />
          <FormField label="Designation" name="premisesOfficerDesignation" value={formData.premisesOfficerDesignation} onChange={(e) => updateFormData({premisesOfficerDesignation: e.target.value})} />
          <FormField label="Division" name="premisesOfficerDivision" value={formData.premisesOfficerDivision} onChange={(e) => updateFormData({premisesOfficerDivision: e.target.value})} />
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="bg-gray-200 px-6 py-2 rounded-lg">Previous</button>
          <button onClick={nextStep} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Next</button>
        </div>
      </div>
  );

  const Step4Finance = () => (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold mb-4">Finance</h2>
        <FormField label="Budget Estimate" name="budgetEstimate" value={formData.budgetEstimate} onChange={(e) => updateFormData({budgetEstimate: e.target.value})} as="textarea" />
        <FormField label="Fund Collection Methods" name="fundCollectionMethods" value={formData.fundCollectionMethods} onChange={(e) => updateFormData({fundCollectionMethods: e.target.value})} />
        <FormField label="Student Fee Amount (if any)" name="studentFeeAmount" value={formData.studentFeeAmount} onChange={(e) => updateFormData({studentFeeAmount: e.target.value})} />

        <h3 className="font-semibold mt-4">Senior Treasurer</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <FormField label="Name" name="seniorTreasurerName" value={formData.seniorTreasurerName} onChange={(e) => updateFormData({seniorTreasurerName: e.target.value})} />
          <FormField label="Department" name="seniorTreasurerDepartment" value={formData.seniorTreasurerDepartment} onChange={(e) => updateFormData({seniorTreasurerDepartment: e.target.value})} />
          <FormField label="Mobile" name="seniorTreasurerMobile" value={formData.seniorTreasurerMobile} onChange={(e) => updateFormData({seniorTreasurerMobile: e.target.value})} />
        </div>

        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="bg-gray-200 px-6 py-2 rounded-lg">Previous</button>
          <button onClick={nextStep} className="bg-blue-600 text-white px-6 py-2 rounded-lg">Next</button>
        </div>
      </div>
  );

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-2">Event Permission</h1>
            <p className="text-gray-600 mb-8">Request official permission for society events</p>

            <StepIndicator steps={steps} currentStep={currentStep} />

            {currentStep === 0 && <Step1Applicant />}
            {currentStep === 1 && <Step2Event />}
            {currentStep === 2 && <Step3Logistics />}
            {currentStep === 3 && <Step4Finance />}
            {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <h2 className="text-xl font-bold mb-4">Review Details</h2>
                    <p><strong>Society:</strong> {formData.societyName}</p>
                    <p><strong>Event:</strong> {formData.eventName} on {formData.eventDate}</p>
                    <p><strong>Place:</strong> {formData.place}</p>
                    <p><strong>Applicant:</strong> {formData.applicantName}</p>
                  </div>
                  <ReviewStep
                      formData={{
                        applicantFullName: formData.applicantName,
                        societyName: formData.societyName,
                        // @ts-ignore
                        eventName: formData.eventName
                      }}
                      onSubmit={handleSubmit}
                      onPrev={prevStep}
                  />
                </div>
            )}

            {isSubmitting && (
                <div className="fixed inset-0 bg-white/80 flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Submitting request...</p>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default EventPermissionPage;