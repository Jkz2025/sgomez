import { useState } from 'react';
import { X, Brain, Send, Loader2, Calendar, Clock, User } from 'lucide-react';
import { sendMessageToAI } from '../Functions/openaiService';

const AsistenteIA = ({ onClose }) => {

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de IA. Puedo ayudarte a agendar citas, gestionar programas y responder preguntas. ¿En qué puedo ayudarte hoy?'
    }
  ]);
  
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

 const suggestedQuestions = [
  '¿Cuántas citas tengo pendientes?',
  '¿Cuántas citas he tenido este mes?',
  '¿Cuántos programas llevo en junio de 2025?',
  '¿Cuántos clientes tengo registrados?',
  'Dame un resumen de mis estadísticas',
  'Ayúdame a agendar un mantenimiento de los clientes que tengo pendientes '
];

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendMessageToAI([...messages, userMessage]);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu solicitud. Por favor intenta nuevamente.' }]);
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    handleSend();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold gradient-text flex items-center">
              <Brain className="w-6 h-6 mr-2" />
              Asistente IA
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-blue-200" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-xl ${
                  message.role === 'user'
                    ? 'bg-blue-600/30 border border-blue-500/30'
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  {message.role === 'assistant' ? (
                    <Brain className="w-4 h-4 text-purple-400" />
                  ) : (
                    <User className="w-4 h-4 text-blue-400" />
                  )}
                  <span className="text-sm font-medium text-blue-200">
                    {message.role === 'assistant' ? 'Asistente IA' : 'Tú'}
                  </span>
                </div>
                <p className="text-white whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 border border-white/20 p-4 rounded-xl">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  <span className="text-blue-200">Pensando...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10">
          {/* Preguntas sugeridas */}
          <div className="mb-4">
            <p className="text-blue-200 text-sm mb-3">Preguntas sugeridas:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm text-blue-200 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí..."
              className="input-field flex-1"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="gradient-button px-6 py-3 rounded-xl flex items-center space-x-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="hidden md:inline">Enviar</span>
            </button>
          </div>
          
          <div className="mt-4 bg-green-600/20 border border-green-500/30 rounded-lg p-4">
            <p className="text-green-200 text-sm">
              <strong className="text-white">✓ Integrado:</strong> Asistente IA conectado con ChatGPT (GPT-3.5-turbo). 
              Puedes pedirle ayuda para agendar citas, crear programas, gestionar clientes y más.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsistenteIA;
