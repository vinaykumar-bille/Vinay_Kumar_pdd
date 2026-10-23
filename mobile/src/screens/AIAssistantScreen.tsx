import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import mobileApi from '../services/api';

interface AIAssistantScreenProps {
  onSelectDepartment: (dept: string) => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendedDepartment?: string;
  isEmergency?: boolean;
}

export const AIAssistantScreen: React.FC<AIAssistantScreenProps> = ({ onSelectDepartment }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your MediBook AI Healthcare Assistant.\n\nDescribe your symptoms (e.g. 'sharp lower back pain', 'chest tightness', 'fever with cough') and I'll suggest the most relevant medical department and doctors for your appointment."
    }
  ]);
  const [loading, setLoading] = useState(false);

  const quickSymptoms = [
    "Severe headache and blurred vision",
    "Chronic knee pain when climbing stairs",
    "Persistent dry cough with high fever",
    "Itchy red skin rash on forearms",
    "Earache and ringing sound"
  ];

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const triage = await mobileApi.ai.triage(query);
      const isEmergency = triage.emergencyWarning || query.toLowerCase().includes("severe chest");

      const botReply: Message = {
        role: 'assistant',
        content: isEmergency
          ? `🚨 EMERGENCY WARNING: Your symptoms may indicate a critical emergency condition.\n\nPlease seek immediate local emergency medical services (Call 108/112) rather than waiting for an online scheduled appointment.\n\nIf stabilized, your symptoms generally fall under **${triage.recommendedDepartment}**.`
          : `Based on your symptoms, we recommend consulting our **${triage.recommendedDepartment}** department.\n\nReason: ${triage.explanation}\n\nWould you like to browse and book an available specialist in ${triage.recommendedDepartment}?`,
        recommendedDepartment: triage.recommendedDepartment,
        isEmergency
      };

      setMessages(prev => [...prev, botReply]);
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I am temporarily having trouble reaching the clinical NLP model. For general health checkups, please browse General Medicine."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Notice Banner */}
      <View style={styles.disclaimerBox}>
        <Text style={styles.disclaimerText}>
          ⚠️ AI Guidance is informational and does not replace certified professional medical judgment.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.chatContent}>
        {messages.map((msg, idx) => (
          <View
            key={idx}
            style={[
              styles.msgWrapper,
              msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper
            ]}
          >
            <View
              style={[
                styles.bubble,
                msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                msg.isEmergency && styles.emergencyBubble
              ]}
            >
              <Text
                style={[
                  styles.msgText,
                  msg.role === 'user' ? styles.userText : styles.assistantText,
                  msg.isEmergency && styles.emergencyText
                ]}
              >
                {msg.content}
              </Text>

              {msg.recommendedDepartment && !msg.isEmergency ? (
                <TouchableOpacity
                  style={styles.bookDeptBtn}
                  onPress={() => onSelectDepartment(msg.recommendedDepartment!)}
                >
                  <Text style={styles.bookDeptBtnText}>
                    📅 Browse {msg.recommendedDepartment} Doctors →
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}

        {loading ? (
          <View style={styles.loadingBubble}>
            <ActivityIndicator color="#0284c7" size="small" />
            <Text style={styles.loadingText}>Analyzing symptoms with clinical AI model...</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Quick Prompts */}
      <View style={styles.quickPromptsArea}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickSymptoms.map((symp, i) => (
            <TouchableOpacity
              key={i}
              style={styles.quickChip}
              onPress={() => handleSend(symp)}
            >
              <Text style={styles.quickChipText}>{symp}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Describe your symptoms here..."
          placeholderTextColor="#94a3b8"
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => handleSend()}
          disabled={loading || !input.trim()}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  disclaimerBox: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  disclaimerText: {
    fontSize: 9,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '600',
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  msgWrapper: {
    marginBottom: 12,
    flexDirection: 'row',
  },
  userWrapper: {
    justifyContent: 'flex-end',
  },
  assistantWrapper: {
    justifyContent: 'flex-start',
  },
  bubble: {
    borderRadius: 18,
    padding: 14,
    maxWidth: '85%',
  },
  userBubble: {
    backgroundColor: '#0284c7',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomLeftRadius: 4,
  },
  emergencyBubble: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  msgText: {
    fontSize: 12,
    lineHeight: 18,
  },
  userText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  assistantText: {
    color: '#0f172a',
    fontWeight: '500',
  },
  emergencyText: {
    color: '#b91c1c',
    fontWeight: '700',
  },
  bookDeptBtn: {
    backgroundColor: '#0284c7',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookDeptBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 8,
    width: '80%',
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 11,
    color: '#64748b',
    fontStyle: 'italic',
  },
  quickPromptsArea: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  quickChip: {
    backgroundColor: '#f1f5f9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
  },
  quickChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AIAssistantScreen;
