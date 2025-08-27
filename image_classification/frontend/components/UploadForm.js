import { useState, useRef } from 'react';

export default function UploadForm({ onImageUpload, onClear, prediction, isLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
        onImageUpload(file, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClear = () => {
    setUploadedImage(null);
    onClear();
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const onButtonClick = () => {
    inputRef.current?.click();
  };

  const getResultColor = (label) => {
    switch(label.toLowerCase()) {
      case 'dog': return '#ff6b35';
      case 'cat': return '#4ecdc4';
      case 'error': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Upload Area */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        {/* Left Panel - Upload */}
        <div style={{ flex: '1' }}>
        <div
            style={{
            border: dragActive ? '2px dashed #4ecdc4' : '2px dashed #ddd',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: dragActive ? '#f0fffe' : '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: '280px', // 🔥 chỉnh bằng với result box
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
            }}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
        >
            <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            style={{ display: 'none' }}
            />
            
            {uploadedImage ? (
            <img
                src={uploadedImage}
                alt="Uploaded"
                style={{
                maxWidth: '100%',
                maxHeight: '240px', // 🔥 chừa khoảng padding để không tràn
                borderRadius: '8px',
                objectFit: 'contain'
                }}
            />
            ) : (
            <>
                <div style={{ fontSize: '48px', marginBottom: '10px', color: '#ddd' }}>📁</div>
                <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                Drag and drop an image here, or click to select
                </p>
                <p style={{ margin: '0', color: '#999', fontSize: '14px' }}>
                Supports: JPG, PNG, GIF
                </p>
            </>
            )}
        </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f5f5f5';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
              }}
            >
              Clear
            </button>
            <button
              onClick={() => onImageUpload && uploadedImage && onImageUpload()}
              disabled={!uploadedImage || isLoading}
              style={{
                flex: '1',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: uploadedImage && !isLoading ? '#ff9f43' : '#ddd',
                color: 'white',
                cursor: uploadedImage && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (uploadedImage && !isLoading) {
                  e.target.style.backgroundColor = '#ff8c29';
                }
              }}
              onMouseOut={(e) => {
                if (uploadedImage && !isLoading) {
                  e.target.style.backgroundColor = '#ff9f43';
                }
              }}
            >
              {isLoading ? 'Analyzing...' : 'Submit'}
            </button>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div style={{ flex: '1' }}>
          <div style={{
            border: '1px solid #eee',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: 'white',
            minHeight: '280px'
          }}>
            <h3 style={{ 
              margin: '0 0 20px 0', 
              fontSize: '18px',
              color: '#333',
              textAlign: 'center'
            }}>
              Classification Results
            </h3>

            {isLoading ? (
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
                <p style={{ color: '#666' }}>Analyzing image...</p>
              </div>
            ) : prediction ? (
              <div>
                {prediction[0].error ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#e74c3c',
                    backgroundColor: '#fdf2f2',
                    borderRadius: '6px',
                    border: '1px solid #fecaca'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚠️</div>
                    <p style={{ margin: '0', fontSize: '14px' }}>{prediction[0].error}</p>
                  </div>
                ) : (
                  prediction.map((item, index) => (
                    <div key={index} style={{ marginBottom: '15px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '5px'
                      }}>
                        <span style={{ 
                          fontSize: '16px',
                          color: '#333',
                          textTransform: 'capitalize'
                        }}>
                          {item.label}
                        </span>
                        <span style={{ 
                          fontSize: '16px',
                          fontWeight: 'bold',
                          color: getResultColor(item.label)
                        }}>
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div
                          style={{
                            width: `${item.confidence * 100}%`,
                            height: '100%',
                            backgroundColor: getResultColor(item.label),
                            transition: 'width 0.5s ease'
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#999'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '10px' }}>🤖</div>
                <p>Upload an image to see classification results</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}