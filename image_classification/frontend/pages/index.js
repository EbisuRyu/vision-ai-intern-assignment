import { useState } from 'react';
import Head from 'next/head';
import UploadForm from '../components/UploadForm';
import MultiUpload from '../components/MultiUpload';

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [activeTab, setActiveTab] = useState('single'); 


  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const classifyImage = async (imageFile) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      const predictions = [
        {
          label: result.class_name,
          confidence: result.probability
        },
        {
          label: result.class_name === 'dog' ? 'cat' : 'dog', 
          confidence: 1 - result.probability 
        }
      ];


      predictions.sort((a, b) => b.confidence - a.confidence);
      
      setPrediction(predictions);
    } catch (error) {
      console.error('Error classifying image:', error);

      setPrediction([{
        label: 'Error',
        confidence: 0,
        error: 'Failed to classify image. Please try again.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file, imageDataUrl) => {
    setCurrentImage(imageDataUrl);
    setPrediction(null);
    
    if (file) {
      await classifyImage(file);
    }
  };

  const handleClear = () => {
    setPrediction(null);
    setCurrentImage(null);
    setIsLoading(false);
  };

  return (
    <>
      <Head>
        <title>Dog vs Cat Classifier</title>
        <meta name="description" content="AI-powered dog and cat image classifier" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#2c3e50',
            margin: '0 0 10px 0',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}>
            🐕 Dog vs Cat Classifier 🐱
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#7f8c8d',
            margin: '0',
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Upload an image and let our AI determine whether it's a dog or cat!
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'flex',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => setActiveTab('single')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === 'single' ? '#ff9f43' : 'transparent',
                color: activeTab === 'single' ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              🖼️ Single Image
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: activeTab === 'batch' ? '#ff9f43' : 'transparent',
                color: activeTab === 'batch' ? 'white' : '#666',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.3s ease'
              }}
            >
              📚 Batch Processing
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'single' ? (
          <UploadForm
            onImageUpload={handleImageUpload}
            onClear={handleClear}
            prediction={prediction}
            isLoading={isLoading}
          />
        ) : (
          <MultiUpload />
        )}

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '60px',
          padding: '20px',
          borderTop: '1px solid #eee',
          color: '#95a5a6'
        }}>
          <p style={{ margin: '0', fontSize: '14px' }}>
            🤖 Powered by AI • Built with Next.js and React
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px' }}>
            Upload your pet photos and see how accurate our model is!
          </p>
        </div>
      </main>
    </>
  );
}