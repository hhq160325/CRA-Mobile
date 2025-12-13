import React from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../../theme/colors';
import { styles } from '../messages.styles';

interface MessageFormProps {
    title: string;
    content: string;
    loading: boolean;
    onTitleChange: (text: string) => void;
    onContentChange: (text: string) => void;
    onSend: () => void;
}

export default function MessageForm({
    title,
    content,
    loading,
    onTitleChange,
    onContentChange,
    onSend
}: MessageFormProps) {
    return (
        <>
            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Subject</Text>
                <TextInput
                    value={title}
                    onChangeText={onTitleChange}
                    placeholder="Enter message subject"
                    placeholderTextColor={colors.placeholder}
                    style={styles.input}
                    editable={false}
                    multiline={true}
                    numberOfLines={3}
                />
            </View>

            <View style={styles.inputCard}>
                <Text style={styles.inputLabel}>Message</Text>
                <TextInput
                    value={content}
                    onChangeText={onContentChange}
                    placeholder="Type your message here..."
                    placeholderTextColor={colors.placeholder}
                    multiline
                    numberOfLines={8}
                    style={[styles.input, styles.textArea]}
                />
            </View>

            <View style={styles.infoBox}>
                <MaterialIcons
                    name="info"
                    size={20}
                    color={colors.morentBlue}
                    style={styles.infoIcon}
                />
                <Text style={styles.infoText}>
                    Your message will be sent to the car owner. They will be able to
                    respond to your inquiry.
                </Text>
            </View>

            <Pressable
                onPress={onSend}
                disabled={loading}
                style={[
                    styles.sendButton,
                    loading ? styles.sendButtonDisabled : styles.sendButtonActive,
                ]}>
                {loading ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <>
                        <MaterialIcons
                            name="send"
                            size={20}
                            color={colors.white}
                            style={styles.sendButtonIcon}
                        />
                        <Text style={styles.sendButtonText}>Send Message</Text>
                    </>
                )}
            </Pressable>
        </>
    );
}