import { useRef } from 'react';

const CertificateModal = ({ attempt, quiz, onClose }) => {
  const certificateRef = useRef();

  const downloadCertificateAsImage = async () => {
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `Certificate-${quiz.title}.png`;
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download certificate. Please try again.');
    }
  };

  const printCertificate = () => {
    const element = certificateRef.current;
    const printWindow = window.open('', '', 'width=900,height=650');
    printWindow.document.write(element.outerHTML);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 flex justify-between items-center">
          <h3 className="text-2xl font-bold">🎓 Certificate of Completion</h3>
          <button
            onClick={onClose}
            className="text-2xl font-bold hover:opacity-80"
          >
            ✕
          </button>
        </div>

        <div className="p-8">
          {/* Certificate */}
          <div
            ref={certificateRef}
            className="bg-gradient-to-br from-amber-50 to-yellow-50 border-8 border-amber-400 p-12 text-center rounded-lg"
            style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          >
            {/* Header */}
            <div className="space-y-6">
              <div className="text-6xl">🏆</div>

              {/* Title */}
              <div>
                <h1 className="text-4xl font-bold text-amber-900 mb-2">
                  Certificate of Achievement
                </h1>
                <div className="h-1 w-32 bg-amber-400 mx-auto"></div>
              </div>
            </div>

            {/* Body */}
            <div className="space-y-4 text-amber-900 py-8">
              <p className="text-lg">This is to certify that</p>
              <p className="text-3xl font-bold italic border-b-2 border-amber-400 pb-2">
                Student
              </p>
              <p className="text-lg">has successfully completed the quiz</p>
              <p className="text-2xl font-bold underline">
                {quiz.title}
              </p>
              <p className="text-lg">with an outstanding score of</p>
              <p className="text-4xl font-bold text-amber-700">
                {attempt.percentage}%
              </p>
              <p className="text-sm text-amber-800 pt-4">
                Achieved on {new Date(attempt.attempted_at).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>

            {/* Footer */}
            <div className="border-t-2 border-amber-400 pt-4 text-xs text-amber-800">
              <p className="font-semibold">AI LMS Platform</p>
              <p>Certificate of Completion & Achievement</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4 justify-center flex-wrap">
            <button
              onClick={printCertificate}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2"
            >
              🖨️ Print Certificate
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Close
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            💡 Tip: You can also use your browser's print feature to save as PDF
          </p>
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
