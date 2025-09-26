import React, { useState, useRef } from 'react';
import { getApiUrl } from '../config/api';

const ImageGenerationModal = ({ isOpen, onClose, careerTitle, careerDescription, onImageSelect, existingImageUrl }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('generate'); // 'generate' or 'upload'
  const [selectedModel, setSelectedModel] = useState('gpt-image-1'); // 'gpt-image-1' or 'dall-e-3'
  const fileInputRef = useRef(null);

  // Generate field-specific custom prompt based on career info
  const getDefaultPrompt = () => {
    // Convert career title to lowercase for matching
    const careerLower = careerTitle.toLowerCase();
    
    // Field-specific prompts with detailed tool descriptions
    const fieldPrompts = {
      'computer science': 'A top-down vector illustration of a person coding at a desk with dual monitors showing code, open terminal, flowcharts, debugging tools, sticky notes, keyboard, mouse, headphones, and coffee. Include digital components like cloud icons, databases, and app wireframes.',
      
      'software engineering': 'A top-down vector illustration of a person coding at a desk with dual monitors showing code, open terminal, flowcharts, debugging tools, sticky notes, keyboard, mouse, headphones, and coffee. Include digital components like cloud icons, databases, and app wireframes.',
      
      'civil engineering': 'A top-down vector illustration of a person drafting building plans. Include blueprints, scale rulers, hard hat, CAD software on a laptop, measuring tape, and concrete/bridge models or materials.',
      
      'mechanical engineering': 'A top-down vector illustration of a person working with mechanical designs. Include engineering drawings, 3D CAD models on screen, mechanical tools, gears, prototypes, calculator, and technical reference books.',
      
      'electrical engineering': 'A top-down vector illustration of a person working with electrical circuits. Include circuit boards, multimeter, oscilloscope, wire strippers, electrical diagrams, breadboards, and electronic components.',
      
      'data science': 'A top-down vector illustration of a person analyzing data with multiple monitors showing charts, graphs, Python/R code, Jupyter notebooks, statistical models, and data visualization tools.',
      
      'medicine': 'A top-down vector illustration of a medical professional studying with medical textbooks, stethoscope, anatomical charts, medical equipment, prescription pad, and clinical reference materials.',
      
      'nursing': 'A top-down vector illustration of a nurse at a station with medical charts, medication reference guides, stethoscope, blood pressure cuff, and patient care documentation.',
      
      'business administration': 'A top-down vector illustration of a person working on business strategy with financial reports, charts, laptop showing business presentations, calculator, and market analysis documents.',
      
      'marketing': 'A top-down vector illustration of a person working on marketing campaigns with mood boards, brand guidelines, social media analytics on screen, creative sketches, and campaign planning materials.',
      
      'graphic design': 'A top-down vector illustration of a graphic designer working with design software on screen, color palettes, sketches, typography samples, design tools, and creative inspiration boards.',
      
      'psychology': 'A top-down vector illustration of a person studying psychology with research papers, brain models, psychological assessment tools, case studies, and behavioral analysis charts.',
      
      'education': 'A top-down vector illustration of an educator preparing lessons with teaching materials, lesson plans, educational resources, grading papers, and learning activity designs.',
      
      'law': 'A top-down vector illustration of a person studying law with legal textbooks, case files, legal research on computer, scales of justice model, and law reference materials.'
    };
    
    // Find matching field prompt
    let specificPrompt = null;
    for (const [field, prompt] of Object.entries(fieldPrompts)) {
      if (careerLower.includes(field) || field.includes(careerLower)) {
        specificPrompt = prompt;
        break;
      }
    }
    
    // If no specific match found, use the general template
    if (!specificPrompt) {
      const tools = careerDescription ? 
        `tools and materials commonly used in ${careerTitle}` : 
        `professional tools and equipment relevant to ${careerTitle}`;
        
      specificPrompt = `A top-down vector illustration of a person sitting at a desk engaged in practical work or study related to ${careerTitle}. The scene should include realistic and thematic ${tools}. The desk should be neatly organized and visually appealing, with digital and analog tools (if applicable), a cup of coffee/tea, and soft shadows for depth.`;
    }
    
    // Add consistent styling instructions
    const styleInstructions = ' Style should be clean, modern, and flat vector-based with rich but not overwhelming colors, similar to an educational infographic or e-learning banner. A top-down view of the workspace and person with soft lighting and minimalistic background.';
    
    return specificPrompt + styleInstructions;
  };

  const handleGenerateImage = async () => {
    if (!careerTitle) {
      setError('Career title is required for image generation');
      return;
    }

    setIsGenerating(true);
    setError('');
    setGeneratedImageUrl(null);

    try {
      const prompt = customPrompt || getDefaultPrompt();
      
      // Configure parameters based on selected model
      let requestBody = {
        prompt,
        model: selectedModel
      };

      if (selectedModel === 'gpt-image-1') {
        // GPT-image-1 parameters
        requestBody.size = '1536x1024'; // Use supported landscape size for banner-like images
        // Note: GPT-image-1 doesn't support quality and style parameters
      } else if (selectedModel === 'dall-e-3') {
        // DALL-E 3 parameters
        requestBody.size = '1792x1024'; // Closest to banner aspect ratio in DALL-E 3
        requestBody.quality = 'standard';
        requestBody.style = 'natural';
      }
      
      const response = await fetch(getApiUrl('/api/ai/generate-image'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
    } catch (err) {
      console.error('Image generation error:', err);
      setError(`Failed to generate image: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError('');
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImageUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUseImage = () => {
    const imageUrl = activeTab === 'generate' ? generatedImageUrl : uploadedImageUrl;
    const imageFile = activeTab === 'upload' ? fileInputRef.current?.files[0] : null;
    
    if (imageUrl) {
      onImageSelect(imageUrl, imageFile);
      onClose();
    }
  };

  const resetModal = () => {
    setGeneratedImageUrl(null);
    setUploadedImageUrl(null);
    setCustomPrompt('');
    setError('');
    setActiveTab('generate');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  const currentImageUrl = activeTab === 'generate' ? generatedImageUrl : uploadedImageUrl;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        maxWidth: '900px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            🎨 Generate Banner Image
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Career Info */}
        <div style={{
          padding: '20px 32px',
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: '#374151' }}>
            {careerTitle}
          </h3>
          {careerDescription && (
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: '1.5' }}>
              {careerDescription.substring(0, 200)}...
            </p>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          padding: '0 32px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', gap: '0' }}>
            <button
              onClick={() => setActiveTab('generate')}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: activeTab === 'generate' ? '#6366f1' : 'transparent',
                color: activeTab === 'generate' ? '#fff' : '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                fontSize: '16px'
              }}
            >
              ✨ Generate with AI
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                padding: '16px 24px',
                border: 'none',
                background: activeTab === 'upload' ? '#6366f1' : 'transparent',
                color: activeTab === 'upload' ? '#fff' : '#6b7280',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                fontSize: '16px'
              }}
            >
              📁 Upload Image
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          {activeTab === 'generate' ? (
            <div>
              {/* Model Selection */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  AI Model
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    backgroundColor: '#fff'
                  }}
                >
                  <option value="gpt-image-1">GPT-Image-1 (Cost-effective, 1536x1024)</option>
                  <option value="dall-e-3">DALL-E 3 (High quality, 1792x1024)</option>
                </select>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  {selectedModel === 'gpt-image-1' 
                    ? 'GPT-Image-1: Fast and cost-effective image generation with 1536x1024 resolution'
                    : 'DALL-E 3: Premium quality image generation with 1792x1024 resolution and style options'
                  }
                </p>
              </div>

              {/* Prompt Input */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '8px'
                }}>
                  Custom Prompt (optional)
                </label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder={getDefaultPrompt()}
                  style={{
                    width: '100%',
                    minHeight: '80px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '4px 0 0 0'
                }}>
                  Leave empty to use the auto-generated prompt based on career info
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateImage}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: isGenerating ? '#9ca3af' : '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '24px'
                }}
              >
                {isGenerating ? (
                  <>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      border: '2px solid transparent',
                      borderTop: '2px solid #fff',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Generating...
                  </>
                ) : (
                  <>
                    ✨ Generate Banner Image
                  </>
                )}
              </button>
            </div>
          ) : (
            <div>
              {/* Upload Area */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '8px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: '#f9fafb',
                  marginBottom: '24px'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
                <p style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>
                  Click to upload an image
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  JPG, PNG, GIF up to 10MB
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              borderRadius: '8px',
              marginBottom: '24px',
              fontSize: '14px'
            }}>
              ⚠️ {error}
            </div>
          )}

          {/* Image Preview */}
          {currentImageUrl && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Preview (1200x600)
              </h4>
              <div style={{
                width: '100%',
                height: '300px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6'
              }}>
                <img
                  src={currentImageUrl}
                  alt="Generated banner preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // This will crop the 1792x1024 image to fit 1200x600 aspect ratio
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          )}

          {/* Existing Image Display */}
          {existingImageUrl && !currentImageUrl && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Current Banner
              </h4>
              <div style={{
                width: '100%',
                height: '300px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6'
              }}>
                <img
                  src={existingImageUrl}
                  alt="Current banner"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // Consistent with the generated image preview
                    borderRadius: '8px'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '12px 24px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              color: '#374151',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleUseImage}
            disabled={!currentImageUrl}
            style={{
              padding: '12px 24px',
              border: 'none',
              backgroundColor: currentImageUrl ? '#6366f1' : '#d1d5db',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: currentImageUrl ? 'pointer' : 'not-allowed'
            }}
          >
            Use This Image
          </button>
        </div>
      </div>

      {/* Add spinning animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default ImageGenerationModal;
