'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Dynamically import react-pdf components to avoid SSR issues
const Document = dynamic(() => import('react-pdf').then(mod => mod.Document), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
    </div>
  )
});

const Page = dynamic(() => import('react-pdf').then(mod => mod.Page), {
  ssr: false
});

// Set up PDF.js worker only on client side
if (typeof window !== 'undefined') {
  const { pdfjs } = require('react-pdf');

  // Use local worker file (most reliable approach)
  pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
  console.log('PDF.js worker configured to use local worker:', pdfjs.GlobalWorkerOptions.workerSrc);
  console.log('PDF.js version:', pdfjs.version);
}

const PDFReader = ({ 
  pdfUrl, 
  bookTitle = "PDF Document",
  onError = null,
  className = ""
}) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [pdfData, setPdfData] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // Memoize file object to prevent unnecessary reloads
  const fileObject = useMemo(() => ({
    url: pdfUrl,
    httpHeaders: {
      'Accept': 'application/pdf'
    },
    withCredentials: false
  }), [pdfUrl]);

  // Memoize options object to prevent unnecessary reloads
  const documentOptions = useMemo(() => ({
    cMapUrl: `https://unpkg.com/pdfjs-dist@5.3.93/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@5.3.93/standard_fonts/`,
    disableAutoFetch: false,
    disableStream: false,
    disableRange: false
  }), []);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load PDF metadata
  const loadPDFMetadata = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Extract book ID from URL to get metadata
      const bookId = pdfUrl.split('/').slice(-2, -1)[0];
      const metadataUrl = pdfUrl.replace('/pdf', '/pdf/metadata');
      
      const response = await fetch(metadataUrl);
      if (!response.ok) {
        throw new Error('Failed to load PDF metadata');
      }
      
      const data = await response.json();
      setNumPages(data.data.estimatedPages);
      
    } catch (err) {
      console.error('Error loading PDF metadata:', err);
      setError('Failed to load PDF metadata');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  }, [pdfUrl, onError]);

  // Load PDF document
  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    console.log(`PDF loaded successfully: ${numPages} pages`);
    console.log('PDF URL:', pdfUrl);
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, [pdfUrl]);

  const onDocumentLoadError = useCallback((error) => {
    console.error('Error loading PDF:', error);
    console.error('PDF URL that failed:', pdfUrl);
    console.error('Error details:', error.message || error);
    
    // More specific error messages with retry logic
    let errorMessage = 'Failed to load PDF document';
    if (error.message && error.message.includes('worker')) {
      errorMessage = 'PDF worker failed to load. Retrying with alternative worker...';
      
      // Try alternative worker
      if (typeof window !== 'undefined') {
        const { pdfjs } = require('react-pdf');
        pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
        console.log('Retrying with local worker:', pdfjs.GlobalWorkerOptions.workerSrc);
        
        // Retry after a short delay
        setTimeout(() => {
          setError(null);
          setLoading(true);
        }, 1000);
        return;
      }
    } else if (error.message && error.message.includes('fetch')) {
      errorMessage = 'Failed to fetch PDF from server. The file may be too large or the server is busy.';
    } else if (error.message && error.message.includes('Invalid PDF')) {
      errorMessage = 'The PDF file appears to be corrupted or invalid.';
    } else if (error.message && error.message.includes('CORS')) {
      errorMessage = 'CORS error - PDF cannot be loaded from this domain';
    } else if (error.message && error.message.includes('404')) {
      errorMessage = 'PDF file not found';
    } else if (error.message && error.message.includes('403')) {
      errorMessage = 'Access denied to PDF file';
    } else if (error.message && error.message.includes('timeout')) {
      errorMessage = 'PDF loading timed out. The file may be too large.';
    }
    
    setError(errorMessage);
    setLoading(false);
    if (onError) onError(error);
  }, [onError, pdfUrl]);

  // Retry function
  const retryLoad = useCallback(() => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setLoading(true);
      // Force re-render by updating a dummy state
      setPdfData(prev => prev === null ? {} : null);
    }
  }, [retryCount]);

  // Navigation functions
  const goToPrevPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages || 1));
  }, [numPages]);

  const goToPage = useCallback((page) => {
    const pageNum = parseInt(page);
    if (pageNum >= 1 && pageNum <= (numPages || 1)) {
      setPageNumber(pageNum);
    }
  }, [numPages]);

  // Zoom functions
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  // Rotation function
  const rotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);


  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevPage();
      } else if (e.key === 'ArrowRight') {
        goToNextPage();
      } else if (e.key === '+' || e.key === '=') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      } else if (e.key === 'r') {
        rotate();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [goToPrevPage, goToNextPage, zoomIn, zoomOut, resetZoom, rotate]);


  // Initialize PDF.js worker on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const { pdfjs } = require('react-pdf');
      
      // Ensure worker is properly configured with local worker
      if (!pdfjs.GlobalWorkerOptions.workerSrc) {
        pdfjs.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js';
        console.log('Worker source set to local worker:', pdfjs.GlobalWorkerOptions.workerSrc);
      }
    }
  }, []);

  // Load metadata on mount
  useEffect(() => {
    if (pdfUrl) {
      loadPDFMetadata();
    }
  }, [pdfUrl, loadPDFMetadata]);

  // Show loading state during SSR or initial load
  if (!isClient || loading) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-4" />
        <p className="text-gray-600">Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center min-h-[400px] bg-red-50 rounded-lg ${className}`}>
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <div className="flex space-x-4 mb-4">
          <button
            onClick={retryLoad}
            disabled={retryCount >= 3}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {retryCount >= 3 ? 'Max Retries' : `Retry (${retryCount}/3)`}
          </button>
          <button
            onClick={() => window.open(pdfUrl, '_blank')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Open in New Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2" />
            {bookTitle}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={pageNumber}
                onChange={(e) => goToPage(e.target.value)}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded-lg text-sm"
                min="1"
                max={numPages || 1}
              />
              <span className="text-sm text-gray-500">of {numPages || 0}</span>
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= (numPages || 1)}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <button
              onClick={zoomOut}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={zoomIn}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            <button
              onClick={resetZoom}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              Reset
            </button>
          </div>
          
          {/* Additional Controls */}
          <div className="flex items-center space-x-2 border-l border-gray-300 pl-4">
            <button
              onClick={rotate}
              className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
              title="Rotate"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div className="flex justify-center">
          {isClient ? (
            <Document
              key={`pdf-${pdfUrl}-${retryCount}`}
              file={fileObject}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Loading PDF...</p>
                    <p className="text-xs text-gray-500">Streaming from server...</p>
                  </div>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center min-h-[400px] text-red-600">
                  <AlertCircle className="w-12 h-12 mb-4" />
                  <p>Failed to load PDF</p>
                  <button
                    onClick={retryLoad}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              }
              options={documentOptions}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                className="shadow-lg"
                renderTextLayer={false}
                renderAnnotationLayer={false}
              />
            </Document>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}
        </div>
      </div>

      {/* Footer with page info */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50 text-sm text-gray-600">
        <div>
          Page {pageNumber} of {numPages || 0}
        </div>
        <div className="flex items-center space-x-4">
          <span>Zoom: {Math.round(scale * 100)}%</span>
          <span>Rotation: {rotation}°</span>
        </div>
      </div>
    </div>
  );
};

export default PDFReader;
