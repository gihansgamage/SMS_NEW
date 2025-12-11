import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SocietyRegistration, SocietyRenewal } from '../../../types';
import FormField from '../../Common/FormField';
import { apiService } from '../../../services/api';

interface SocietyInfoStepProps {
  formData: Partial<SocietyRegistration> | Partial<SocietyRenewal>;
  updateFormData: (updates: Partial<SocietyRegistration> | Partial<SocietyRenewal>) => void;
  onNext: () => void;
  onPrev: () => void;
  isRenewal?: boolean;
  activeSocieties?: any[];
  errors?: { [key: string]: string };
}

const SocietyInfoStep: React.FC<SocietyInfoStepProps> = ({
                                                           formData,
                                                           updateFormData,
                                                           onNext,
                                                           onPrev,
                                                           isRenewal = false,
                                                           activeSocieties = [],
                                                           errors = {}
                                                         }) => {
  const [localErrors, setLocalErrors] = React.useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });

    if (localErrors[name]) {
      setLocalErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // NEW: Handle Society Selection for Renewal
  const handleSocietySelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSociety = e.target.value;
    updateFormData({ societyName: selectedSociety });

    if (selectedSociety) {
      try {
        const response = await apiService.renewals.getLatestData(selectedSociety);
        if (response.data) {
          // Pre-fill form data
          updateFormData({
            ...response.data,
            // Keep applicant details from step 1
            applicantFullName: formData.applicantFullName,
            applicantRegNo: formData.applicantRegNo,
            applicantEmail: formData.applicantEmail,
            applicantMobile: formData.applicantMobile,
            applicantFaculty: formData.applicantFaculty,
            // Ensure society name matches selection
            societyName: selectedSociety
          });
          alert("Data pre-filled from previous records. Please review and update if necessary.");
        }
      } catch (err) {
        console.error("Failed to fetch society data", err);
      }
    }
  };

  const handleNext = () => {
    const required = ['societyName', 'aims', 'agmDate'];
    if (isRenewal) {
      required.push('bankAccount', 'bankName', 'website');
    }

    const newErrors: { [key: string]: string } = {};

    required.forEach(field => {
      // @ts-ignore
      const value = formData[field];
      if (!value || value.trim() === '') {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    setLocalErrors({ ...errors, ...newErrors });

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    onNext();
  };

  return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Society Information</h2>

        <div className="space-y-6">
          {isRenewal ? (
              // Dropdown for Renewal
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Society <span className="text-red-500">*</span>
                </label>
                <select
                    name="societyName"
                    value={formData.societyName || ''}
                    onChange={handleSocietySelect}
                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                        localErrors.societyName ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                    }`}
                >
                  <option value="">Select a society to renew...</option>
                  {activeSocieties.map((society) => (
                      <option key={society.id} value={society.societyName}>
                        {society.societyName}
                      </option>
                  ))}
                </select>
                {localErrors.societyName && (
                    <p className="mt-1 text-xs text-red-500">{localErrors.societyName}</p>
                )}
              </div>
          ) : (
              // Text Input for Registration
              <FormField
                  label="Name of Society"
                  name="societyName"
                  value={formData.societyName || ''}
                  onChange={handleChange}
                  error={localErrors.societyName}
                  required
                  placeholder="Enter the proposed name of the society"
              />
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <FormField
                label="Date of AGM"
                name="agmDate"
                type="date"
                value={formData.agmDate || ''}
                onChange={handleChange}
                error={localErrors.agmDate}
                required
                placeholder="Select date"
            />

            {isRenewal && (
                <>
                  <FormField
                      label="Bank Account Number"
                      name="bankAccount"
                      value={(formData as SocietyRenewal).bankAccount || ''}
                      onChange={handleChange}
                      error={localErrors.bankAccount}
                      required
                  />
                  <FormField
                      label="Bank Name"
                      name="bankName"
                      value={(formData as SocietyRenewal).bankName || ''}
                      onChange={handleChange}
                      error={localErrors.bankName}
                      required
                  />
                  <FormField
                      label="Website / Social Media"
                      name="website"
                      value={(formData as SocietyRenewal).website || ''}
                      onChange={handleChange}
                      error={localErrors.website}
                  />
                </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isRenewal ? "Aims & Objectives (Review)" : "Aims & Objectives"} <span className="text-red-500">*</span>
            </label>
            <textarea
                name="aims"
                value={formData.aims || ''}
                onChange={handleChange}
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${
                    localErrors.aims ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                }`}
                placeholder="List the main objectives of the society..."
            />
            {localErrors.aims && (
                <p className="mt-1 text-xs text-red-500">{localErrors.aims}</p>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
              onClick={onPrev}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <button
              onClick={handleNext}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
  );
};

export default SocietyInfoStep;