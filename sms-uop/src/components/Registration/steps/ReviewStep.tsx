import React, { useState } from 'react';
import { ArrowLeft, Download, Send, Eye } from 'lucide-react';
import { SocietyRegistration } from '../../../types';
import axios from 'axios';

interface ReviewStepProps {
  formData: Partial<SocietyRegistration>;
  onSubmit: () => void;
  onPrev: () => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({
                                                 formData,
                                                 onSubmit,
                                                 onPrev
                                               }) => {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleViewApplication = () => {
    setShowPreviewModal(true);
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const payload = { ...formData };
      const response = await axios.post(
          'http://localhost:8080/api/societies/preview-pdf',
          payload,
          {
            responseType: 'blob',
            withCredentials: true
          }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Application_${formData.societyName?.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("PDF Download failed", error);
      alert("Failed to generate PDF. Please ensure all required fields are filled.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendForApproval = () => {
    if (confirm('Are you sure you want to submit this application? Approvals will be requested from the Dean, Assistant Registrar, and Vice Chancellor.')) {
      onSubmit();
    }
  };

  return (
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Final Review</h2>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-medium text-blue-900 mb-2">Ready to Submit?</h3>
          <p className="text-blue-700 text-sm mb-4">
            Please review your application details. You can view the full application or download a copy for your records before submitting.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">

            <button
                onClick={handleViewApplication}
                className="flex-1 bg-white text-blue-600 border border-blue-200 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Eye className="w-5 h-5" />
              <span>View Application</span>
            </button>

            <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex-1 bg-white text-blue-600 border border-blue-200 px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center space-x-2 font-medium"
            >
              <Download className="w-5 h-5" />
              <span>{isDownloading ? 'Generating...' : 'Download Application'}</span>
            </button>

            <button
                onClick={handleSendForApproval}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 font-medium shadow-sm"
            >
              <Send className="w-5 h-5" />
              <span>Send for Approval</span>
            </button>
          </div>
        </div>

        <div className="space-y-4 text-gray-600">
          <p><strong>Applicant:</strong> {formData.applicantFullName}</p>
          <p><strong>Society:</strong> {formData.societyName}</p>
          <p><strong>Faculty:</strong> {formData.applicantFaculty}</p>
          <p><strong>Senior Treasurer:</strong> {formData.seniorTreasurer?.name} ({formData.seniorTreasurer?.email})</p>
        </div>

        {showPreviewModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                  <h3 className="text-xl font-bold text-gray-900">Application Preview</h3>
                  <button onClick={() => setShowPreviewModal(false)} className="text-gray-500 hover:text-gray-700">
                    Close
                  </button>
                </div>
                <div className="p-8">
                  <div className="text-center mb-8 border-b pb-4">
                    <h2 className="text-2xl font-bold uppercase">University of Peradeniya</h2>
                    <h3 className="text-lg font-semibold uppercase text-gray-600">Application for Society Registration</h3>
                  </div>

                  <div className="space-y-6">
                    <section>
                      <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">1. Applicant Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="text-gray-500">Name:</span> {formData.applicantFullName}</div>
                        <div><span className="text-gray-500">Reg No:</span> {formData.applicantRegNo}</div>
                        <div><span className="text-gray-500">Faculty:</span> {formData.applicantFaculty}</div>
                        <div><span className="text-gray-500">Mobile:</span> {formData.applicantMobile}</div>
                      </div>
                    </section>

                    <section>
                      <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">2. Society Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-gray-500">Name of Society:</span> {formData.societyName}</div>
                        <div><span className="text-gray-500">Objectives:</span> {formData.aims}</div>
                      </div>
                    </section>

                    <section>
                      <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-1 mb-3">3. Senior Treasurer</h4>
                      <div className="text-sm">
                        {formData.seniorTreasurer?.title} {formData.seniorTreasurer?.name}<br/>
                        {formData.seniorTreasurer?.designation}, {formData.seniorTreasurer?.department}<br/>
                        Email: {formData.seniorTreasurer?.email}
                      </div>
                    </section>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                  <button
                      onClick={() => setShowPreviewModal(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
              onClick={onPrev}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 px-4 py-2 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Edit</span>
          </button>
        </div>
      </div>
  );
};

export default ReviewStep;