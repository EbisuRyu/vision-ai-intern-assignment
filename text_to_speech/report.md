# **Vietnamese Text-to-Speech (TTS) System Proposal**

## **1. Introduction**

Text-to-Speech (TTS) technology converts written text into spoken audio. For Vietnamese, TTS is challenging due to tonal language characteristics, multiple diacritics, and complex word segmentation. A robust Vietnamese TTS system can improve accessibility for visually impaired users, support audiobooks, e-learning platforms, and assistive technologies.

In addition, **text correction** is critical to improve TTS quality because misspelled words or incorrect diacritics lead to unnatural speech. This system integrates **Vietnamese text correction** as a preprocessing step.

## **2. System Pipeline**

The TTS pipeline can be broken down into four main stages:

### **2.1 Text Correction**

* **Purpose:** Automatically fix typos, missing diacritics, or incorrect word forms in Vietnamese text.
* **Model:** [bmd1905/vietnamese-correction-v2](https://huggingface.co/bmd1905/vietnamese-correction-v2) from Hugging Face.
* **Example:**

  ```
  Input: "Toi dang hoc AI"
  Output: "Tôi đang học AI"
  ```
* **Benefits:** Improves pronunciation accuracy and naturalness in TTS output.


### **2.2 Text Preprocessing**

1. **Text Normalization:**

   * Convert numbers, dates, abbreviations, and symbols to spoken forms.

     ```
     12/08/2025 → mười hai tháng tám năm hai nghìn không trăm hai mươi lăm
     ```
   * Handle punctuation and special characters.

2. **Word Segmentation:**

   * Vietnamese words are often multiple syllables without spaces.
   * Tools: **VnCoreNLP** or **PyVi**.

3. **Phoneme Conversion:**

   * Map words or syllables to phonetic representations with tones.

     ```
     Việt Nam → /viət/ /nam/
     ```
   * Tone detection is critical for natural speech.


### **2.3 Acoustic Model (Text → Mel Spectrogram)**

* **Model Options:**

  * **Tacotron 2**: Sequence-to-sequence model converting text/phonemes into Mel-spectrograms.
  * **FastSpeech 2**: Non-autoregressive model, faster inference, stable for long sentences.
* **Input:** Phoneme sequence with tone information.
* **Output:** Mel-spectrogram representing audio features over time.


### **2.4 Vocoder (Spectrogram → Waveform)**

* **Purpose:** Convert Mel-spectrogram to audible waveform.
* **Popular choices:**

  * **HiFi-GAN:** High-quality, fast neural vocoder.
  * **WaveGlow:** Alternative neural vocoder with good quality.
* **Training:** Use high-quality Vietnamese speech data to ensure naturalness.


### **2.5 Post-processing**

* **Audio Normalization:** Ensure consistent volume and remove artifacts.
* **Optional Prosody Enhancement:** Adjust intonation, stress, and rhythm for natural speech.


## **3. Data Requirements**

* **Speech Corpus:** High-quality Vietnamese speech datasets (e.g., **VIVOS**) or self-recorded data.
* **Text Corpus:** Vietnamese text dataset for normalization, correction, and training language models.


## **4. Challenges and Solutions**

| **Challenge**                        | **Description**                                               | **Solution**                                                                    |
| ------------------------------------ | ------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Tonal Accuracy**                   | Vietnamese has 6 tones; wrong tone changes meaning.           | Include tone as explicit feature in phoneme encoding; use tone-aware models.    |
| **Word Segmentation**                | Vietnamese words are multi-syllable, no spaces between words. | Use word segmentation tools (VnCoreNLP, PyVi) before TTS.                       |
| **Data Scarcity**                    | Large aligned Vietnamese speech datasets are limited.         | Use semi-supervised learning or transfer learning from multilingual TTS models. |
| **Pronunciation of Numbers & Dates** | Multiple ways to read numbers.                                | Implement rule-based text normalization before phoneme conversion.              |
| **Text Errors**                      | Typos or missing diacritics reduce TTS quality.               | Apply **Vietnamese text correction model** before preprocessing.                |
| **Prosody & Naturalness**            | Monotone speech may sound robotic.                            | Train models on expressive speech; use prosody modeling.                        |

---

## **5. Implementation Plan**

1. **Data Preparation**

   * Collect Vietnamese speech and text corpus.
   * Apply **text correction**, then normalize text, segment words, and convert to phonemes.
2. **Model Training**

   * Train Tacotron 2 or FastSpeech 2 for spectrogram generation.
   * Train HiFi-GAN for waveform synthesis.
3. **Evaluation**

   * **Objective Metrics:** Mel cepstral distortion (MCD), F0 RMSE.
   * **Subjective Metrics:** MOS (Mean Opinion Score) by human listeners.
4. **Deployment**

   * Package as an API for real-time TTS.
   * Optionally, provide offline support using [VietTTS](https://github.com/NTT123/vietTTS).


## **6. Future Improvements**

* Multi-speaker TTS.
* Emotion-aware TTS.
* End-to-End Vietnamese TTS with transformer-based architectures (VITS, Glow-TTS).
* Dynamic integration of correction for user-input text in real-time applications.


## **7. References**

* Vietnamese Correction Model: [bmd1905/vietnamese-correction-v2](https://huggingface.co/bmd1905/vietnamese-correction-v2)
* VietTTS: [https://github.com/NTT123/vietTTS](https://github.com/NTT123/vietTTS)
* Tacotron 2: [https://arxiv.org/abs/1712.05884](https://arxiv.org/abs/1712.05884)
* FastSpeech 2: [https://arxiv.org/abs/2006.04558](https://arxiv.org/abs/2006.04558)
* HiFi-GAN: [https://arxiv.org/abs/2010.05646](https://arxiv.org/abs/2010.05646)
* VnCoreNLP: [https://github.com/vncorenlp/VnCoreNLP](https://github.com/vncorenlp/VnCoreNLP)