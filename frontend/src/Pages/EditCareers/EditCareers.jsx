
import React, { useEffect, useState } from 'react';
import { db, storage } from '../../firebase';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApiUrl } from '../../config/api';
import ImageGenerationModal from '../../components/ImageGenerationModal';
import ProductionDebugger from '../../components/ProductionDebugger';
import styles from './EditCareers.module.css';
import { useNavigate, useLocation } from 'react-router-dom';

// AI Enhancement Modal Component
const AIEnhancementModal = ({ isOpen, onClose, originalContent, onApply, fieldPath, careerTitle }) => {
  const [prompt, setPrompt] = useState('');
  const [enhancedContent, setEnhancedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  // const category = careerCategory;
  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPrompt('');
      setEnhancedContent('');
      setError('');
    }
  }, [isOpen]);

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      setError('Please provide instructions for enhancement');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/api/ai/enhance'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: originalContent,
          prompt: prompt,
          context: {
            careerTitle,
            fieldPath,
            contentType: getContentType(fieldPath)
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEnhancedContent(data.enhancedContent);
    } catch (error) {
      console.error('Error enhancing content:', error);
      setError('Failed to enhance content. Please try again.');
      // Fallback content
      setEnhancedContent(originalContent + ' [AI enhancement unavailable]');
    } finally {
      setIsLoading(false);
    }
  };

  const getContentType = (path) => {
    const lowerPath = path.toLowerCase();
    
    // Specific field type mappings
    if (lowerPath.includes('summary')) return 'career summary';
    if (lowerPath.includes('work description')) return 'work description';
    if (lowerPath.includes('career-opportunities') || lowerPath.includes('opportunities')) return 'career opportunity';
    if (lowerPath.includes('important facts')) return 'important facts';
    if (lowerPath.includes('pros')) return 'professional advantages';
    if (lowerPath.includes('cons')) return 'professional challenges';
    if (lowerPath.includes('stream')) return 'educational stream';
    if (lowerPath.includes('graduation')) return 'graduation requirement';
    if (lowerPath.includes('after graduation')) return 'post-graduation path';
    if (lowerPath.includes('elements')) return 'exam elements';
    if (lowerPath.includes('name') && lowerPath.includes('exam')) return 'examination name';
    if (lowerPath.includes('name') && lowerPath.includes('institute')) return 'institute name';
    if (lowerPath.includes('location')) return 'institute location';
    if (lowerPath.includes('date')) return 'examination date';
    
    return 'career content';
  };

  const getEnhancementPrompts = (contentType, originalContent) => {
    const prompts = {
      'career summary': [
        `Make this career summary more comprehensive and engaging for ${careerTitle}`,
        `Add more specific details about the profession for ${careerTitle}`,
        `Improve the professional tone and clarity for ${careerTitle}`,
        `Include current industry trends and relevance for ${careerTitle}`
      ],
      'career opportunity': [
        `Expand on this career opportunity with specific details for ${careerTitle}`,
        `Add salary ranges and growth prospects for ${careerTitle}`,
        `Include required skills and qualifications for ${careerTitle}`,
        `Make it more appealing to potential candidates for ${careerTitle}`
      ],
      'work description': [
        `Make this work description more detailed and specific for ${careerTitle}`,
        `Add technical skills and tools required for ${careerTitle}`,
        `Include daily responsibilities and challenges for ${careerTitle}`,
        `Improve professional language and structure for ${careerTitle}`
      ],
      'important facts': [
        `Add more relevant and current facts for ${careerTitle}`,
        `Include statistical data and market insights for ${careerTitle}`,
        `Make the facts more compelling and informative for ${careerTitle}`,
        `Add recent developments in the field for ${careerTitle}`
      ],
      'educational stream': [
        `Provide more specific educational requirements for ${careerTitle}`,
        `Add alternative streams and pathways for ${careerTitle}`,
        `Include minimum qualifications needed for ${careerTitle}`,
        `Make the requirements clearer for ${careerTitle}`
      ],
      'graduation requirement': [
        `Detail the graduation requirements more thoroughly for ${careerTitle}`,
        `Add specific courses and specializations for ${careerTitle}`,
        `Include duration and key subjects for ${careerTitle}`,
        `Mention top universities offering this program for ${careerTitle}`
      ],
      'post-graduation path': [
        `Expand on post-graduation opportunities for ${careerTitle}`,
        `Add specific advanced degree options for ${careerTitle}`,
        `Include research and specialization areas for ${careerTitle}`,
        `Mention career advancement possibilities for ${careerTitle}`
      ],
      'exam elements': [
        `Provide detailed exam syllabus breakdown for ${careerTitle}`,
        `Add preparation tips and resources for ${careerTitle}`,
        `Include exam pattern and scoring details for ${careerTitle}`,
        `Mention difficulty level and success rates for ${careerTitle}`
      ],
      'professional advantages': [
        `Add more compelling professional benefits for ${careerTitle}`,
        `Include long-term career advantages for ${careerTitle}`,
        `Mention work-life balance aspects for ${careerTitle}`,
        `Add growth and learning opportunities for ${careerTitle}`
      ],
      'professional challenges': [
        `Provide realistic career challenges for ${careerTitle}`,
        `Include ways to overcome these challenges for ${careerTitle}`,
        `Add industry-specific difficulties for ${careerTitle}`,
        `Mention preparation strategies for ${careerTitle}`
      ],
      'institute name': [
        `Improve the institute name formatting for ${careerTitle}`,
        `Add full official name if abbreviated for ${careerTitle}`,
        `Include accreditation details for ${careerTitle}`,
        `Add ranking or reputation information for ${careerTitle}`
      ],
      'institute location': [
        `Provide complete location details for ${careerTitle}`,
        `Add city, state, and accessibility information for ${careerTitle}`,
        `Include campus facilities information for ${careerTitle}`,
        `Mention nearby landmarks or metro connectivity for ${careerTitle}`
      ],
      'examination name': [
        `Provide full examination name and acronym for ${careerTitle}`,
        `Add conducting body information for ${careerTitle}`,
        `Include exam frequency and validity for ${careerTitle}`,
        `Mention recognition and acceptance for ${careerTitle}`
      ],
      'examination date': [
        `Provide specific examination schedule for ${careerTitle}`,
        `Add application deadlines for ${careerTitle}`,
        `Include result declaration dates for ${careerTitle}`,
        `Mention exam frequency (annual/bi-annual) for ${careerTitle}`
      ]
    };
    
    return prompts[contentType] || [
      `Improve the content quality and clarity for ${careerTitle}`,
      `Add more specific and relevant details for ${careerTitle}`,
      `Enhance professional language and tone for ${careerTitle}`,
      `Make the content more comprehensive for ${careerTitle}`
    ];
  };

  const handleApply = () => {
    if (enhancedContent.trim()) {
      onApply(enhancedContent);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '600',
            color: '#1f2937',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '28px'
            }}>✨</span>
            AI Content Enhancement
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            ×
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Original Content */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Original Content
            </label>
            <textarea
              value={originalContent}
              readOnly
              style={{
                width: '100%',
                minHeight: '100px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: '#f9fafb',
                color: '#6b7280',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* User Prompt */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Enhancement Instructions
            </label>
            
            {/* Smart Prompt Suggestions */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>
                Quick suggestions for {getContentType(fieldPath)}:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {getEnhancementPrompts(getContentType(fieldPath), originalContent).map((suggestion, index) => {
                  const isSelected = prompt.split(', ').map(p => p.trim()).includes(suggestion);
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const currentPrompts = prompt.split(', ').map(p => p.trim()).filter(p => p !== '');
                        if (isSelected) {
                          // Remove the suggestion if it's already selected
                          const updatedPrompts = currentPrompts.filter(p => p !== suggestion);
                          setPrompt(updatedPrompts.join(', '));
                        } else {
                          // Add the suggestion if it's not selected
                          const updatedPrompts = [...currentPrompts, suggestion];
                          setPrompt(updatedPrompts.join(', '));
                        }
                      }}
                      style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        backgroundColor: isSelected ? '#6366f1' : '#f3f4f6',
                        color: isSelected ? 'white' : '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = '#e5e7eb';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.target.style.backgroundColor = '#f3f4f6';
                        }
                      }}
                    >
                      {suggestion}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe how you want to enhance this content (e.g., 'Make it more professional', 'Add more detail', 'Improve clarity')"
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
          </div>

          {/* Enhanced Content */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Enhanced Content
            </label>
            <textarea
              value={enhancedContent}
              onChange={(e) => setEnhancedContent(e.target.value)}
              placeholder="Enhanced content will appear here after clicking 'Enhance'"
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '8px',
              fontSize: '14px',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <button
              onClick={handleEnhance}
              disabled={isLoading || !prompt.trim()}
              style={{
                background: isLoading || !prompt.trim() 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isLoading || !prompt.trim() ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Enhancing...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Enhance
                </>
              )}
            </button>
            
            <button
              onClick={handleApply}
              disabled={!enhancedContent.trim()}
              style={{
                background: !enhancedContent.trim() ? '#9ca3af' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: !enhancedContent.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Apply Changes
            </button>
            
            <button
              onClick={onClose}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.background = '#4b5563'}
              onMouseLeave={e => e.target.style.background = '#6b7280'}
            >
              Cancel
            </button>
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
};

// Recursive editor for nested objects/arrays
const NestedEditor = ({ value, onChange, isTopLevel = false, parentHeading = '', fieldKey = '', selectedCareer = '', onOpenAiModal }) => {
  const [expanded, setExpanded] = useState(true);
  const [editingKeys, setEditingKeys] = useState({});

  // Simple function to determine if a field should have AI enhancement
  const shouldShowMagicButton = (content, isTopLevel = false) => {
    // Only show for string content (including empty strings)
    if (typeof content !== 'string') return false;
    
    // Don't show Magic buttons at top level (these are handled by the main editor)
    if (isTopLevel) return false;
    
    // Show magic button for all string values (including empty ones)
    return true;
  };

  if (Array.isArray(value)) {
    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, marginBottom: 8 }}>
        {!isTopLevel && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              style={{
                marginBottom: 8,
                background: 'none',
                border: 'none',
                fontSize: 22,
                fontWeight: 600,
                color: '#6366f1',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        )}
        {(isTopLevel || expanded) && (
          <div>
            {value.map((item, idx) => (
              <div key={idx} style={{ marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <NestedEditor 
                    value={item} 
                    onChange={v => {
                      const newArr = [...value];
                      newArr[idx] = v;
                      onChange(newArr);
                    }} 
                    isTopLevel={false} 
                    parentHeading={parentHeading}
                    fieldKey={`${fieldKey}[${idx}]`}
                    selectedCareer={selectedCareer}
                    onOpenAiModal={onOpenAiModal}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newArr = value.filter((_, i) => i !== idx);
                      onChange(newArr);
                    }} 
                    style={{ 
                      background: '#fee2e2', 
                      color: '#b91c1c', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: '6px 12px', 
                      fontWeight: 600, 
                      fontSize: 14, 
                      cursor: 'pointer',
                      alignSelf: 'flex-start'
                    }}
                  >
                    Delete
                  </button>
                  {shouldShowMagicButton(item, false) && (
                    <button
                      type="button"
                      onClick={() => onOpenAiModal && onOpenAiModal(item, `${parentHeading} > Item ${idx + 1}`, (enhancedContent) => {
                        const newArr = [...value];
                        newArr[idx] = enhancedContent;
                        onChange(newArr);
                      })}
                      style={{
                        background: 'linear-gradient(135deg, #ac00fcff 0%, #9700bdff 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 2px 4px 0 rgba(245,158,11,0.2)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px 0 rgba(245,158,11,0.3)';
                      }}
                      onMouseLeave={e => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px 0 rgba(245,158,11,0.2)';
                      }}
                    >
                      ✨ Magic
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button 
              type="button" 
              onClick={() => {
                // Infer type from sibling values (same logic as Add Field)
                const siblings = value;
                let newValue = '';
                if (siblings.length > 0) {
                  const allStrings = siblings.every(v => typeof v === 'string');
                  const allArrays = siblings.every(v => Array.isArray(v));
                  const allObjects = siblings.every(v => typeof v === 'object' && v !== null && !Array.isArray(v));
                  if (allStrings) newValue = '';
                  else if (allArrays) newValue = [];
                  else if (allObjects) {
                    // For entrance exam arrays, create object with fixed fields
                    if (parentHeading === 'entrance exam') {
                      newValue = { name: '', date: '', elements: '', website: '' };
                    } else {
                      newValue = {};
                    }
                  } else newValue = '';
                } else {
                  // Default for empty arrays
                  if (parentHeading === 'entrance exam') {
                    newValue = { name: '', date: '', elements: '', website: '' };
                  } else if (parentHeading === 'work description' || parentHeading === 'pros and cons') {
                    newValue = '';
                  } else {
                    newValue = {};
                  }
                }
                onChange([...value, newValue]);
              }} 
              style={{
                marginTop: 8,
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 16px',
                fontWeight: 600,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px 0 rgba(99,102,241,0.15)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px 0 rgba(99,102,241,0.25)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px 0 rgba(99,102,241,0.15)';
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 700 }}>+</span>
              Add Field
            </button>
          </div>
        )}
      </div>
    );
  }
  if (typeof value === 'object' && value !== null) {
    // Local state for editing key names
    const handleKeyChange = (oldKey, newKey) => {
      setEditingKeys(prev => ({ ...prev, [oldKey]: newKey }));
    };
    const handleKeyBlur = (oldKey, v) => {
      const newKey = editingKeys[oldKey] ?? oldKey;
      if (!newKey || newKey === oldKey) return;
      const newObj = { ...value };
      delete newObj[oldKey];
      newObj[newKey] = v;
      setEditingKeys(prev => {
        const cp = { ...prev };
        delete cp[oldKey];
        return cp;
      });
      onChange(newObj);
    };
    // Add field automatically inferring type from siblings
    return (
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: 12, marginBottom: 8 }}>
        {!isTopLevel && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <button
              type="button"
              onClick={() => setExpanded(e => !e)}
              style={{
                marginBottom: 8,
                background: 'none',
                border: 'none',
                fontSize: 22,
                fontWeight: 600,
                color: '#6366f1',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              {expanded ? '▼' : '▶'}
            </button>
          </div>
        )}
        {(isTopLevel || expanded) && (
          <div>
            {Object.entries(value).map(([k, v]) => (
              <div key={k} style={{ marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <textarea
                  value={editingKeys[k] ?? k}
                  onChange={e => handleKeyChange(k, e.target.value)}
                  onBlur={() => handleKeyBlur(k, v)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.target.blur();
                    }
                  }}
                  style={{ 
                    width: 140, 
                    marginRight: 8, 
                    minHeight: '185px', 
                    resize: 'vertical',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1 }}>
                  <NestedEditor 
                    value={v} 
                    onChange={nv => {
                      const newObj = { ...value, [k]: nv };
                      onChange(newObj);
                    }} 
                    isTopLevel={false} 
                    parentHeading={parentHeading}
                    fieldKey={`${fieldKey}.${k}`}
                    selectedCareer={selectedCareer}
                    onOpenAiModal={onOpenAiModal}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      const newObj = { ...value };
                      delete newObj[k];
                      onChange(newObj);
                    }} 
                    style={{ 
                      background: '#fee2e2', 
                      color: '#b91c1c', 
                      border: 'none', 
                      borderRadius: 6, 
                      padding: '6px 12px', 
                      fontWeight: 600, 
                      fontSize: 14, 
                      cursor: 'pointer',
                      alignSelf: 'flex-start'
                    }}
                  >
                    Delete
                  </button>
                  {shouldShowMagicButton(v, false) && (
                    <button
                      type="button"
                      onClick={() => onOpenAiModal && onOpenAiModal(v, `${parentHeading} > ${k}`, (enhancedContent) => {
                        const newObj = { ...value, [k]: enhancedContent };
                        onChange(newObj);
                      })}
                      style={{
                        background: 'linear-gradient(135deg, #ac00fcff 0%, #9700bdff 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        padding: '6px 12px',
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        boxShadow: '0 2px 4px 0 rgba(245,158,11,0.2)',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={e => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px 0 rgba(245,158,11,0.3)';
                      }}
                      onMouseLeave={e => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px 0 rgba(245,158,11,0.2)';
                      }}
                    >
                      ✨ Magic
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 8, gap: 8 }}>
              <button 
                type="button" 
                onClick={() => {
                  // const existingKeys = Object.keys(value);
                  let newKey = '';
                  let newValue = '';

                  // All fields are now manually editable - no auto-naming
                  newKey = '';
                  
                  // Infer type from sibling values for all contexts
                  const siblings = Object.values(value);
                  if (siblings.length > 0) {
                    const allStrings = siblings.every(v => typeof v === 'string');
                    const allArrays = siblings.every(v => Array.isArray(v));
                    const allObjects = siblings.every(v => typeof v === 'object' && v !== null && !Array.isArray(v));
                    if (allStrings) newValue = '';
                    else if (allArrays) newValue = [];
                    else if (allObjects) newValue = {};
                    else newValue = '';
                  }

                  const newObj = { ...value, [newKey]: newValue };
                  onChange(newObj);
                }}
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 16px',
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px 0 rgba(99,102,241,0.15)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 12px 0 rgba(99,102,241,0.25)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px 0 rgba(99,102,241,0.15)';
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 700 }}>+</span>
                Add Field
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
        <textarea
          value={value ?? ''}
          onChange={e => onChange(e.target.value)}
          style={{ 
            width: '100%', 
            marginBottom: 0, 
            minHeight: '185px', 
            resize: 'vertical',
            padding: '12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: 'inherit'
          }}
        />
        {/* Show magic button for top-level string fields like summary */}
        {isTopLevel && typeof value === 'string' && onOpenAiModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => onOpenAiModal(value, parentHeading, (enhancedContent) => {
                onChange(enhancedContent);
              })}
              style={{
                background: 'linear-gradient(135deg, #ac00fcff 0%, #9700bdff 100%)',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                boxShadow: '0 2px 4px 0 rgba(245,158,11,0.2)',
                transition: 'all 0.2s ease',
                alignSelf: 'flex-start'
              }}
              onMouseEnter={e => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px 0 rgba(245,158,11,0.3)';
              }}
              onMouseLeave={e => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 4px 0 rgba(245,158,11,0.2)';
              }}
            >
              ✨ Magic
            </button>
          </div>
        )}
      </div>
    </>
  );
};

const EditCareers = () => {
  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();
  
  // AI Modal state
  const [aiModal, setAiModal] = useState({ isOpen: false, content: '', fieldPath: '', onApply: null });

  // Image Generation Modal state
  const [imageModal, setImageModal] = useState({ isOpen: false });
  const [bannerImages, setBannerImages] = useState({}); // Store banner images by page ID

  // Default headings for a new page
  const defaultHeadings = [
    'title',
    'summary',
    'how to become',
    'career-opportunities',
    'Important Facts',
    'leading institutes',
    'entrance exam',
    'work description',
    'pros and cons'
  ];

  // Format timestamp to human readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMs = now - date;
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
      
      if (diffInDays === 0) {
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        if (diffInHours === 0) {
          const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
          if (diffInMinutes < 1) return 'Just now';
          return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
        }
        return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
      } else if (diffInDays === 1) {
        return 'Yesterday';
      } else if (diffInDays < 7) {
        return `${diffInDays} days ago`;
      } else {
        return date.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (e) {
      return '';
    }
  };

  // State for managing collapsed headings - start with all sections collapsed
  const [collapsedHeadings, setCollapsedHeadings] = useState(() => {
    const initialCollapsed = {};
    defaultHeadings.forEach(heading => {
      initialCollapsed[heading] = true; // Start all sections collapsed
    });
    return initialCollapsed;
  });

  // Toggle collapse state for a heading
  const toggleHeadingCollapse = (heading) => {
    setCollapsedHeadings(prev => ({
      ...prev,
      [heading]: !prev[heading]
    }));
  };

  // Open AI enhancement modal
  const openAiModal = (content, path, onApply) => {
    setAiModal({
      isOpen: true,
      content,
      fieldPath: path,
      onApply
    });
  };

  // Open image generation modal
  const openImageModal = () => {
    setImageModal({ isOpen: true });
  };

  // Handle image selection from modal
  const handleImageSelect = async (imageUrl, imageFile) => {
    if (!selectedPage) return;

    try {
      let finalImageUrl = imageUrl;

      // If it's an uploaded file, upload to Firebase Storage
      if (imageFile) {
        const imageRef = ref(storage, `career-banners/${selectedPage.id}-${Date.now()}.${imageFile.name.split('.').pop()}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        finalImageUrl = await getDownloadURL(uploadResult.ref);
      }
      // If it's a generated image (URL), we might want to download and re-upload for consistency
      else if (imageUrl && imageUrl.startsWith('http')) {
        // For generated images, we can store the URL directly or download and re-upload
        // For now, we'll store the URL directly but in production you might want to download and re-upload
        finalImageUrl = imageUrl;
      }

      // Store the image URL in local state (will be saved when page is saved)
      setBannerImages(prev => ({
        ...prev,
        [selectedPage.id]: finalImageUrl
      }));

      // If this is an existing page, update the database immediately
      if (!selectedPage.id.startsWith('new_')) {
        const pageDoc = doc(db, 'careerPages', selectedPage.id);
        await updateDoc(pageDoc, {
          bannerImage: finalImageUrl,
          lastModified: new Date().toISOString()
        });

        // Update local page state
        setPages(prev => prev.map(p =>
          p.id === selectedPage.id
            ? { ...p, bannerImage: finalImageUrl, lastModified: new Date().toISOString() }
            : p
        ));
        setCareerPages(prev => prev.map(p =>
          p.id === selectedPage.id
            ? { ...p, bannerImage: finalImageUrl, lastModified: new Date().toISOString() }
            : p
        ));

        alert('✅ Banner image saved successfully!');
      }

    } catch (error) {
      console.error('Error saving banner image:', error);
      alert('❌ Failed to save banner image: ' + error.message);
    }
  };

  // Add a new page for the selected career (local only until saved)
  const handleAddPage = async () => {
    if (!selectedCareer) return;
    let pageName = window.prompt('Enter page name (will be used in URL):');
    if (!pageName) return;
    pageName = pageName.trim();
    const pageNameSlug = pageName.replace(/\s+/g, '-');
    const pageUrl = `https://www.career-9.com/careerlibrary/${selectedCareer}/${pageNameSlug}`;
    // Generate a temporary id for the new page
    const tempId = 'new_' + Math.random().toString(36).slice(2);
    
    // Create default schema structure for a new page (with flexible field names)
    const createDefaultSchema = () => {
      return {
        title: pageName,
        summary: '',
        'how to become': {
          'path 1': {
            stream: '',
            graduation: '',
            'after graduation': ''
          }
        },
        'career-opportunities': {
          '': ''
        },
        'Important Facts': '',
        'leading institutes': {
          '1': {
            name: '',
            location: '',
            website: ''
          }
        },
        'entrance exam': [
          {
            name: '',
            date: '',
            elements: '',
            website: ''
          }
        ],
        'work description': [
          ''
        ],
        'pros and cons': {
          pros: [
            ''
          ],
          cons: [
            ''
          ]
        },
        isActive: true, // New pages are active by default
        timestamp: new Date().toISOString()
      };
    };

    // Find a template page for this career
    const templatePage = careerPages.find(p => p.career === selectedCareer && p.id !== tempId);
    let newFields;
    
    if (templatePage) {
      // Deep clone the field structure, but blank out all values except title
      newFields = {};
      defaultHeadings.forEach(h => {
        if (h === 'title') {
          newFields[h] = pageName;
        } else if (templatePage[h] !== undefined) {
          // If value is object/array, deep clone structure but blank values
          const val = templatePage[h];
          if (typeof val === 'object' && val !== null) {
            const blankClone = (obj) => {
              if (Array.isArray(obj)) {
                // For arrays, return array with one empty item of same type as original
                if (obj.length > 0) {
                  const firstItem = obj[0];
                  if (typeof firstItem === 'string') {
                    return [''];
                  } else if (typeof firstItem === 'object' && firstItem !== null) {
                    const blankItem = {};
                    Object.keys(firstItem).forEach(k => {
                      blankItem[k] = '';
                    });
                    return [blankItem];
                  }
                }
                return [''];
              }
              if (typeof obj === 'object' && obj !== null) {
                const out = {};
                Object.keys(obj).forEach(k => {
                  out[k] = blankClone(obj[k]);
                });
                return out;
              }
              return '';
            };
            newFields[h] = blankClone(val);
          } else {
            newFields[h] = '';
          }
        } else {
          // Use default schema for missing fields
          const defaultSchema = createDefaultSchema();
          newFields[h] = defaultSchema[h] || '';
        }
      });
    } else {
      // No template found, use default schema
      newFields = createDefaultSchema();
    }
    
    const newPage = {
      id: tempId,
      career: selectedCareer,
      pageUrl,
      originalSlug: pageNameSlug, // Store the original slug for consistent docID
      ...newFields
    };
    setCareerPages(prev => [...prev, newPage]);
    setPages(prev => [...prev, newPage]);
    setSelectedPageId(tempId);
    setEditState(prev => ({ ...prev, [tempId]: newFields }));
    setOriginalState(prev => ({ ...prev, [tempId]: newFields }));

    // Save to savedUrls collection
    try {
      const fsDoc = doc;
      const savedUrlsCol = collection(db, 'savedUrls');
      const urlDoc = fsDoc(savedUrlsCol, pageNameSlug);
      await setDoc(urlDoc, {
        pageUrl,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      alert('Failed to save page URL: ' + e.message);
    }
  };
  const [careers, setCareers] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState('');
  const [careerPages, setCareerPages] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedPageId, setSelectedPageId] = useState(null);
  const [editState, setEditState] = useState({});
  // Store original values for undo
  const [originalState, setOriginalState] = useState({});
  const [saving, setSaving] = useState({});
  const [deleting, setDeleting] = useState({});
  const [showHiddenPages, setShowHiddenPages] = useState(false);
  // ...existing code...

  useEffect(() => {
    const fetchData = async () => {
      // ...existing code...
      const savedUrlsSnap = await getDocs(collection(db, 'savedUrls'));
      const savedUrlsList = [];
      savedUrlsSnap.forEach(doc => {
        savedUrlsList.push({ id: doc.id, ...doc.data() });
      });
      const careerSet = new Set();
      savedUrlsList.forEach(link => {
        try {
          const url = new URL(link.pageUrl);
          const pathParts = url.pathname.replace(/^\//, '').split('/');
          const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
          if (clIdx !== -1 && pathParts[clIdx + 1]) {
            careerSet.add(pathParts[clIdx + 1]);
          }
        } catch (e) {}
      });
      setCareers(Array.from(careerSet));

      const pagesSnap = await getDocs(collection(db, 'careerPages'));
      const allPages = [];
      pagesSnap.forEach(doc => {
        allPages.push({ id: doc.id, ...doc.data() });
      });
      setCareerPages(allPages);
      // ...existing code...
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedCareer) {
      setPages([]);
      setSelectedPageId(null);
      setOriginalState({});
      return;
    }
    const filtered = careerPages.filter(page => {
      // Filter by visibility based on toggle
      if (!showHiddenPages && page.isActive === false) return false;
      
      if (page.career === selectedCareer) return true;
      if (page.pageUrl) {
        try {
          const url = new URL(page.pageUrl);
          const pathParts = url.pathname.replace(/^\//, '').split('/');
          const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
          if (clIdx !== -1 && pathParts[clIdx + 1] === selectedCareer) return true;
        } catch {}
      }
      return false;
    });
    setPages(filtered);
    setSelectedPageId(filtered.length > 0 ? filtered[0].id : null);
    // Set originalState for undo (for all headings in all filtered pages)
    const orig = {};
    filtered.forEach(page => {
      orig[page.id] = {};
      ['title', 'summary', 'how to become', 'career-opportunities', 'Important Facts', 'leading institutes', 'entrance exam', 'work description', 'pros and cons'].forEach(heading => {
        if (page[heading] !== undefined) {
          orig[page.id][heading] = typeof page[heading] === 'string' ? page[heading] : JSON.stringify(page[heading], null, 2);
        }
      });
    });
    setOriginalState(orig);
  }, [selectedCareer, careerPages, showHiddenPages]);

  // Handle navigation from preview page with selected career
  useEffect(() => {
    if (location.state?.selectedCareer && careers.length > 0 && careerPages.length > 0) {
      const pageSlug = location.state.selectedCareer;
      
      // Find the page first
      const targetPage = careerPages.find(page => page.id === pageSlug);
      
      if (targetPage) {
        // Extract career category from the page's URL
        let careerCategory = null;
        
        if (targetPage.pageUrl) {
          try {
            const url = new URL(targetPage.pageUrl);
            const pathParts = url.pathname.replace(/^\//, '').split('/');
            const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
            if (clIdx !== -1 && pathParts[clIdx + 1]) {
              careerCategory = pathParts[clIdx + 1]; // This should be the main category like 'design'
            }
          } catch (e) {
            console.error('Error parsing URL:', e);
          }
        }
        
        // If we found a career category from URL, look for it in careers list
        if (careerCategory) {
          const matchingCareer = careers.find(career => 
            career.toLowerCase().replace(/\s+/g, '-') === careerCategory ||
            career.toLowerCase() === careerCategory ||
            careerCategory.includes(career.toLowerCase().replace(/\s+/g, '-')) ||
            career.toLowerCase().includes(careerCategory)
          );
          
          if (matchingCareer) {
            setSelectedCareer(matchingCareer);
            
            // Wait for the pages to be filtered and then select the specific page
            setTimeout(() => {
              setSelectedPageId(pageSlug);
              // Reset all sections to collapsed when switching from preview
              const newCollapsed = {};
              defaultHeadings.forEach(heading => {
                newCollapsed[heading] = true;
              });
              setCollapsedHeadings(newCollapsed);
            }, 100);
          }
        }
        
        // Fallback: if no career category found from URL, try to find by page.career field
        if (!careerCategory && targetPage.career && careers.includes(targetPage.career)) {
          setSelectedCareer(targetPage.career);
          setTimeout(() => {
            setSelectedPageId(pageSlug);
            // Reset all sections to collapsed when switching from preview
            const newCollapsed = {};
            defaultHeadings.forEach(heading => {
              newCollapsed[heading] = true;
            });
            setCollapsedHeadings(newCollapsed);
          }, 100);
        }
      }
      
      // Clear the location state to prevent re-selection on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, careers, careerPages]);

  // Check if there are any hidden pages for the selected career
  const hasHiddenPages = careerPages.some(page => {
    if (page.isActive === false) {
      // Check if this page belongs to the selected career
      if (page.career === selectedCareer) return true;
      if (page.pageUrl) {
        try {
          const url = new URL(page.pageUrl);
          const pathParts = url.pathname.replace(/^\//, '').split('/');
          const clIdx = pathParts.findIndex(p => p === 'careerlibrary');
          if (clIdx !== -1 && pathParts[clIdx + 1] === selectedCareer) return true;
        } catch {}
      }
    }
    return false;
  });

  const handlePageSelect = (pageId) => {
    setSelectedPageId(pageId);
    // Reset all sections to collapsed when switching pages
    const newCollapsed = {};
    defaultHeadings.forEach(heading => {
      newCollapsed[heading] = true;
    });
    setCollapsedHeadings(newCollapsed);
  };

  const handleEditChange = (pageId, heading, value) => {
    setEditState(prev => ({
      ...prev,
      [pageId]: { ...prev[pageId], [heading]: value }
    }));
  };

  // Undo changes for a heading (reset to original value)
  const handleUndo = (pageId, heading) => {
    setEditState(prev => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        [heading]: originalState[pageId]?.[heading] ?? ''
      }
    }));
  };

  // ...existing code...

  // Save all changed fields for the selected page at once
  const handleSaveAll = async () => {
    if (!selectedPage) return;
    const pageId = selectedPage.id;
    const changedFields = {};
    const orig = originalState[pageId] || {};
    const curr = editState[pageId] || {};
    ['title', 'summary', 'how to become', 'career-opportunities', 'Important Facts', 'leading institutes', 'entrance exam', 'work description', 'pros and cons'].forEach(heading => {
      if (selectedPage[heading] !== undefined) {
        const currVal = curr[heading] ?? (typeof selectedPage[heading] === 'string' ? selectedPage[heading] : JSON.stringify(selectedPage[heading], null, 2));
        if (currVal !== orig[heading]) {
          let value = currVal;
          if (typeof selectedPage[heading] !== 'string') {
            try { value = JSON.parse(currVal); } catch {}
          }
          changedFields[heading] = value;
        }
      }
    });
    if (Object.keys(changedFields).length === 0) {
      // If this is a new page and no changes, discard it
      if (pageId.startsWith('new_')) {
        setCareerPages(prev => prev.filter(p => p.id !== pageId));
        setPages(prev => prev.filter(p => p.id !== pageId));
        setSelectedPageId(pages.length > 0 ? pages[0].id : null);
        setEditState(prev => {
          const cp = { ...prev };
          delete cp[pageId];
          return cp;
        });
        setOriginalState(prev => {
          const cp = { ...prev };
          delete cp[pageId];
          return cp;
        });
      }
      return;
    }
    setSaving(prev => ({ ...prev, [pageId]: { ...prev[pageId], __all: true } }));
    try {
      if (pageId.startsWith('new_')) {
        // Save new page to Firestore with docID = pageNameSlug
        const fsDoc = doc;
        // Use the original slug to ensure consistency
        const pageNameSlug = selectedPage.originalSlug || selectedPage.title?.replace(/\s+/g, '-') || 'untitled';
        const pagesCol = collection(db, 'careerPages');
        const pageDocRef = fsDoc(pagesCol, pageNameSlug);
        const newPageData = {
          career: selectedCareer,
          pageUrl: `https://www.career-9.com/careerlibrary/${selectedCareer}/${pageNameSlug}`,
          isActive: true, // New pages are active by default
          timestamp: new Date().toISOString(),
          ...Object.fromEntries(['title', 'summary', 'how to become', 'career-opportunities', 'Important Facts', 'leading institutes', 'entrance exam', 'work description', 'pros and cons'].map(h => [h, curr[h] ?? '']))
        };
        await setDoc(pageDocRef, newPageData);
        const pageWithId = { ...newPageData, id: pageNameSlug };
        setCareerPages(prev => prev.map(p => p.id === pageId ? pageWithId : p));
        setPages(prev => prev.map(p => p.id === pageId ? pageWithId : p));
        setSelectedPageId(pageWithId.id);
        setOriginalState(prev => ({ ...prev, [pageWithId.id]: Object.fromEntries(['title', 'summary', 'how to become', 'career-opportunities', 'Important Facts', 'leading institutes', 'entrance exam', 'work description', 'pros and cons'].map(h => [h, pageWithId[h]])) }));
        setEditState(prev => {
          const cp = { ...prev };
          delete cp[pageId];
          return cp;
        });
        setOriginalState(prev => {
          const cp = { ...prev };
          delete cp[pageId];
          return cp;
        });
        // Also update savedUrls with matching docID
        const savedUrlsCol = collection(db, 'savedUrls');
        const urlDoc = fsDoc(savedUrlsCol, pageNameSlug);
        await setDoc(urlDoc, {
          pageUrl: newPageData.pageUrl,
          timestamp: new Date().toISOString()
        });
      } else {
        const pageDoc = doc(db, 'careerPages', pageId);
        const updatedFields = {
          ...changedFields,
          timestamp: new Date().toISOString()
        };
        await updateDoc(pageDoc, updatedFields);
        setPages(pgs => pgs.map(p => p.id === pageId ? { ...p, ...updatedFields } : p));
        setCareerPages(prev => prev.map(p => p.id === pageId ? { ...p, ...updatedFields } : p));
        // Update originalState to new values
        setOriginalState(prev => ({
          ...prev,
          [pageId]: {
            ...prev[pageId],
            ...Object.fromEntries(Object.entries(changedFields).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v, null, 2)]))
          }
        }));
      }
      
      // Show success alert
      const pageTitle = selectedPage.title || selectedPage.id;
      alert(`✅ Successfully saved changes to "${pageTitle}"!`);
    } catch (e) {
      alert('Failed to save: ' + e.message);
    }
    setSaving(prev => ({ ...prev, [pageId]: { ...prev[pageId], __all: false } }));
  };

  const handleDeletePage = async () => {
    if (!selectedPage) return;
    const pageId = selectedPage.id;
    const pageTitle = selectedPage.title || pageId;
    const isCurrentlyActive = selectedPage.isActive !== false; // Default to true if not set
    
    // Check if this is a new page that hasn't been saved yet
    if (pageId.startsWith('new_')) {
      const confirmMsg = `Are you sure you want to delete the new page "${pageTitle}"?\n\nThis page hasn't been saved yet, so it will be permanently removed.`;
      if (!window.confirm(confirmMsg)) return;
      
      // Remove the new page from local state only
      setCareerPages(prev => prev.filter(p => p.id !== pageId));
      setPages(prev => prev.filter(p => p.id !== pageId));
      
      // Clear edit and original state for this page
      setEditState(prev => {
        const newState = { ...prev };
        delete newState[pageId];
        return newState;
      });
      setOriginalState(prev => {
        const newState = { ...prev };
        delete newState[pageId];
        return newState;
      });
      
      // Select the first available page or clear selection
      const remainingPages = pages.filter(p => p.id !== pageId);
      setSelectedPageId(remainingPages.length > 0 ? remainingPages[0].id : null);
      return;
    }
    
    const action = isCurrentlyActive ? 'hide' : 'show';
    const confirmMsg = `Are you sure you want to ${action} the page "${pageTitle}"?\n\nThis will ${isCurrentlyActive ? 'hide the page from this career view but keep all data' : 'make the page visible again in this career view'}.`;
    if (!window.confirm(confirmMsg)) return;
    
    setDeleting(prev => ({ ...prev, [pageId]: { ...prev[pageId], __page: true } }));
    
    try {
      // Update the isActive flag instead of deleting
      const pageDoc = doc(db, 'careerPages', pageId);
      await updateDoc(pageDoc, { 
        isActive: !isCurrentlyActive,
        lastModified: new Date().toISOString()
      });
      
      // Update local state - remove from current view if hiding
      if (isCurrentlyActive) {
        // Hiding the page - remove from current view
        setCareerPages(prev => prev.map(p => 
          p.id === pageId ? { ...p, isActive: false, lastModified: new Date().toISOString() } : p
        ));
        setPages(prev => prev.filter(p => p.id !== pageId));
        
        // Clear edit and original state for this page
        setEditState(prev => {
          const newState = { ...prev };
          delete newState[pageId];
          return newState;
        });
        setOriginalState(prev => {
          const newState = { ...prev };
          delete newState[pageId];
          return newState;
        });
        
        // Select the first available page or clear selection
        const remainingPages = pages.filter(p => p.id !== pageId);
        setSelectedPageId(remainingPages.length > 0 ? remainingPages[0].id : null);
      } else {
        // Showing the page - update in place
        setCareerPages(prev => prev.map(p => 
          p.id === pageId ? { ...p, isActive: true, lastModified: new Date().toISOString() } : p
        ));
        setPages(prev => prev.map(p => 
          p.id === pageId ? { ...p, isActive: true, lastModified: new Date().toISOString() } : p
        ));
      }
      
    } catch (e) {
      alert(`Failed to ${action} page: ` + e.message);
    }
    
    setDeleting(prev => ({ ...prev, [pageId]: { ...prev[pageId], __page: false } }));
  };

  const selectedPage = pages.find(p => p.id === selectedPageId);

  return (
    <div className={styles.editCareersRoot} style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)', padding: '0' }}>
      <div className={styles.editCareersContainer} style={{background: '#fff', borderRadius: 18, boxShadow: '0 4px 32px 0 rgba(60,72,120,0.10)', padding: '40px 48px 48px 48px', minHeight: '700px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <h1 className={styles.title} style={{ textAlign: 'left', marginLeft: 0, fontSize: 32, fontWeight: 800, color: '#1e293b', marginBottom: 18, letterSpacing: '-1px' }}>
          Career Content Editor
        </h1>
        
        <div className={styles.careerSelectWrap} style={{ alignItems: 'flex-start', marginBottom: 28 }}>
          <label htmlFor="career-select" className={styles.careerSelectLabel} style={{ textAlign: 'left', marginLeft: 0, fontWeight: 600, fontSize: 18, color: '#334155', marginBottom: 8 }}>Select a Career</label>
          <select
            id="career-select"
            value={selectedCareer}
            onChange={e => setSelectedCareer(e.target.value)}
            className={styles.careerSelect}
            style={{ maxWidth: 340, fontSize: 17, padding: '10px 18px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#334155', fontWeight: 500, marginBottom: 0 }}
          >
            <option value="">-- Choose Career --</option>
            {careers.map(career => (
              <option key={career} value={career}>{career}</option>
            ))}
          </select>
        </div>
        {selectedCareer && (
          <>
            <div style={{ width: '100%', marginBottom: 28 }}>
              <div style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 12, margin: 0 }}>
                <ul className={styles.pagesList} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-start', margin: 0, width: 'auto' }}>
                  {pages.map(page => (
                    <li key={page.id} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      <button
                        className={styles.pageBtn + (selectedPageId === page.id ? ' selected' : '')}
                        onClick={() => handlePageSelect(page.id)}
                        style={{ 
                          minWidth: 140, 
                          fontSize: 16, 
                          fontWeight: 600, 
                          borderRadius: 8, 
                          padding: '10px 22px', 
                          background: selectedPageId === page.id ? '#6366f1' : (page.isActive === false ? '#f3f4f6' : '#e0e7ff'), 
                          color: selectedPageId === page.id ? '#fff' : (page.isActive === false ? '#6b7280' : '#373a47'), 
                          border: page.isActive === false ? '1px dashed #d1d5db' : 'none', 
                          boxShadow: selectedPageId === page.id ? '0 2px 8px 0 rgba(99,102,241,0.10)' : 'none', 
                          transition: 'all 0.2s',
                          opacity: page.isActive === false ? 0.7 : 1
                        }}
                      >
                        {page.isActive === false && '👁️‍🗨️ '}
                        {page.title || page.id}
                      </button>
                    </li>
                  ))}
                </ul>
                <div style={{ display: 'flex', alignItems: 'center', height: '100%', gap: 8 }}>
                  {hasHiddenPages && (
                    <button
                      type="button"
                      onClick={() => setShowHiddenPages(!showHiddenPages)}
                      style={{ 
                        padding: '8px 16px', 
                        borderRadius: 6, 
                        background: showHiddenPages ? '#6366f1' : '#f1f5f9', 
                        color: showHiddenPages ? '#fff' : '#374151', 
                        fontSize: 14, 
                        fontWeight: 600, 
                        border: '1px solid #d1d5db', 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title={showHiddenPages ? "Hide hidden pages" : "Show hidden pages"}
                    >
                      👁️ {showHiddenPages ? 'Hide Hidden' : 'Show Hidden'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleAddPage}
                    style={{ minWidth: 44, height: 44, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 28, fontWeight: 700, border: 'none', boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    title="Add New Page"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            {selectedPage && (
              <div className={styles.pageContentContainer} style={{ width: '100%', background: '#f8fafc', borderRadius: 14, boxShadow: '0 2px 12px 0 rgba(60,72,120,0.07)', padding: '32px 32px 24px 32px', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
                  <h2 style={{ fontWeight: 800, fontSize: 26, color: '#6366f1', margin: 0, letterSpacing: '-0.5px' }}>
                    {selectedPage.title || selectedPage.id}
                  </h2>
                  {selectedPage.timestamp && (
                    <div style={{ 
                      fontSize: 14, 
                      color: '#64748b', 
                      fontWeight: 500,
                      background: '#f1f5f9',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      Last updated: {formatTimestamp(selectedPage.timestamp)}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ marginBottom: 28 }}>
                  {/* Generate Banner Image Button */}
                  <button
                    onClick={openImageModal}
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 2px 8px 0 rgba(245,158,11,0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px 0 rgba(245,158,11,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px 0 rgba(245,158,11,0.2)';
                    }}
                  >
                    🎨 Generate Banner Image
                  </button>
                </div>

                {/* Show current banner image if exists */}
                {(bannerImages[selectedPage.id] || selectedPage.bannerImage) && (
                    <div style={{
                      marginTop: 16,
                      padding: 16,
                      background: '#fff',
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 1px 3px 0 rgba(0,0,0,0.1)',
                      marginBottom: 28
                    }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 600, color: '#374151' }}>
                        Current Banner Image
                      </h4>
                      <div style={{
                        width: '1536px',
                        height: '1024px',
                        maxWidth: '100%',
                        border: '1px solid #d1d5db',
                        borderRadius: 6,
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6',
                        transform: 'scale(0.26)', // Scale down to fit in the UI (works for both 1536x1024 and 1792x1024)
                        transformOrigin: 'top left',
                        marginBottom: '-760px' // Adjust for the scaled-down size
                      }}>
                        <img
                          src={bannerImages[selectedPage.id] || selectedPage.bannerImage}
                          alt="Current banner"
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover' // Crop the image to fit the aspect ratio
                          }}
                        />
                      </div>
                    </div>
                  )}

                {defaultHeadings.map(heading => (
                  <div key={heading} style={{ 
                    marginBottom: 16, 
                    background: '#fff', 
                    borderRadius: 10, 
                    boxShadow: collapsedHeadings[heading] ? '0 1px 3px 0 rgba(60,72,120,0.04)' : '0 1px 6px 0 rgba(60,72,120,0.06)', 
                    padding: '18px 22px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      fontWeight: 700, 
                      color: '#6366f1', 
                      fontSize: 18, 
                      marginBottom: collapsedHeadings[heading] ? 0 : 10,
                      cursor: 'pointer',
                      padding: '4px 0',
                      borderRadius: '6px',
                      transition: 'background-color 0.2s ease'
                    }}
                    onClick={() => toggleHeadingCollapse(heading)}
                    onMouseEnter={(e) => {
                      if (collapsedHeadings[heading]) {
                        e.currentTarget.style.backgroundColor = '#f1f5f9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    >
                      <button
                        type="button"
                        style={{
                          marginRight: 12,
                          background: 'none',
                          border: 'none',
                          fontSize: 18,
                          fontWeight: 600,
                          color: '#6366f1',
                          cursor: 'pointer',
                          padding: '4px',
                          transform: collapsedHeadings[heading] ? 'rotate(0deg)' : 'rotate(90deg)',
                          transition: 'transform 0.2s ease'
                        }}
                      >
                        ▶
                      </button>
                      <span style={{ flex: 1, userSelect: 'none' }}>
                        {heading.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {!collapsedHeadings[heading] && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUndo(selectedPage.id, heading);
                          }}
                          style={{
                            marginLeft: 10,
                            background: '#e0e7ff',
                            color: '#373a47',
                            border: 'none',
                            borderRadius: 6,
                            padding: '6px 18px',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            opacity: 1,
                            transition: 'opacity 0.2s, background 0.2s',
                            boxShadow: '0 1px 4px 0 rgba(99,102,241,0.07)'
                          }}
                          disabled={editState[selectedPage.id]?.[heading] === (originalState[selectedPage.id]?.[heading] ?? (typeof selectedPage[heading] === 'string' ? selectedPage[heading] : JSON.stringify(selectedPage[heading], null, 2)))}
                        >
                          Undo Changes
                        </button>
                      )}
                    </div>
                    {!collapsedHeadings[heading] && (
                      <>
                        {heading === 'title' ? (
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                            <textarea
                              value={editState[selectedPage.id]?.[heading] ?? selectedPage[heading] ?? ''}
                              onChange={e => handleEditChange(selectedPage.id, heading, e.target.value)}
                              className={styles.textarea}
                              style={{ width: '100%', minHeight: 80, marginBottom: 0, fontSize: 16, borderRadius: 8, border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#334155', padding: '12px 16px', fontWeight: 500, resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                              <button
                                type="button"
                                onClick={() => openAiModal(
                                  editState[selectedPage.id]?.[heading] ?? selectedPage[heading] ?? '',
                                  heading,
                                  (enhancedContent) => {
                                    handleEditChange(selectedPage.id, heading, enhancedContent);
                                  }
                                )}
                                style={{
                                  background: 'linear-gradient(135deg, #ac00fcff 0%, #9700bdff 100%)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '6px 12px',
                                  fontWeight: 600,
                                  fontSize: 12,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  boxShadow: '0 2px 4px 0 rgba(245,158,11,0.2)',
                                  transition: 'all 0.2s ease',
                                  alignSelf: 'flex-start'
                                }}
                                onMouseEnter={e => {
                                  e.target.style.transform = 'translateY(-1px)';
                                  e.target.style.boxShadow = '0 4px 8px 0 rgba(245,158,11,0.3)';
                                }}
                                onMouseLeave={e => {
                                  e.target.style.transform = 'translateY(0)';
                                  e.target.style.boxShadow = '0 2px 4px 0 rgba(245,158,11,0.2)';
                                }}
                              >
                                ✨ Magic
                              </button>
                            </div>
                          </div>
                        ) : (
                          <NestedEditor
                            value={(() => {
                              try {
                                const editValue = editState[selectedPage.id]?.[heading];
                                if (editValue !== undefined) {
                                  return typeof editValue === 'string' ? JSON.parse(editValue) : editValue;
                                }
                                return selectedPage[heading] || '';
                              } catch (error) {
                                console.warn('Failed to parse edit value for heading:', heading, error);
                                return selectedPage[heading] || '';
                              }
                            })()}
                            onChange={v => handleEditChange(selectedPage.id, heading, v)}
                            isTopLevel={true}
                            parentHeading={heading}
                            fieldKey={heading}
                            selectedCareer={selectedCareer}
                            onOpenAiModal={openAiModal}
                          />
                        )}
                      </>
                    )}
                  </div>
                ))}
                {/* Common Save All and Hide/Show Page buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, marginTop: 32 }}>
                  <button
                    onClick={handleDeletePage}
                    className={styles.deletePageBtn}
                    style={{ 
                      fontSize: 18, 
                      padding: '12px 32px', 
                      minWidth: 140, 
                      borderRadius: 8, 
                      background: selectedPage.isActive !== false ? '#dc2626' : '#059669', 
                      color: '#fff', 
                      fontWeight: 700, 
                      border: 'none', 
                      boxShadow: selectedPage.isActive !== false ? '0 2px 8px 0 rgba(220,38,38,0.15)' : '0 2px 8px 0 rgba(5,150,105,0.15)', 
                      letterSpacing: '0.5px', 
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    disabled={deleting[selectedPage.id]?.__page}
                    onMouseEnter={e => {
                      if (!deleting[selectedPage.id]?.__page) {
                        if (selectedPage.isActive !== false) {
                          e.target.style.background = '#b91c1c';
                          e.target.style.boxShadow = '0 4px 12px 0 rgba(220,38,38,0.25)';
                        } else {
                          e.target.style.background = '#047857';
                          e.target.style.boxShadow = '0 4px 12px 0 rgba(5,150,105,0.25)';
                        }
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!deleting[selectedPage.id]?.__page) {
                        if (selectedPage.isActive !== false) {
                          e.target.style.background = '#dc2626';
                          e.target.style.boxShadow = '0 2px 8px 0 rgba(220,38,38,0.15)';
                        } else {
                          e.target.style.background = '#059669';
                          e.target.style.boxShadow = '0 2px 8px 0 rgba(5,150,105,0.15)';
                        }
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {deleting[selectedPage.id]?.__page
                      ? (selectedPage.isActive !== false ? 'Deleting...' : 'Restoring...')
                      : (selectedPage.isActive !== false ? 'Delete' : 'Restore')
                    }
                  </button>
                  {/* Enhanced Preview Button */}
                  <button
                    onClick={() => {
                      // Get current state of the page (edited or original)
                      const currentPageData = {
                        ...selectedPage,
                        ...(editState[selectedPage.id] ? Object.fromEntries(
                          Object.entries(editState[selectedPage.id]).map(([key, value]) => {
                            if (typeof selectedPage[key] !== 'string' && value) {
                              try {
                                return [key, JSON.parse(value)];
                              } catch {
                                return [key, value];
                              }
                            }
                            return [key, value];
                          })
                        ) : {}),
                        ...(bannerImages[selectedPage.id] && { bannerImage: bannerImages[selectedPage.id] })
                      };
                      
                      // Store the data in sessionStorage for the preview page
                      sessionStorage.setItem('previewCareerData', JSON.stringify(currentPageData));
                      
                      // Navigate to preview page
                      navigate(`/preview-career/${selectedPage.id}`);
                    }}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '12px 24px',
                      fontWeight: 600,
                      fontSize: 16,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 2px 8px 0 rgba(99,102,241,0.2)',
                      transition: 'all 0.2s ease',
                      marginLeft: 8
                    }}
                    onMouseEnter={e => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px 0 rgba(99,102,241,0.3)';
                    }}
                    onMouseLeave={e => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px 0 rgba(99,102,241,0.2)';
                    }}
                  >
                    👁️ Preview Page
                  </button>
                  <button
                    onClick={handleSaveAll}
                    className={styles.saveBtn}
                    style={{ 
                      fontSize: 18, 
                      padding: '12px 44px', 
                      minWidth: 140, 
                      borderRadius: 8, 
                      background: '#6366f1', 
                      color: '#fff', 
                      fontWeight: 700, 
                      border: 'none', 
                      boxShadow: '0 2px 8px 0 rgba(99,102,241,0.10)', 
                      letterSpacing: '0.5px', 
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    disabled={(() => {
                      if (!selectedPage) return true;
                      const pageId = selectedPage.id;
                      const orig = originalState[pageId] || {};
                      const curr = editState[pageId] || {};
                      return !['title', 'summary', 'how to become', 'career-opportunities', 'Important Facts', 'leading institutes', 'entrance exam', 'work description', 'pros and cons'].some(heading => {
                        if (selectedPage[heading] !== undefined) {
                          const currVal = curr[heading] ?? (typeof selectedPage[heading] === 'string' ? selectedPage[heading] : JSON.stringify(selectedPage[heading], null, 2));
                          return currVal !== orig[heading];
                          
                        }
                        return false;
                      });
                    })() || saving[selectedPage.id]?.__all}
                    onMouseEnter={e => {
                      if (!saving[selectedPage.id]?.__all) {
                        e.target.style.background = '#5b5bf6';
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px 0 rgba(99,102,241,0.25)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!saving[selectedPage.id]?.__all) {
                        e.target.style.background = '#6366f1';
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px 0 rgba(99,102,241,0.10)';
                      }
                    }}
                  >
                    {saving[selectedPage.id]?.__all ? 'Saving...' : 'Save All Changes'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        
        <AIEnhancementModal
          isOpen={aiModal.isOpen}
          onClose={() => setAiModal({ ...aiModal, isOpen: false })}
          originalContent={aiModal.content}
          onApply={aiModal.onApply}
          fieldPath={aiModal.fieldPath}
          careerTitle={selectedPage?.title || selectedCareer}
        />

        <ImageGenerationModal
          isOpen={imageModal.isOpen}
          onClose={() => setImageModal({ isOpen: false })}
          careerTitle={selectedPage?.title || selectedCareer}
          careerDescription={selectedPage?.summary || selectedPage?.description || ''}
          onImageSelect={handleImageSelect}
          existingImageUrl={bannerImages[selectedPage?.id] || selectedPage?.bannerImage}
        />
        
        {/* Production Debugger - Remove this after debugging */}
        <ProductionDebugger />
      </div>
    </div>
  );
}

export default EditCareers;
