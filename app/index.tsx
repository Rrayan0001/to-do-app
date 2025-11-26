import React, { useState, useMemo } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    StatusBar,
    TouchableOpacity,
    Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useTasks, Task, Priority } from '../hooks/useTasks';
import TaskItem from '../components/TaskItem';
import AddTaskModal from '../components/AddTaskModal';
import ProjectFilter from '../components/ProjectFilter';

import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
            shouldShowBanner: true,
            shouldShowList: true,
        }),
    });
}

export default function App() {
    const { tasks, projects, loading, addTask, updateTask, toggleTask, deleteTask } = useTasks();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

    const handleAddTask = () => {
        setEditingTask(null);
        setModalVisible(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setModalVisible(true);
    };

    const handleSubmitTask = (title: string, description?: string, dueDate?: number, priority?: Priority, projectId?: string) => {
        if (editingTask) {
            updateTask(editingTask.id, title, description, dueDate, priority, projectId);
        } else {
            addTask(title, description, dueDate, priority, projectId);
        }
    };

    const filteredAndSortedTasks = useMemo(() => {
        let result = [...tasks];

        // Filter by project
        if (selectedProjectId) {
            result = result.filter(t => t.projectId === selectedProjectId);
        }

        // Sort: Overdue first, then Priority (1 is high), then Date
        result.sort((a, b) => {
            // Completed last
            if (a.completed !== b.completed) return a.completed ? 1 : -1;

            // Overdue check
            const now = Date.now();
            const aOverdue = a.dueDate && a.dueDate < now;
            const bOverdue = b.dueDate && b.dueDate < now;
            if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

            // Priority (1 is highest, so ascending order)
            if (a.priority !== b.priority) return a.priority - b.priority;

            // Due Date (earliest first)
            if (a.dueDate && b.dueDate) return a.dueDate - b.dueDate;
            if (a.dueDate) return -1; // Has date comes before no date
            if (b.dueDate) return 1;

            // Created At (newest first)
            return b.createdAt - a.createdAt;
        });

        return result;
    }, [tasks, selectedProjectId]);

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={80} color="#DDD" />
            <Text style={styles.emptyText}>
                {selectedProjectId ? 'No tasks in this project.' : 'No tasks yet. Add one!'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5F7FA" />

            <View style={styles.header}>
                <Text style={styles.headerTitle}>Todo Vibes</Text>
            </View>

            <ProjectFilter
                projects={projects}
                selectedProjectId={selectedProjectId}
                onSelectProject={setSelectedProjectId}
            />

            <View style={styles.content}>
                <FlatList
                    data={filteredAndSortedTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TaskItem
                            task={item}
                            onToggle={toggleTask}
                            onDelete={deleteTask}
                            onPress={handleEditTask}
                        />
                    )}
                    contentContainerStyle={[
                        styles.listContent,
                        filteredAndSortedTasks.length === 0 && styles.listContentEmpty
                    ]}
                    ListEmptyComponent={!loading ? renderEmptyState : null}
                />
            </View>

            <TouchableOpacity
                style={styles.fab}
                onPress={handleAddTask}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>

            <AddTaskModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmitTask}
                initialTask={editingTask}
                projects={projects}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // Space for FAB
    },
    listContentEmpty: {
        flexGrow: 1,
        justifyContent: 'center',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.8,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 18,
        color: '#999',
        fontWeight: '500',
    },
    fab: {
        position: 'absolute',
        right: 24,
        bottom: 32,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#007AFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
