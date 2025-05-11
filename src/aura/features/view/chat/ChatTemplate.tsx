// src/aura/features/view/chat/ChatTemplate.tsx
import React, { useState, useEffect } from 'react';

interface ChatTemplateProps {
    onSendTemplate: (
        phoneNumber: string,
        ddi: string,
        templateId: string,
        params: string[]
    ) => void;
    onClose: () => void;
}

interface TemplateMessage {
    id: string;
    text: string;
    paramCount: number;
}

const availableTemplates: TemplateMessage[] = [
    { id: 'template_1', text: 'Seu código de identificação é {{1}}.', paramCount: 1 },
    { id: 'template_2', text: 'Olá {{1}}, sua fatura vence em {{2}}.', paramCount: 2 },
    { id: 'template_3', text: 'Bem-vindo à nossa plataforma! Seu onboarding começa agora.', paramCount: 0 },
];

const ChatTemplate: React.FC<ChatTemplateProps> = ({ onSendTemplate, onClose }) => {
    const [ddi, setDdi] = useState('+55');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [templateParams, setTemplateParams] = useState<string[]>([]);
    const [phoneError, setPhoneError] = useState<string | null>(null);

    const selectedTemplate = availableTemplates.find(t => t.id === selectedTemplateId);

    useEffect(() => {
        if (selectedTemplate) {
            setTemplateParams(Array(selectedTemplate.paramCount).fill(''));
        } else {
            setTemplateParams([]);
        }
    }, [selectedTemplate]);

    const handleParamChange = (index: number, value: string) => {
        const newParams = [...templateParams];
        newParams[index] = value;
        setTemplateParams(newParams);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber.trim()) {
            setPhoneError('Digite o número de telefone do contato.');
            return;
        }
        if (!selectedTemplate) {
            alert('Por favor, escolha uma mensagem de template.');
            return;
        }
        if (
            selectedTemplate.paramCount > 0 &&
            templateParams.some(p => !p.trim())
        ) {
            alert('Por favor, preencha todos os parâmetros do template.');
            return;
        }

        setPhoneError(null);
        onSendTemplate(
            phoneNumber,
            ddi,
            selectedTemplate.id,
            templateParams.slice(0, selectedTemplate.paramCount)
        );

        // limpar form (não fecha automaticamente)
        setPhoneNumber('');
        setSelectedTemplateId(null);
        setTemplateParams([]);
    };

    return (
        <div className="chat-template-panel">
            <div className="chat-template-header">
                <h2>Nova mensagem ativa</h2>
                <button
                    onClick={onClose}
                    className="chat-template-close-button"
                    title="Fechar"
                >
                    ❌
                </button>
            </div>

            <form onSubmit={handleSubmit} className="chat-template-form">
                <div className="chat-template-alert">
                    ⚠️ Certifique-se de que o número está correto
                </div>

                <div className="chat-template-field phone-field">
                    <label htmlFor="phoneNumber">Número de Telefone</label>
                    <div className="phone-input-group">
                        <select
                            id="phoneDdi"
                            value={ddi}
                            onChange={e => setDdi(e.target.value)}
                            className="phone-ddi-select"
                            aria-label="Código do país"
                        >
                            <option value="+55">+55 (Brasil)</option>
                            <option value="+1">+1 (EUA/Canadá)</option>
                            <option value="+44">+44 (Reino Unido)</option>
                        </select>
                        <input
                            type="tel"
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={e => {
                                setPhoneNumber(e.target.value.replace(/\D/g, ''));
                                if (phoneError) setPhoneError(null);
                            }}
                            placeholder="Número completo com DDD"
                            className="phone-number-input"
                            required
                            aria-label="Número de telefone"
                        />
                    </div>
                    {phoneError && (
                        <p className="chat-template-error-message">{phoneError}</p>
                    )}
                </div>

                <div className="chat-template-field">
                    <label className="template-section-label">
                        Escolha a mensagem desejada
                    </label>
                    <div className="template-options-list">
                        {availableTemplates.map(template => (
                            <div key={template.id} className="template-option">
                                <input
                                    type="radio"
                                    id={template.id}
                                    name="selectedTemplate"
                                    value={template.id}
                                    checked={selectedTemplateId === template.id}
                                    onChange={() => setSelectedTemplateId(template.id)}
                                    className="template-radio-input"
                                />
                                <label htmlFor={template.id} className="template-radio-label">
                                    {template.text.split(/\{\{\d+\}\}/g).map((part, idx, arr) => (
                                        <React.Fragment key={idx}>
                                            {part}
                                            {idx < template.paramCount && idx < arr.length - 1 && (
                                                <span className="template-param-placeholder">
                          {`{{${idx + 1}}}`}
                        </span>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedTemplate && selectedTemplate.paramCount > 0 && (
                    <div className="chat-template-field template-params-section">
                        <label className="template-section-label">
                            Preencha os parâmetros
                        </label>
                        {templateParams.map((_, index) => (
                            <div key={index} className="template-param-input-field">
                                <label htmlFor={`param-${index + 1}`}>
                                    Parâmetro {index + 1}:
                                </label>
                                <input
                                    type="text"
                                    id={`param-${index + 1}`}
                                    value={templateParams[index] || ''}
                                    onChange={e => handleParamChange(index, e.target.value)}
                                    placeholder={`Valor para {{${index + 1}}}`}
                                    className="template-param-input"
                                    required
                                />
                            </div>
                        ))}
                    </div>
                )}

                <button type="submit" className="chat-template-submit-button">
                    Enviar Template
                </button>
            </form>
        </div>
    );
};

export default ChatTemplate;
