import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task, Priority, Project } from '../hooks/useTasks';

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (title: string, description?: string, dueDate?: number, priority?: Priority, projectId?: string) => void;
    initialTask?: Task | null;
    projects: Project[];
}

export default function AddTaskModal({ visible, onClose, onSubmit, initialTask, projects }: AddTaskModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
    const [priority, setPriority] = useState<Priority>(Priority.P4);
    const [projectId, setProjectId] = useState<string>('inbox');

    const [showDatePicker, setShowDatePicker] = useState(false);
    const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');

    useEffect(() => {
        if (visible) {
            if (initialTask) {
                setTitle(initialTask.title);
                setDescription(initialTask.description || '');
                setDueDate(initialTask.dueDate ? new Date(initialTask.dueDate) : undefined);
                setPriority(initialTask.priority);
                setProjectId(initialTask.projectId);
            } else {
                setTitle('');
                setDescription('');
                setDueDate(undefined);
                setPriority(Priority.P4);
                setProjectId('inbox');
            }
        }
    }, [visible, initialTask]);

    const handleSave = () => {
        if (!title.trim()) return;
        onSubmit(
            title,
            description,
            dueDate?.getTime(),
            priority,
            projectId
        );
        onClose();
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || dueDate;
        setShowDatePicker(Platform.OS === 'ios');
        if (currentDate) {
            setDueDate(currentDate);
            // If we just picked a date on Android, maybe ask for time? 
            // For now, let's keep it simple: manual toggle.
        }
    };

    const showMode = (currentMode: 'date' | 'time') => {
        setShowDatePicker(true);
        setDatePickerMode(currentMode);
    };

    const getPriorityColor = (p: Priority) => {
        switch (p) {
            case Priority.P1: return '#FF5252';
            case Priority.P2: return '#FF9800';
            case Priority.P3: return '#2196F3';
            default: return '#888';
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.overlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalContainer}>
                                <View style={styles.header}>
                                    <Text style={styles.headerTitle}>
                                        {initialTask ? 'Edit Task' : 'New Task'}
                                    </Text>
                                </View>

                                <ScrollView
                                    style={styles.scrollView}
                                    contentContainerStyle={styles.scrollContent}
                                    keyboardShouldPersistTaps="handled"
                                    showsVerticalScrollIndicator={false}
                                >
                                    <View style={styles.form}>
                                        <TextInput
                                            style={styles.inputTitle}
                                            placeholder="What needs to be done?"
                                            placeholderTextColor="#999"
                                            value={title}
                                            onChangeText={setTitle}
                                            autoFocus={true}
                                        />

                                        <TextInput
                                            style={styles.inputDesc}
                                            placeholder="Description"
                                            placeholderTextColor="#999"
                                            value={description}
                                            onChangeText={setDescription}
                                            multiline
                                        />

                                        <View style={styles.optionsRow}>
                                            {/* Date Picker */}
                                            <TouchableOpacity
                                                style={[styles.optionButton, dueDate && styles.optionButtonActive]}
                                                onPress={() => showMode('date')}
                                            >
                                                <Ionicons name="calendar-outline" size={20} color={dueDate ? '#007AFF' : '#666'} />
                                                <Text style={[styles.optionText, dueDate && styles.optionTextActive]}>
                                                    {dueDate ? dueDate.toLocaleDateString() : 'Date'}
                                                </Text>
                                            </TouchableOpacity>

                                            {/* Time Picker - Only show if date is selected */}
                                            {dueDate && (
                                                <TouchableOpacity
                                                    style={[styles.optionButton, styles.optionButtonActive, { marginLeft: 8 }]}
                                                    onPress={() => showMode('time')}
                                                >
                                                    <Ionicons name="time-outline" size={20} color="#007AFF" />
                                                    <Text style={[styles.optionText, styles.optionTextActive]}>
                                                        {dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </Text>
                                                </TouchableOpacity>
                                            )}

                                            {/* Priority Selector */}
                                            <View style={[styles.priorityContainer, { marginLeft: 'auto' }]}>
                                                {[Priority.P1, Priority.P2, Priority.P3, Priority.P4].map((p) => (
                                                    <TouchableOpacity
                                                        key={p}
                                                        style={[
                                                            styles.priorityButton,
                                                            priority === p && { backgroundColor: getPriorityColor(p) + '20', borderColor: getPriorityColor(p) }
                                                        ]}
                                                        onPress={() => setPriority(p)}
                                                    >
                                                        <Ionicons
                                                            name="flag"
                                                            size={16}
                                                            color={getPriorityColor(p)}
                                                        />
                                                    </TouchableOpacity>
                                                ))}
                                            </View>
                                        </View>

                                        {/* Project Selector */}
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectRow}>
                                            {projects.map((proj) => (
                                                <TouchableOpacity
                                                    key={proj.id}
                                                    style={[
                                                        styles.projectPill,
                                                        projectId === proj.id && { backgroundColor: proj.color + '20', borderColor: proj.color }
                                                    ]}
                                                    onPress={() => setProjectId(proj.id)}
                                                >
                                                    <Text style={[
                                                        styles.projectText,
                                                        projectId === proj.id && { color: proj.color, fontWeight: '700' }
                                                    ]}>
                                                        {proj.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>

                                        {showDatePicker && (
                                            <DateTimePicker
                                                value={dueDate || new Date()}
                                                mode={datePickerMode}
                                                display="default"
                                                onChange={onDateChange}
                                                minimumDate={new Date()}
                                            />
                                        )}
                                    </View>
                                </ScrollView>

                                <View style={styles.footer}>
                                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                        <Text style={styles.cancelButtonText}>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
                                        onPress={handleSave}
                                        disabled={!title.trim()}
                                    >
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    keyboardView: {
        width: '100%',
        flex: 1,
    },
    modalContainer: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        maxHeight: '80%',
    },
    scrollView: {
        maxHeight: '60%',
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        marginBottom: 16,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    form: {
        marginBottom: 20,
    },
    inputTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        padding: 8,
        color: '#333', // Explicit color for dark mode compatibility
    },
    inputDesc: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        padding: 8,
        minHeight: 40,
    },
    optionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 8,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    optionButtonActive: {
        borderColor: '#007AFF',
        backgroundColor: '#007AFF10',
    },
    optionText: {
        marginLeft: 6,
        color: '#666',
        fontWeight: '500',
    },
    optionTextActive: {
        color: '#007AFF',
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    priorityButton: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        backgroundColor: '#f5f5f5',
    },
    projectRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    projectPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        marginRight: 8,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    projectText: {
        fontSize: 13,
        color: '#666',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: '600',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        backgroundColor: '#007AFF',
        marginLeft: 10,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#B0C4DE',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
