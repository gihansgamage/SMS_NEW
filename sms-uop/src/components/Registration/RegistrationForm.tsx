import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FACULTIES, SocietyRegistration, AdvisoryBoardMember, CommitteeMember, Member, PlanningEvent } from '../../types';
import { apiService } from '../../services/api';
import StepIndicator from '../Common/StepIndicator';
import ApplicantInfoStep from './steps/ApplicantInfoStep';
import SocietyInfoStep from './steps/SocietyInfoStep';
import OfficialsStep from './steps/OfficialsStep';
import MembersStep from './steps/MembersStep';
import ReviewStep from './steps/ReviewStep';
import { CheckCircle, Eye, Download, Send, Loader, Home } from 'lucide-react';

const steps = [
  { title: 'Applicant', description: 'Personal information' },
  { title: 'Society', description: 'Basic details' },
  { title: 'Officials', description: 'Committee members' },
  { title: 'Members', description: 'Society members' },
  { title: 'Review', description: 'Final review' }
];

const RegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [formData, setFormData] = useState<Partial<SocietyRegistration>>({
    applicantFullName: '',
    applicantRegNo: '',
    applicantEmail: '',
    applicantFaculty: '',
    applicantMobile: '',
    societyName: '',
    aims: '',
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
    planningEvents: [{ date: '', activity: '' }]
  });

  const updateFormData = (updates: Partial<SocietyRegistration>) => {
    setFormData(prev => ({ ...prev, ...updates }));
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
    setIsSubmitting(true);
    try {
      const registrationData = {
        applicantFullName: formData.applicantFullName,
        applicantRegNo: formData.applicantRegNo,
        applicantEmail: formData.applicantEmail,
        applicantFaculty: formData.applicantFaculty,
        applicantMobile: formData.applicantMobile,
        societyName: formData.societyName,
        aims: formData.aims,
        agmDate: formData.agmDate,
        bankAccount: formData.bankAccount,
        bankName: formData.bankName,
        seniorTreasurer: formData.seniorTreasurer,
        president: formData.president,
        vicePresident: formData.vicePresident,
        secretary: formData.secretary,
        jointSecretary: formData.jointSecretary,
        juniorTreasurer: formData.juniorTreasurer,
        editor: formData.editor,
        advisoryBoard: formData.advisoryBoard,
        committeeMember: formData.committeeMember,
        member: formData.member,
        planningEvents: formData.planningEvents?.map(e => ({ month: e.date, activity: e.activity })),
        year: new Date().getFullYear()
      };

      console.log('Submitting registration:', registrationData);
      const response = await apiService.societies.register(registrationData);
      console.log('Registration response:', response.data);

      setSubmittedId(response.data.id);
      setShowSuccessPage(true);
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`Failed to submit registration:\n\n${errorMessage}\n\nPlease ensure the backend server is running on http://localhost:8080`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewApplication = () => {
    setCurrentStep(4);
    setShowSuccessPage(false);
  };

  const handleDownloadPDF = async () => {
    if (!submittedId) return;

    try {
      const response = await apiService.societies.downloadRegistrationPDF(submittedId.toString());
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `registration_${submittedId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Failed to download PDF. Please try again or contact support.');
    }
  };

  const handleSendForApproval = async () => {
    if (confirm('Are you sure you want to send this application for approval?\n\nThis will:\n• Notify the Faculty Dean for initial approval\n• Send a copy to the Senior Treasurer\n• Begin the official approval workflow')) {
      alert(`✓ Application sent for approval successfully!\n\n• Faculty Dean has been notified\n• Senior Treasurer (${formData.seniorTreasurer?.email}) has been notified\n• You will receive email updates at each approval stage`);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
            <ApplicantInfoStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
            />
        );
      case 1:
        return (
            <SocietyInfoStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
            />
        );
      case 2:
        return (
            <OfficialsStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
            />
        );
      case 3:
        return (
            <MembersStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={nextStep}
                onPrev={prevStep}
            />
        );
      case 4:
        return (
            <ReviewStep
                formData={formData}
                onSubmit={handleSubmit}
                onPrev={prevStep}
            />
        );
      default:
        return null;
    }
  };

  if (showSuccessPage) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="bg-green-100 rounded-full p-6">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                  </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Application Submitted Successfully!
                </h1>

                <p className="text-lg text-gray-600 mb-2">
                  <strong>{formData.societyName}</strong>
                </p>

                <p className="text-gray-600 mb-8">
                  Application ID: <span className="font-mono font-semibold text-blue-600">#{submittedId}</span>
                </p>

                <div className="bg-blue-50 rounded-lg p-6 mb-8 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">1</span>
                      <span>Review your application details using the "View Application" button</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">2</span>
                      <span>Download a PDF copy for your records</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">3</span>
                      <span>Click "Send for Approval" to begin the approval process (Dean → AR → VC)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">4</span>
                      <span>You'll receive email notifications at each approval stage</span>
                    </li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <button
                      onClick={handleViewApplication}
                      className="bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="font-semibold">View Application</span>
                  </button>

                  <button
                      onClick={handleDownloadPDF}
                      className="bg-gray-700 text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">Download PDF</span>
                  </button>

                  <button
                      onClick={handleSendForApproval}
                      className="bg-green-600 text-white px-6 py-4 rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    <Send className="w-5 h-5" />
                    <span className="font-semibold">Send for Approval</span>
                  </button>
                </div>

                <button
                    onClick={() => navigate('/')}
                    className="text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center space-x-2 mx-auto"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Homepage</span>
                </button>
              </div>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Society Registration</h1>
              <p className="text-gray-600">Register your society with the University of Peradeniya</p>
            </div>

            <StepIndicator steps={steps} currentStep={currentStep} />

            {renderStep()}

            {isSubmitting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4">
                    <div className="flex flex-col items-center">
                      <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Submitting Application...</h3>
                      <p className="text-sm text-gray-600 text-center">
                        Please wait while we save your registration to the database.
                      </p>
                    </div>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default RegistrationForm;
