'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

export default function PDFViewerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pdfUrl = searchParams.get('url');
  const embedRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-100">
      <div className="bg-white shadow-md p-4">
        <button 
          onClick={() => router.back()} 
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Course
        </button>
      </div>
      <div className="flex-grow">
        {pdfUrl ? (
          <div className="w-full h-full">
            <style jsx global>{`
              /* Hide download button */
              #download { display: none !important; }
              /* Hide print button */
              #print { display: none !important; }
            `}</style>
            <embed
              ref={embedRef}
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
            />
          </div>
        ) : (
          <div className="p-4">No PDF URL provided</div>
        )}
      </div>
    </div>
  );
}
