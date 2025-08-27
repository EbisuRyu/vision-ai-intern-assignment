
# **Vietnamese Text-to-Speech (TTS) System Proposal**

## **1. Introduction**

Text-to-Speech (TTS) technology converts written text into spoken audio. For Vietnamese, TTS is challenging due to tonal language characteristics, multiple diacritics, and complex word segmentation. A robust Vietnamese TTS system can improve accessibility for visually impaired users, support audiobooks, e-learning platforms, and assistive technologies.


## **2. System Pipeline**

The TTS pipeline can be broken down into three main stages:

### **2.1 Text Preprocessing**

1. **Text Normalization:**

   * Convert numbers, dates, abbreviations, and symbols to their spoken forms.
     Example: `12/08/2025` → `mười hai tháng tám năm hai nghìn không trăm hai mươi lăm`.
   * Handle punctuation and special characters.

2. **Word Segmentation:**

   * Vietnamese words are often multiple syllables without spaces. Use tools like **VnCoreNLP** or **PyVi** to segment text correctly.

3. **Phoneme Conversion:**

   * Map each word or syllable to its phonetic representation using **Vietnamese phonemes**.
   * Example: `Việt Nam` → `/viət/ /nam/`.
   * Tone detection is critical because Vietnamese is tonal; incorrect tones lead to unnatural speech.

---

### **2.2 Acoustic Model (Text → Mel Spectrogram)**

* **Model Options:**

  * **Tacotron 2:** Sequence-to-sequence model that converts text/phonemes into Mel-spectrograms.
  * **FastSpeech 2:** Non-autoregressive model with faster inference, improved stability for long sentences.
* **Input:** Phoneme sequence with tone information.
* **Output:** Mel-spectrogram, representing audio features over time.

---

### **2.3 Vocoder (Spectrogram → Waveform)**

* **Purpose:** Convert Mel-spectrogram to audible waveform.
* **Popular choices:**

  * **HiFi-GAN:** High-quality, fast neural vocoder.
  * **WaveGlow:** Alternative neural vocoder with good quality.
* **Training:** Train with high-quality Vietnamese speech data to ensure naturalness.

---

### **2.4 Post-processing**

* **Audio Normalization:** Ensure consistent volume and remove artifacts.
* **Optional Prosody Enhancement:** Adjust intonation, stress, and rhythm for natural speech.

---

## **3. Data Requirements**

* **Speech Corpus:** High-quality Vietnamese speech datasets (like **VIVOS** or self-recorded datasets).
  Requirements:

  * Clean recordings (studio quality preferred)
  * 16kHz or higher sampling rate
  * Phoneme-level or word-level alignment (for Tacotron 2)
* **Text Corpus:** Vietnamese text dataset for normalization and training language models.

---

## **4. Challenges and Solutions**

| **Challenge**                        | **Description**                                               | **Solution**                                                                     |
| ------------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Tonal Accuracy**                   | Vietnamese has 6 tones; wrong tone changes meaning.           | Include tone as an explicit feature in phoneme encoding; use tone-aware models.  |
| **Word Segmentation**                | Vietnamese words are multi-syllable, no spaces between words. | Use word segmentation tools (VnCoreNLP, PyVi) before TTS.                        |
| **Data Scarcity**                    | Large aligned Vietnamese speech datasets are limited.         | Use semi-supervised learning or transfer learning from multi-lingual TTS models. |
| **Pronunciation of Numbers & Dates** | Multiple ways to read numbers.                                | Implement rule-based text normalization before phoneme conversion.               |
| **Prosody & Naturalness**            | Monotone speech may sound robotic.                            | Train models on expressive speech; use prosody modeling.                         |

---

## **5. Implementation Plan**

1. **Data Preparation**

   * Collect Vietnamese speech and text corpus.
   * Normalize text, segment words, convert to phonemes.
2. **Model Training**

   * Train Tacotron 2 or FastSpeech 2 for spectrogram generation.
   * Train HiFi-GAN for waveform synthesis.
3. **Evaluation**

   * **Objective Metrics:** Mel cepstral distortion (MCD), F0 RMSE.
   * **Subjective Metrics:** MOS (Mean Opinion Score) by human listeners.
4. **Deployment**

   * Package as an API for real-time TTS.
   * Optionally, provide offline support.

---

## **6. Future Improvements**

* **Multi-speaker TTS:** Support different voices and genders.
* **Emotion-aware TTS:** Add emotional prosody (happy, sad, neutral).
* **End-to-End Vietnamese TTS:** Explore multilingual or transformer-based TTS (VITS, Glow-TTS).

---

## **7. References**

* Tacotron 2: [https://arxiv.org/abs/1712.05884](https://arxiv.org/abs/1712.05884)
* FastSpeech 2: [https://arxiv.org/abs/2006.04558](https://arxiv.org/abs/2006.04558)
* HiFi-GAN: [https://arxiv.org/abs/2010.05646](https://arxiv.org/abs/2010.05646)
* VnCoreNLP: [https://github.com/vncorenlp/VnCoreNLP](https://github.com/vncorenlp/VnCoreNLP)