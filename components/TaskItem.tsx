import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task, Priority } from '../hooks/useTasks';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
    onPress: (task: Task) => void;
}

const getPriorityColor = (priority: Priority) => {
    switch (priority) {
        case Priority.P1: return '#FF5252'; // Red
        case Priority.P2: return '#FF9800'; // Orange
        case Priority.P3: return '#2196F3'; // Blue
        default: return '#888'; // Grey
    }
};

const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

    if (isToday) return 'Today';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function TaskItem({ task, onToggle, onDelete, onPress }: TaskItemProps) {
    const priorityColor = getPriorityColor(task.priority);
    const dateString = formatDate(task.dueDate);
    const isOverdue = task.dueDate && task.dueDate < Date.now() && !task.completed && dateString !== 'Today';

    return (
        <Pressable
            style={({ pressed }) => [
                styles.container,
                pressed && styles.pressed
            ]}
            onPress={() => onPress(task)}
        >
            <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => onToggle(task.id)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <View style={[
                    styles.checkboxRing,
                    { borderColor: task.completed ? '#888' : priorityColor },
                    task.completed && styles.checkboxChecked
                ]}>
                    {task.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
            </TouchableOpacity>

            <View style={styles.textContainer}>
                <Text style={[styles.title, task.completed && styles.completedText]}>
                    {task.title}
                </Text>
                {task.description ? (
                    <Text style={[styles.description, task.completed && styles.completedText]} numberOfLines={2}>
                        {task.description}
                    </Text>
                ) : null}

                <View style={styles.metaContainer}>
                    {dateString && (
                        <View style={styles.dateContainer}>
                            <Ionicons
                                name="calendar-outline"
                                size={12}
                                color={isOverdue ? '#FF5252' : '#666'}
                                style={{ marginRight: 4 }}
                            />
                            <Text style={[
                                styles.dateText,
                                isOverdue ? styles.overdueText : undefined,
                                task.completed ? styles.completedText : undefined
                            ]}>
                                {dateString}
                            </Text>
                        </View>
                    )}
                    {/* Project badge could go here if we pass project name */}
                </View>
            </View>

            <TouchableOpacity
                onPress={() => onDelete(task.id)}
                style={styles.deleteButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <Ionicons name="trash-outline" size={20} color="#FF5252" />
            </TouchableOpacity>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align to top for multi-line
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    pressed: {
        opacity: 0.9,
        transform: [{ scale: 0.99 }],
    },
    checkboxContainer: {
        marginRight: 12,
        marginTop: 2, // Align with title
    },
    checkboxRing: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#888',
        borderColor: '#888',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        marginTop: 6,
        alignItems: 'center',
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 12,
    },
    dateText: {
        fontSize: 12,
        color: '#666',
    },
    overdueText: {
        color: '#FF5252',
        fontWeight: '600',
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#AAA',
    },
    deleteButton: {
        padding: 8,
        marginTop: -4,
    },
});
