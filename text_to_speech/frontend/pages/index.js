import { useState } from 'react';
import styles from '../styles/Home.module.css';

const examples = [
  "Trăm năm trong cõi người ta, chữ tài chữ mệnh khéo là ghét nhau.",
  "Đoạn trường tân thanh, thường được biết đến với cái tên đơn giản là Truyện Kiều, là một truyện thơ của đại thi hào Nguyễn Du",
  "Lục Vân Tiên quê ở huyện Đông Thành, khôi ngô tuấn tú, tài kiêm văn võ. Nghe tin triều đình mở khoa thi, Vân Tiên từ gia thây xuống núi đua tài.",
  "Lê Quý Đôn, tên thuở nhỏ là Lê Danh Phương, là vị quan thời Lê trung hưng, cũng là nhà thơ và được mệnh danh là nhà bác học lớn của Việt Nam trong thời phong kiến",
  "Tất cả mọi người đều sinh ra có quyền bình đẳng. Tạo hóa cho họ những quyền không ai có thể xâm phạm được; trong những quyền ấy, có quyền được sống, quyền tự do và quyền mưu cầu hạnh phúc."
];

export default function Home() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get API URL from environment variables
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const clearText = () => {
    setText('');
    setError('');
  };

  const setExample = (index) => {
    setText(examples[index]);
    setError('');
  };

  const generateSpeech = async () => {
    if (!text.trim()) {
      setError('Vui lòng nhập văn bản cần chuyển đổi');
      return;
    }

    setError('');
    setLoading(true);
    setAudioUrl('');

    try {
      const formData = new FormData();
      formData.append('text', text);

      const response = await fetch(`${API_BASE_URL}/tts`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra khi tạo âm thanh');
      }

      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      generateSpeech();
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>🎤 Vietnamese Text-to-Speech 🎵</h1>
        <p className={styles.subtitle}>Upload a text and let our AI convert it to speech!</p>
      </header>
      
      <div className={styles.mainContent}>
        <div className={styles.inputSection}>
          <div className={styles.dropZone}>
            <div className={styles.uploadIcon}>📄</div>
            <div className={styles.uploadText}>
              Enter your Vietnamese text here, or click to select
            </div>
            <div className={styles.supportedFormats}>
              Supports: Plain text, Vietnamese characters
            </div>
            <textarea
              className={styles.textArea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập văn bản tiếng Việt của bạn..."
            />
          </div>
          
          <div className={styles.buttonGroup}>
            <button className={styles.clearBtn} onClick={clearText}>
              Clear
            </button>
            <button 
              className={styles.submitBtn} 
              onClick={generateSpeech}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit'}
            </button>
          </div>
          {error && <div className={styles.error}>{error}</div>}
        </div>
        
        <div className={styles.outputSection}>
          <div className={styles.resultHeader}>Audio Results</div>
          <div className={styles.audioContainer}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingIcon}>⏳</div>
                <div>Processing your text...</div>
              </div>
            ) : audioUrl ? (
              <div className={styles.audioPlayer}>
                <audio controls autoPlay>
                  <source src={audioUrl} type="audio/wav" />
                  Trình duyệt của bạn không hỗ trợ phát âm thanh.
                </audio>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🎧</div>
                <div className={styles.emptyText}>
                  Upload a text to hear audio results
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className={styles.examples}>
        <h3>Sample Vietnamese Texts</h3>
        <div className={styles.exampleGrid}>
          {examples.map((example, index) => (
            <button 
              key={index}
              className={styles.exampleCard} 
              onClick={() => setExample(index)}
            >
              <div className={styles.exampleNumber}>{index + 1}</div>
              <div className={styles.exampleText}>{example}</div>
            </button>
          ))}
        </div>
      </div>

      <footer className={styles.footer}>
        <p>🇻🇳 Powered by AI • Built with Next.js and React</p>
        <p>Upload your text and see how accurate our TTS model is!</p>
      </footer>
    </div>
  );
}