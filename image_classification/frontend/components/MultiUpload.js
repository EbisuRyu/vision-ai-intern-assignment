import { useState, useRef } from 'react';

export default function MultiUpload() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const handleMultipleFiles = (files) => {
    const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    const imagePromises = validFiles.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            file: file,
            preview: e.target.result,
            name: file.name
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      setUploadedImages(images);
      setPredictions([]);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleMultipleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleMultipleFiles(e.target.files);
    }
  };

  const classifyMultipleImages = async () => {
    if (uploadedImages.length === 0) return;

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      uploadedImages.forEach(img => {
        formData.append('files', img.file);
      });

      const response = await fetch(`${API_BASE_URL}/predict-multi`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const formattedResults = result.results.map(item => ({
        filename: item.filename,
        class_name: item.class_name,
        probability: item.probability,
        confidence_percent: Math.round(item.probability * 100)
      }));

      setPredictions(formattedResults);
    } catch (error) {
      console.error('Error classifying images:', error);
      setPredictions([{
        filename: 'Error',
        class_name: 'error',
        probability: 0,
        error: 'Failed to classify images. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setUploadedImages([]);
    setPredictions([]);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const getResultColor = (className) => {
    switch(className?.toLowerCase()) {
      case 'dog': return '#ff6b35';
      case 'cat': return '#4ecdc4';
      case 'error': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getResultEmoji = (className) => {
    switch(className?.toLowerCase()) {
      case 'dog': return '🐶';
      case 'cat': return '🐱';
      case 'error': return '❌';
      default: return '🤖';
    }
  };

  return (
    <div style={{ 
      maxWidth: '1000px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>
          📚 Batch Classification
        </h2>
        <p style={{ color: '#7f8c8d' }}>
          Upload multiple images at once for batch processing
        </p>
      </div>

      {/* Upload Area */}
      <div
        style={{
          border: '2px dashed #ddd',
          borderRadius: '8px',
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#fafafa',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        <div style={{ fontSize: '48px', marginBottom: '10px', color: '#ddd' }}>📁</div>
        <p style={{ margin: '0 0 10px 0', color: '#666' }}>
          Drag and drop multiple images here, or click to select
        </p>
        <p style={{ margin: '0', color: '#999', fontSize: '14px' }}>
          Supports: JPG, PNG, GIF (Multiple files allowed)
        </p>
      </div>

      {/* Uploaded Images Preview */}
      {uploadedImages.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#333', marginBottom: '15px' }}>
            Uploaded Images ({uploadedImages.length})
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '15px',
            marginBottom: '20px'
          }}>
            {uploadedImages.map((img, index) => (
              <div key={index} style={{
                border: '1px solid #eee',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: 'white'
              }}>
                <img
                  src={img.preview}
                  alt={img.name}
                  style={{
                    width: '100%',
                    height: '120px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  padding: '10px',
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center',
                  borderTop: '1px solid #eee'
                }}>
                  {img.name.length > 15 ? img.name.substring(0, 15) + '...' : img.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button
          onClick={handleClear}
          style={{
            flex: '1',
            padding: '12px 24px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            backgroundColor: 'white',
            color: '#666',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Clear All
        </button>
        <button
          onClick={classifyMultipleImages}
          disabled={uploadedImages.length === 0 || isLoading}
          style={{
            flex: '2',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: uploadedImages.length > 0 && !isLoading ? '#ff9f43' : '#ddd',
            color: 'white',
            cursor: uploadedImages.length > 0 && !isLoading ? 'pointer' : 'not-allowed',
            fontSize: '16px'
          }}
        >
          {isLoading ? `Analyzing ${uploadedImages.length} images...` : `Classify ${uploadedImages.length} Images`}
        </button>
      </div>

      {/* Results */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #ff9f43',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: '#666' }}>Processing {uploadedImages.length} images...</p>
        </div>
      )}

      {predictions.length > 0 && !isLoading && (
        <div>
          <h3 style={{ color: '#333', marginBottom: '20px' }}>
            🎯 Batch Results
          </h3>
          
          {predictions[0].error ? (
            <div style={{
              textAlign: 'center',
              padding: '20px',
              color: '#e74c3c',
              backgroundColor: '#fdf2f2',
              borderRadius: '6px',
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
              <p style={{ margin: '0', fontSize: '14px' }}>{predictions[0].error}</p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              {predictions.map((result, index) => (
                <div key={index} style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    textAlign: 'center', 
                    marginBottom: '10px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {result.filename}
                  </div>
                  
                  <div style={{ 
                    textAlign: 'center',
                    fontSize: '24px',
                    marginBottom: '10px'
                  }}>
                    {getResultEmoji(result.class_name)}
                  </div>
                  
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: 'bold',
                      color: getResultColor(result.class_name),
                      textTransform: 'capitalize',
                      marginBottom: '5px'
                    }}>
                      {result.class_name}
                    </div>
                    <div style={{
                      fontSize: '16px',
                      color: '#666'
                    }}>
                      {result.confidence_percent}% confident
                    </div>
                  </div>
                  
                  <div style={{
                    width: '100%',
                    height: '6px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginTop: '10px'
                  }}>
                    <div
                      style={{
                        width: `${result.confidence_percent}%`,
                        height: '100%',
                        backgroundColor: getResultColor(result.class_name),
                        transition: 'width 0.5s ease'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}