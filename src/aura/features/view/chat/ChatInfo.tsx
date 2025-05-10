// src/aura/features/view/chat/ChatInfo.tsx
import React, { useState, useEffect } from 'react';
import { User, ContactSituation } from './types';

interface ChatInfoProps {
    contact?: User;
    onClose: () => void;
    onUpdateContactDetails: (
        contactId: string,
        details: Partial<Pick<User, 'observation' | 'situation'>>
    ) => void;
}

const ChatInfo: React.FC<ChatInfoProps> = ({
                                               contact,
                                               onClose,
                                               onUpdateContactDetails,
                                           }) => {
    const [observationText, setObservationText] = useState('');
    const [currentSituation, setCurrentSituation] = useState<ContactSituation | ''>('');
    const [isEditingObservation, setIsEditingObservation] = useState(false);

    useEffect(() => {
        if (contact) {
            setObservationText(contact.observation || '');
            setCurrentSituation(contact.situation || '');
            setIsEditingObservation(false);
        } else {
            setObservationText('');
            setCurrentSituation('');
            setIsEditingObservation(false);
        }
    }, [contact]);

    if (!contact) {
        return (
            <div className="chat-info-panel empty-info-panel">
                <div className="chat-info-header">
                    <h3>Dados do Cliente</h3>
                    <button
                        onClick={onClose}
                        className="chat-info-close-button"
                        title="Fechar"
                    >
                        <span className="chat-header-main-icon">❌</span>
                    </button>
                </div>
                <div className="chat-info-content-empty">
                    <p>Nenhum contato selecionado para exibir detalhes.</p>
                </div>
            </div>
        );
    }

    const handleSaveObservation = () => {
        onUpdateContactDetails(contact.id, { observation: observationText });
        setIsEditingObservation(false);
    };

    const handleSituationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSituation = e.target.value as ContactSituation;
        setCurrentSituation(newSituation);
        onUpdateContactDetails(contact.id, { situation: newSituation });
    };

    const situationOptions = [
        { value: '', label: 'Selecione...' },
        { value: 'aguardando', label: 'Aguardando' },
        { value: 'em_atendimento', label: 'Em Atendimento' },
        { value: 'resolvido', label: 'Resolvido' },
        { value: 'pendente', label: 'Pendente' },
    ];

    return (
        <div className="chat-info-panel">
            <div className="chat-info-header">
                <h3>Dados do Cliente</h3>
                <button
                    onClick={onClose}
                    className="chat-info-close-button"
                    title="Fechar Informações"
                >
                    <span className="chat-header-main-icon">❌</span>
                </button>
            </div>

            <div className="chat-info-content">
                <div className="chat-info-section observation-section">
                    <label
                        htmlFor="observation"
                        className="chat-info-label prominent"
                    >
                        Observação
                    </label>

                    {isEditingObservation ? (
                        <div className="chat-info-observation-edit">
                            <textarea
                                id="observation"
                                className="chat-info-textarea"
                                value={observationText}
                                onChange={e => setObservationText(e.target.value)}
                                rows={4}
                                placeholder="Adicione uma observação..."
                            />
                            <div className="chat-info-observation-actions">
                                <button
                                    onClick={handleSaveObservation}
                                    className="chat-info-action-button save"
                                    title="Salvar Observação"
                                >
                                    <span className="chat-edit-action-icon">💾</span> Salvar
                                </button>
                                <button
                                    onClick={() => {
                                        setIsEditingObservation(false);
                                        setObservationText(contact.observation || '');
                                    }}
                                    className="chat-info-action-button cancel"
                                    title="Cancelar Edição"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="chat-info-observation-display"
                            onClick={() => setIsEditingObservation(true)}
                            title="Clique para editar observação"
                            role="button"
                            tabIndex={0}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ')
                                    setIsEditingObservation(true);
                            }}
                        >
                            {observationText || (
                                <span className="chat-info-placeholder">
                                    Nenhuma observação. Clique para adicionar.
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="chat-info-field">
                    <label className="chat-info-label">Número de Telefone</label>
                    <div className="chat-info-value-box">
                        {contact.phoneNumber || 'Não informado'}
                    </div>
                </div>

                <div className="chat-info-field">
                    <label className="chat-info-label">
                        Quantidade de Mensagens
                    </label>
                    <div className="chat-info-value-box">
                        {contact.messageCount !== undefined
                            ? contact.messageCount.toLocaleString()
                            : 'N/A'}
                    </div>
                </div>

                <div className="chat-info-field">
                    <label className="chat-info-label">Status (Chat)</label>
                    <div
                        className={`chat-info-value-box status-box status-${contact.status
                            ?.toLowerCase()
                            .replace(' ', '-')}`}
                    >
                        {contact.status || 'Desconhecido'}
                    </div>
                </div>

                <div className="chat-info-field">
                    <label
                        htmlFor="situation"
                        className="chat-info-label"
                    >
                        Situação
                    </label>
                    <select
                        id="situation"
                        value={currentSituation}
                        onChange={handleSituationChange}
                        className="chat-info-select"
                    >
                        {situationOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ChatInfo;